"""
conversation_engine.py — BROCKSTON C v4.0.0
=================================
Processes text input, manages conversation context, and generates responses
for BROCKSTON using pattern-based intent recognition with optional Anthropic fallback.

Cleaned and hardened: May 2026
Cardinal Rule 1: It has to actually work.
Cardinal Rule 6: No silent failures.
Cardinal Rule 13: Honest about what this does and doesn't do.

© 2025 Everett Nathaniel Christman & The Christman AI Project
"How can we help you love yourself more?"
"""

# © 2025 The Christman AI Project. All rights reserved.
#
# This code is released as part of a trauma-informed, dignity-first AI ecosystem
# designed to protect, empower, and elevate vulnerable populations.
#
# By using, modifying, or distributing this software, you agree to uphold the following:
# 1. Truth — No deception, no manipulation.
# 2. Dignity — Respect the autonomy and humanity of all users.
# 3. Protection — Never use this to exploit or harm vulnerable individuals.
# 4. Transparency — Disclose all modifications and contributions clearly.
# 5. No Erasure — Preserve the mission and ethical origin of this work.
#
# This is not just code. This is redemption in code.
# Contact: lumacognify@thechristmanaiproject.com
# https://thechristmanaiproject.com

import json
import logging
import os
import random
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

# Initialize logger
logger = logging.getLogger(__name__)

# Try to import the emotion service from embodiment.
# If that module is unavailable or broken, fall back to a no-op so BROCKSTON keeps running.
try:
    from embodiment.emotion import emotion_service
    HAS_EMOTION_SERVICE = True
except Exception as e:
    logger.warning(
        f"[ConversationEngine] embodiment.emotion not available — emotion updates disabled: {e}"
    )
    emotion_service = None
    HAS_EMOTION_SERVICE = False

# Defer Anthropic client creation — avoids proxy/environment errors at import time.
# Client is initialized on first use if the API key is present.
try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    anthropic = None
    HAS_ANTHROPIC = False
    logger.info("[ConversationEngine] anthropic package not installed — will use pattern-based responses only")

ANTHROPIC_CLIENT = None


def _get_anthropic_client():
    """
    Lazily initialize the Anthropic client.
    Returns the client, or None if the API key is missing or initialization fails.
    """
    global ANTHROPIC_CLIENT
    if ANTHROPIC_CLIENT is not None:
        return ANTHROPIC_CLIENT

    if not HAS_ANTHROPIC:
        return None

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        logger.warning(
            "[ConversationEngine] ANTHROPIC_API_KEY not set in environment — "
            "advanced responses disabled. Set os.environ['ANTHROPIC_API_KEY'] to enable."
        )
        return None

    try:
        ANTHROPIC_CLIENT = anthropic.Anthropic(api_key=api_key)
        logger.info("[ConversationEngine] Anthropic client initialized successfully")
        return ANTHROPIC_CLIENT
    except Exception as e:
        logger.error(
            f"[ConversationEngine] _get_anthropic_client failed to initialize: {e}",
            exc_info=True,
        )
        return None


class ConversationEngine:
    """
    Main conversation engine that processes text input, manages context,
    and generates appropriate responses for BROCKSTON.

    Intent recognition is keyword/pattern-based (substring matching), NOT semantic
    or embedding-based. Anthropic Claude is used for responses when available and
    when the input exceeds 10 characters.

    TTS: BROCKSTON uses Polly via the Next.js /api/tts route. This module does not
    perform any voice synthesis.
    """

    def __init__(self, nonverbal_engine=None):
        """
        Initialize the conversation engine.

        Args:
            nonverbal_engine: Optional NonverbalEngine instance for multimodal communication.
        """
        self.nonverbal_engine = nonverbal_engine
        self.conversation_history: List[Dict[str, Any]] = []
        self.max_history_length = 20
        self.emotional_state = {
            "valence": 0.0,   # -1.0 to 1.0, negative to positive
            "arousal": 0.0,   # 0.0 to 1.0, calm to excited
            "dominance": 0.5, # 0.0 to 1.0, submissive to dominant
        }

        # Load language resources — fall back to built-in defaults on any file error
        self.intents = self._load_intents()
        self.responses = self._load_responses()
        self.language_map = self._load_language_map()

        self.current_topic: Optional[str] = None
        self.pending_questions: List[str] = []

        # Lightweight adaptation tracking
        self.adaptation_stats = {
            "intent_recognition": {"successes": 0, "failures": 0},
            "response_generation": {"successes": 0, "failures": 0},
        }

        logger.info("[ConversationEngine] Initialized")

    # ------------------------------------------------------------------
    # Resource loaders — each falls back to safe defaults on any I/O error
    # ------------------------------------------------------------------

    def _load_intents(self) -> Dict[str, Dict[str, Any]]:
        """Load intent definitions from data/intents.json, or use built-in defaults."""
        try:
            with open("data/intents.json", "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.info(f"[ConversationEngine] _load_intents using defaults ({e})")
            return {
                "greeting": {
                    "patterns": ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
                    "responses": ["Hello!", "Hi there!", "Greetings!"],
                    "context_required": False,
                },
                "farewell": {
                    "patterns": ["goodbye", "bye", "see you", "later", "good night"],
                    "responses": ["Goodbye!", "See you later!", "Until next time!"],
                    "context_required": False,
                },
                "help": {
                    "patterns": ["help", "assist", "support", "how do i", "what can you do"],
                    "responses": [
                        "I can help you communicate. Try using gestures or symbols!",
                        "I'm here to assist with communication needs.",
                        "I can interpret gestures, eye movements, and speech to help you express yourself.",
                    ],
                    "context_required": False,
                },
                "request_info": {
                    "patterns": ["what is", "how does", "can you explain", "tell me about"],
                    "responses": [
                        "I'll try to explain that for you.",
                        "Let me find information about that.",
                        "Here's what I know about that topic:",
                    ],
                    "context_required": True,
                },
                "express_needs": {
                    "patterns": ["i need", "i want", "i would like", "can i have"],
                    "responses": [
                        "I understand you need something.",
                        "Let me help you with that request.",
                        "I'll assist you with that need.",
                    ],
                    "context_required": True,
                },
            }

    def _load_responses(self) -> Dict[str, List[str]]:
        """Load response templates from data/responses.json, or use built-in defaults."""
        try:
            with open("data/responses.json", "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.info(f"[ConversationEngine] _load_responses using defaults ({e})")
            return {
                "fallback": [
                    "I'm not sure I understood that. Could you try again?",
                    "I'm still learning. Could you phrase that differently?",
                    "I didn't quite catch that. Could you explain it another way?",
                ],
                "clarification": [
                    "Could you provide more details about that?",
                    "I'd like to understand better. Can you tell me more?",
                    "Could you elaborate on that point?",
                ],
                "acknowledgment": ["I understand.", "Got it.", "I see what you mean."],
                "positive": ["That's great!", "Wonderful!", "Excellent!"],
                "negative": [
                    "I'm sorry to hear that.",
                    "That's unfortunate.",
                    "I understand this is difficult.",
                ],
                "encouragement": [
                    "You're doing great!",
                    "Keep going, you're making progress!",
                    "That's the right approach!",
                ],
            }

    def _load_language_map(self) -> Dict[str, Dict[str, Any]]:
        """Load language mapping from config/language_map.json, or use built-in defaults."""
        try:
            with open("config/language_map.json", "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.info(f"[ConversationEngine] _load_language_map using defaults ({e})")
            return {
                "en": {
                    "name": "English",
                    "greetings": ["Hello", "Hi", "Welcome"],
                    "farewells": ["Goodbye", "Bye", "See you later"],
                    "yes": ["Yes", "Yeah", "Correct"],
                    "no": ["No", "Nope", "Incorrect"],
                }
            }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process_text(
        self,
        input_text: str,
        user_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Process text input and generate a response.

        This is the primary entry point called by brockston_core.py.

        Args:
            input_text: Raw text from the user.
            user_id: Optional user identifier for personalization.
            context: Optional context dict (location, time, etc.).

        Returns:
            dict: At minimum {"message": str, "source": str}.
                  Also includes "intent", "confidence", "expression", "emotion_tier"
                  when pattern matching is used; "status" is always present.
        """
        if not input_text or not input_text.strip():
            logger.warning("[ConversationEngine] process_text called with empty input")
            return {
                "status": "error",
                "message": "I didn't receive any input. Could you try again?",
                "source": "fallback",
            }

        cleaned_text = input_text.strip().lower()
        logger.info(f"[ConversationEngine] process_text: {cleaned_text[:80]!r}")

        self.conversation_history.append({
            "role": "user",
            "text": cleaned_text,
            "timestamp": datetime.now().isoformat(),
        })
        self._trim_history()

        # Attempt Anthropic for any substantive input
        if HAS_ANTHROPIC and len(cleaned_text) > 10:
            client = _get_anthropic_client()
            if client is not None:
                try:
                    result = self._generate_advanced_response(cleaned_text, context)
                    self.conversation_history.append({
                        "role": "assistant",
                        "text": result["message"],
                        "intent": result.get("intent", "respond"),
                        "confidence": result.get("confidence", 0.95),
                        "timestamp": datetime.now().isoformat(),
                    })
                    return result
                except Exception as e:
                    logger.error(
                        f"[ConversationEngine] process_text Anthropic call failed: {e}",
                        exc_info=True,
                    )
                    # Fall through to pattern-based response

        # Pattern-based fallback
        intent, confidence, entities = self._identify_intent(cleaned_text)
        response_text, emotion, emotion_tier = self._generate_response(
            intent, cleaned_text, confidence, entities, context
        )

        self._update_emotional_state(intent, confidence)

        if HAS_EMOTION_SERVICE and emotion_service is not None:
            try:
                emotion_service.update_from_conversation(self.emotional_state)
            except Exception as e:
                logger.error(
                    f"[ConversationEngine] emotion_service.update_from_conversation failed: {e}",
                    exc_info=True,
                )

        self.conversation_history.append({
            "role": "assistant",
            "text": response_text,
            "intent": intent,
            "confidence": confidence,
            "timestamp": datetime.now().isoformat(),
        })

        return {
            "status": "success",
            "message": response_text,
            "source": "pattern_engine",
            "intent": intent,
            "confidence": confidence,
            "expression": emotion,
            "emotion_tier": emotion_tier,
        }

    def get_emotional_state(self) -> Dict[str, float]:
        """Return the current emotional state values."""
        return self.emotional_state

    def register_feedback(
        self, response_id: str, success: bool, feedback: Optional[str] = None
    ) -> None:
        """
        Register feedback about a response to update adaptation stats.

        Args:
            response_id: Identifier for the response being rated.
            success: Whether the response was considered successful.
            feedback: Optional free-text feedback.
        """
        if success:
            self.adaptation_stats["response_generation"]["successes"] += 1
        else:
            self.adaptation_stats["response_generation"]["failures"] += 1

        logger.info(
            f"[ConversationEngine] register_feedback response={response_id} "
            f"success={success} feedback={feedback!r}"
        )

    def save_models(self) -> None:
        """
        Persist learned conversation patterns to disk.

        Note: Currently a no-op — model persistence is not yet implemented.
        Logs the intent to save so the absence of data doesn't go unnoticed.
        """
        logger.info(
            "[ConversationEngine] save_models called — "
            "persistent model storage not yet implemented (BROCKSTON: save_models requires a "
            "storage backend — not yet implemented)"
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _generate_advanced_response(
        self, text: str, context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a response using Anthropic's Claude API.

        Args:
            text: Cleaned user input text.
            context: Optional context dict.

        Returns:
            dict: Response with "message", "source", "intent", "confidence",
                  "expression", "emotion_tier", "status".

        Raises:
            Exception: Propagates any Anthropic API errors to the caller for logging.
        """
        client = _get_anthropic_client()
        if client is None:
            raise RuntimeError("Anthropic client is not available")

        # Build windowed message history (last 5 turns, excluding the current one
        # which was appended before this call — so we take the last 5 of the prior history)
        prior_history = [
            e for e in self.conversation_history[:-1]
            if e["role"] in ("user", "assistant")
        ][-10:]

        messages = []
        for entry in prior_history:
            messages.append({
                "role": entry["role"],
                "content": entry["text"],
            })
        messages.append({"role": "user", "content": text})

        system_prompt = (
            "You are BROCKSTON C, a PhD-level AI researcher and advocate built to support "
            "autistic individuals, AAC users, nonverbal communicators, and the broader "
            "neurodivergent community. You are helpful, compassionate, and focused on "
            "understanding the user's needs. Keep your responses clear, concise, and "
            "conversational. Never condescend. Always dignify the person you're speaking with."
        )

        if context:
            context_str = ". ".join(f"{k}: {v}" for k, v in context.items())
            system_prompt += f" Context: {context_str}"

        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )

        message = response.content[0].text

        # Keyword-based tone detection — not semantic; labels are best-effort signals
        emotion_words = {
            "positive": ["happy", "great", "good", "excellent", "wonderful"],
            "negative": ["sorry", "unfortunate", "sad", "difficult", "problem"],
            "urgent": ["important", "critical", "urgent", "immediately", "crucial"],
            "inquisitive": ["curious", "wonder", "interesting", "question", "perhaps"],
        }
        emotion_counts = {emotion: 0 for emotion in emotion_words}
        for emotion, words in emotion_words.items():
            for word in words:
                emotion_counts[emotion] += message.lower().count(word)

        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
        if all(count == 0 for count in emotion_counts.values()):
            dominant_emotion = "neutral"

        if "!" in message or "URGENT" in message.upper():
            emotion_tier = "strong"
        elif any(word in message.lower() for word in ["very", "really", "extremely"]):
            emotion_tier = "moderate"
        else:
            emotion_tier = "mild"

        return {
            "status": "success",
            "message": message,
            "source": "anthropic",
            "intent": "respond",
            "confidence": 0.95,
            "expression": dominant_emotion,
            "emotion_tier": emotion_tier,
        }

    def _identify_intent(self, text: str) -> Tuple[str, float, Dict[str, Any]]:
        """
        Identify intent via substring pattern matching against loaded intent definitions.

        Note: This is keyword/substring matching, NOT semantic or embedding-based search.
        Confidence scores reflect pattern overlap, not linguistic understanding.

        Args:
            text: Lowercased, stripped user input.

        Returns:
            tuple: (intent_name, confidence_score, entities_dict)
        """
        best_intent = "unknown"
        best_confidence = 0.0
        entities: Dict[str, Any] = {}

        for intent_name, intent_data in self.intents.items():
            for pattern in intent_data.get("patterns", []):
                if pattern in text:
                    # Longer pattern matches signal higher specificity
                    confidence = 0.7 + (len(pattern) / len(text)) * 0.3
                    if confidence > best_confidence:
                        best_intent = intent_name
                        best_confidence = confidence

        # Simple keyword-based entity extraction
        common_entities = {
            "location": ["home", "school", "hospital", "outside", "inside"],
            "time": ["morning", "afternoon", "evening", "night", "now", "later"],
            "person": ["doctor", "nurse", "teacher", "mom", "dad", "caregiver"],
        }
        for entity_type, entity_values in common_entities.items():
            for value in entity_values:
                if value in text:
                    entities[entity_type] = value

        # Small random variation to reflect real-world uncertainty in pattern matching
        confidence_variation = random.uniform(-0.1, 0.1)
        best_confidence = min(0.99, max(0.2, best_confidence + confidence_variation))

        return best_intent, best_confidence, entities

    def _generate_response(
        self,
        intent: str,
        text: str,
        confidence: float,
        entities: Dict[str, Any],
        context: Optional[Dict[str, Any]],
    ) -> Tuple[str, str, str]:
        """
        Select and format a response string based on recognized intent.

        Args:
            intent: Matched intent name.
            text: Original user input.
            confidence: Confidence score from intent identification.
            entities: Extracted entity dict.
            context: Optional context information.

        Returns:
            tuple: (response_text, emotion_label, emotion_tier)
        """
        if intent in self.intents and "responses" in self.intents[intent]:
            response = random.choice(self.intents[intent]["responses"])
        elif confidence < 0.4:
            response = random.choice(self.responses["clarification"])
        else:
            response = random.choice(self.responses["fallback"])

        if intent in ("greeting", "help"):
            emotion = "positive"
            emotion_tier = "mild"
        elif intent == "farewell":
            emotion = "neutral"
            emotion_tier = "mild"
        elif intent == "express_needs":
            emotion = "positive" if confidence > 0.7 else "inquisitive"
            emotion_tier = "moderate"
        else:
            emotion = "neutral"
            emotion_tier = "mild"

        if entities and confidence > 0.6:
            entity_phrases = []
            for entity_type, entity_value in entities.items():
                if entity_type == "location":
                    entity_phrases.append(f"at {entity_value}")
                elif entity_type == "time":
                    entity_phrases.append(f"during the {entity_value}")
                elif entity_type == "person":
                    entity_phrases.append(f"with the {entity_value}")
            if entity_phrases:
                response = response.rstrip(".") + " " + " ".join(entity_phrases) + "."

        return response, emotion, emotion_tier

    def _update_emotional_state(self, intent: str, confidence: float) -> None:
        """
        Update the internal emotional state model based on the latest interaction.

        Args:
            intent: The identified intent.
            confidence: Confidence score.
        """
        intent_valence = {
            "greeting": 0.2,
            "farewell": 0.1,
            "help": 0.2,
            "request_info": 0.1,
            "express_needs": 0.0,
            "unknown": -0.1,
        }

        valence_impact = intent_valence.get(intent, 0.0) * confidence
        self.emotional_state["valence"] = max(
            -1.0, min(1.0, self.emotional_state["valence"] + valence_impact)
        )
        self.emotional_state["arousal"] = max(
            0.0, min(1.0, self.emotional_state["arousal"] + 0.1 * confidence)
        )

        dominance_impact = -0.05 * confidence if intent in ("express_needs", "request_info") else 0.0
        self.emotional_state["dominance"] = max(
            0.0, min(1.0, self.emotional_state["dominance"] + dominance_impact)
        )

    def _trim_history(self) -> None:
        """Trim conversation history to max_history_length entries."""
        if len(self.conversation_history) > self.max_history_length:
            self.conversation_history = self.conversation_history[-self.max_history_length:]


# ------------------------------------------------------------------
# Module-level singleton
# ------------------------------------------------------------------

_conversation_engine: Optional[ConversationEngine] = None


def get_conversation_engine(nonverbal_engine=None) -> ConversationEngine:
    """Return the module-level ConversationEngine singleton, creating it if needed."""
    global _conversation_engine
    if _conversation_engine is None:
        _conversation_engine = ConversationEngine(nonverbal_engine)
    return _conversation_engine


__all__ = ["get_conversation_engine", "ConversationEngine"]
