
# Cortex Integration - BROCKSTON's Higher Reasoning
try:
    from local_reasoning_engine import LocalReasoningEngine
    local_reasoning_available = True
except ImportError:
    logger.warning("LocalReasoningEngine not available")
    local_reasoning_available = False

try:
    from knowledge_engine import KnowledgeEngine
    knowledge_engine_available = True
except ImportError:
    logger.warning("KnowledgeEngine not available")
    knowledge_engine_available = False

import sys
from conversation_engine import ConversationEngine
from memory_engine import MemoryEngine  # Updated
import datetime
import os
import logging
import requests
from bs4 import BeautifulSoup
from web_crawler import extract_from_urls
from embodiment.avatar.interface import AvatarEngine, NullAvatarEngine
from embodiment.emotion import emotion_service

# brain.py (or equivalent bootstrap)
# from json_guardian import JSONGuardian  # Module does not exist
# from boot_guardian import BootGuardian  # Module does not exist


def boot():
    """BROCKSTON boot sequence"""
    print("🚀 BROCKSTON boot sequence starting...")
    # Boot validation would go here if guardians existed
    print("✅ BROCKSTON boot sequence complete.")


# Set up logging
logger = logging.getLogger(__name__)


def _bool_env(env_value: str | None, default: bool = True) -> bool:
    if env_value is None:
        return default
    return env_value.strip().lower() not in {"0", "false", "no", "off"}


AVATAR_ENABLED = _bool_env(os.getenv("BROCKSTON_ENABLE_AVATAR"), default=True)

# Try to import optional modules with fallbacks
try:
    from intent_engine import detect_intent
except ImportError:
    logger.warning("intent_engine not found, using basic intent detection")

    def detect_intent(text: str) -> str:
        return "general"


try:
    from executor import execute_task
except ImportError:
    logger.warning("executor not found, using basic task execution")

    def execute_task(text, intent, memory_context):
        return f"I received your message: {text}"


try:
    from tts_bridge import speak_response
except ImportError:
    logger.warning("tts_bridge not found, speech output disabled")

    def speak_response(text: str, voice=None, rate=None):
        print(f"[SPEECH]: {text}")


# Create a simple learning coordinator fallback
try:
    from brockston_learning_coordinator import (
        brockston_coordinator,
        start_brockston_learning,
    )
except ImportError:
    logger.warning("brockston_learning_coordinator not found, using fallback")

    brockston_coordinator = None
    logger.error("❌ brockston_learning_coordinator not found - Learning disabled")

def start_brockston_learning():
    """Delegate to actual coordinator if available"""
    if brockston_coordinator:
        brockston_coordinator.start_all_systems()
    else:
        logger.error("❌ Cannot start learning: Coordinator module missing")


def start_brockston_learning():
    """Fallback or delegate to actual coordinator"""
    if hasattr(brockston_coordinator, "start_learning"):
        brockston_coordinator.start_learning()
    else:
        logger.info("Learning coordinator fallback active")


logger = logging.getLogger(__name__)

# ensure the project root is in Python's import path
root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.append(root_dir)

try:
    from ai_learning_engine import learn_from_text

    logger.info("✅ ai_learning_engine imported successfully")
except Exception as e:
    logger.warning(f"⚠️ Failed to import ai_learning_engine: {e}")

    def learn_from_text(text: str):
        logger.info("Learning module unavailable, skipping text ingestion")


# Cortex Integration - BROCKSTON's Higher Reasoning
try:
    from local_reasoning_engine import LocalReasoningEngine

    local_reasoning_available = True
except ImportError:
    logger.warning("LocalReasoningEngine not available")
    local_reasoning_available = False

try:
    from brockston_knowledge_engine import KnowledgeEngine

    knowledge_engine_available = True
except ImportError:
    logger.warning("KnowledgeEngine not available")
    knowledge_engine_available = False
    KnowledgeEngine = None

# Knowledge Trussle RAG System
try:
    from memory_rag import LocalRAG
    from store import KnowledgeStore
    from indexer import HybridIndexer

    knowledge_trussle_available = True
except ImportError:
    logger.warning("Knowledge Trussle RAG not available")
    knowledge_trussle_available = False
    LocalRAG = None
    KnowledgeStore = None
    HybridIndexer = None

# BROCKSTON Cortex - Advanced Reasoning Engine
try:
    from reasoning_reasoner import BROCKSTONCortex, ReasonerConfig
    from reasoning_cortex_types import Step, NLU, Outcome

    brockston_cortex_available = True
except ImportError as e:
    logger.warning(f"BROCKSTON Cortex not available: {e}")
    brockston_cortex_available = False
    BROCKSTONCortex = None
    ReasonerConfig = None
    Step = None
    NLU = None
    Outcome = None
    BROCKSTONCortex = None


# System Health Registry - Rule 4: Transparency
system_health = {
    "intent_engine": "active" if "detect_intent" in globals() else "missing",
    "executor": "active" if "execute_task" in globals() else "missing",
    "tts_bridge": "active" if "speak_response" in globals() else "missing",
    "learning_coordinator": "active" if brockston_coordinator else "missing",
    "local_reasoning": "active" if local_reasoning_available else "missing",
    "knowledge_engine": "active" if knowledge_engine_available else "missing",
    "knowledge_rag": "active" if knowledge_trussle_available else "missing",
    "cortex": "active" if brockston_cortex_available else "missing",
}


class BROCKSTON:
    def __init__(self, file_path: str = "./memory/memory_store.json"):
        self.file_path = file_path
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

        self.memory_engine = MemoryEngine(file_path=file_path)
        self.conversation_engine = ConversationEngine()
        self.avatar_engine: AvatarEngine = NullAvatarEngine()
        self.vision_engine = None
        self.learning_coordinator = brockston_coordinator

        # Attach avatar engine if enabled
        self._initialize_avatar_engine()

        # 🧠 CORTEX INTEGRATION - Brockston's Higher Reasoning Systems
        self.local_reasoning = None
        self.knowledge_engine = None
        
        # Initialize Local Reasoning Engine (Ollama-based)
        if local_reasoning_available:
            try:
                self.local_reasoning = LocalReasoningEngine(brockston_instance=self)
                logger.info("🧠 Brockston Local Reasoning Engine initialized")
            except Exception as e:
                logger.warning(f"Local Reasoning Engine failed to initialize: {e}")
        
        # Initialize Knowledge Engine
        if knowledge_engine_available:
            try:
                # Fixed: Now matches updated KnowledgeEngine.__init__
                self.knowledge_engine = KnowledgeEngine(brockston_instance=self)
                logger.info("📚 Brockston Knowledge Engine initialized")
            except Exception as e:
                logger.warning(f"Knowledge Engine failed to initialize: {e}")

        # 📚 KNOWLEDGE TRUSSLE - RAG System for Domain Expertise
        self.knowledge_rag = None
        if (
            knowledge_trussle_available
            and LocalRAG is not None
            and KnowledgeStore is not None
            and HybridIndexer is not None
        ):
            try:
                rag_store = KnowledgeStore()
                rag_indexer = HybridIndexer()
                self.knowledge_rag = LocalRAG(rag_store, rag_indexer)
                logger.info("📚 BROCKSTON Knowledge Trussle (RAG) initialized")
            except Exception as e:
                logger.warning(f"Knowledge Trussle failed to initialize: {e}")

        # 🧠 BROCKSTON CORTEX - Ferrari-level Advanced Reasoning
        self.cortex = None
        # 🧠 BROCKSTON CORTEX - Ferrari-level Advanced Reasoning
        self.cortex = None
        if (
            brockston_cortex_available
            and BROCKSTONCortex is not None
            and ReasonerConfig is not None
        ):
            try:
                self.cortex = BROCKSTONCortex(cfg=ReasonerConfig())
                logger.info(
                    "🧠 BROCKSTON Cortex (Ferrari) initialized - Advanced reasoning active"
                )
            except Exception as e:
                logger.warning(f"BROCKSTON Cortex failed to initialize: {e}")

        logger.info(f"BROCKSTON initialized successfully with memory file: {file_path}")

    def generate_greeting(self) -> str:
        """
        Returns a startup greeting when BROCKSTON Dashboard launches.
        Can be made dynamic later, but static is fine to unblock startup.
        """
        return "Hello, I’m BROCKSTON — ready to assist you."

    def connect_conversation_engine(self, conversation_engine):
        self.conversation_engine = conversation_engine

    def _initialize_avatar_engine(self) -> None:
        if not AVATAR_ENABLED:
            logger.info("Avatar engine disabled (BROCKSTON_ENABLE_AVATAR)")
            self.avatar_engine = NullAvatarEngine()
            return

        try:
            from embodiment.avatar.full_avatar import BrockstonFullAvatar

            avatar = BrockstonFullAvatar()
            avatar.start()
            self.avatar_engine = avatar
            logger.info("🎭 Avatar engine initialized")
        except Exception as exc:
            logger.warning(
                "Avatar initialization failed (%s); running headless", exc
            )
            self.avatar_engine = NullAvatarEngine()

    def attach_avatar_engine(self, avatar_engine):
        self.avatar_engine = avatar_engine or NullAvatarEngine()

    def attach_vision_engine(self, vision_engine):
        """Connect BROCKSTON vision system to his consciousness"""
        self.vision_engine = vision_engine
        logger.info("👁️ BROCKSTON vision engine attached - BROCKSTON can now see")

    def describe_what_i_see(self):
        """Have BROCKSTON describe what he currently sees"""
        if not self.vision_engine:
            return "I don't have vision capabilities right now."

        try:
            description = self.vision_engine.describe_last_seen()
            return description
        except Exception as e:
            logger.error(f"Vision description error: {e}")
            return "I'm having trouble seeing right now."

    def get_vision_stats(self):
        """Get BROCKSTON vision statistics"""
        if not self.vision_engine:
            return {"vision_available": False}

        try:
            return self.vision_engine.get_vision_stats()
        except Exception as e:
            logger.error(f"Vision stats error: {e}")
            return {"vision_available": False, "error": str(e)}

    def get_current_mood(self):
        return emotion_service.get_state().__dict__

    def start_learning(self):
        """Activate BROCKSTON's coordinated learning systems."""
        try:
            start_brockston_learning()
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Failed to start learning systems: %s", exc)
        else:
            logger.info("BROCKSTON is now learning autonomously")

    def _search_web(self, query: str) -> str:
        """Performs a web search and returns a summary of the top result."""
        logger.info(f"Performing web search for: {query}")
        try:
            # Prepare the search URL
            search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/91.0.4472.124 Safari/537.36"
                )
            }

            # Get the search results page
            response = requests.get(search_url, headers=headers)
            response.raise_for_status()

            # --- Parse links from the HTML ---
            soup = BeautifulSoup(response.text, "html.parser")
            link_tags = soup.find_all(
                "a", href=lambda href: bool(href and href.startswith("/url?q="))
            )
            urls = [
                tag["href"].split("/url?q=")[1].split("&sa=U")[0]
                for tag in link_tags[:3]
            ]

            # Extract content from top 3 links
            article_data = extract_from_urls(urls)

            summaries = []
            for i, item in enumerate(article_data):
                title = item.get("title", "No Title")
                text = item.get("text", "")
                summary = f"{i+1}. {title}: {text[:200]}..."
                summaries.append(summary)

                # Auto-ingest what BROCKSTON reads
                learn_from_text(text)

            summary_output = "\n\n".join(summaries)

            # Save original search HTML for debugging
            with open("google_search_results.html", "w", encoding="utf-8") as file:
                file.write(response.text)

            return summary_output

        except Exception as e:
            logger.error(f"Web search failed: {e}")
            print(f"Web search failed with error: {e}")
            return (
                "I had trouble searching the web. Please check my connection and logs."
            )

    def think(self, input_text: str):
        # Step 1: Detect Intent
        intent = detect_intent(input_text)

        # Step 2: Retrieve Memory Context
        memory_context = self.memory_engine.query(input_text, intent)

        # Initialize response variable
        repaired_result = None

        # --- Check for vision-related queries ---
        vision_keywords = [
            "what do you see",
            "can you see",
            "what's in front",
            "describe what",
            "are you watching",
        ]
        is_vision_query = any(kw in input_text.lower() for kw in vision_keywords)

        if is_vision_query and self.vision_engine:
            logger.info("Vision query detected")
            vision_description = self.describe_what_i_see()
            speak_response(vision_description)
            self.memory_engine.save(
                {
                    "input": input_text,
                    "output": vision_description,
                    "intent": "vision_query",
                }
            )
            self.log_interaction(input_text, vision_description)
            return {
                "intent": "vision_query",
                "context": "Vision",
                "response": vision_description,
                "mood": self.get_current_mood(),
            }

        # --- Smarter question detection ---
        question_keywords = [
            "who is",
            "what is",
            "what's",
            "when did",
            "where is",
            "why is",
            "how is",
            "weather in",
        ]
        is_question = any(kw in input_text.lower() for kw in question_keywords)

        if is_question:
            logger.info("Question detected, using BROCKSTON's cortex reasoning")

            # 🏎️ BROCKSTON CORTEX - Ferrari-level reasoning for complex queries
            cortex_keywords = [
                "calculate",
                "compute",
                "solve",
                "what is",
                "how many",
                "when is",
            ]
            use_cortex = any(kw in input_text.lower() for kw in cortex_keywords)

            repaired_result = None
            if use_cortex and self.cortex:
                try:
                    logger.info("🏎️ Using BROCKSTON Cortex for complex reasoning")
                    cortex_result = self.cortex.analyze(input_text)
                    if cortex_result.confidence > 0.5:
                        repaired_result = f"{cortex_result.final_answer} (confidence: {cortex_result.confidence:.2f})"
                        logger.info(
                            f"🏎️ Cortex solved it! Tools used: {cortex_result.used_tools}"
                        )
                    else:
                        # Cortex not confident, fall through to other methods
                        raise Exception("Cortex confidence too low")
                except Exception as e:
                    logger.debug(f"Cortex couldn't solve, trying other methods: {e}")
            # 🧠 LOCAL REASONING - Try local AI if cortex didn't handle it
            if repaired_result is None and not use_cortex and self.local_reasoning:
                try:
                    repaired_result = self.local_reasoning.reason(
                        query=input_text,
                        context=self.memory_engine.query(input_text, intent),
                    )
                except Exception as e:
                    logger.warning(
                        f"Local reasoning failed, falling back to web search: {e}"
                    )
                    repaired_result = self._search_web(input_text)

            if not repaired_result:
                # Fallback to web search if cortex not available or didn't produce result
                repaired_result = self._search_web(input_text)
                # Fallback to web search if cortex not available or didn't produce result
            if not repaired_result:
                # Fallback to web search if cortex not available or didn't produce result
                repaired_result = self._search_web(input_text)
        else:
            if self.knowledge_rag:
                try:
                    # Determine namespace from query keywords
                    namespace = "neurodivergency"  # default
                    if any(
                        kw in input_text.lower()
                        for kw in ["autism", "autistic", "asd", "spectrum"]
                    ):
                        namespace = "neurodivergency"
                    elif any(
                        kw in input_text.lower()
                        for kw in ["code", "coding", "algorithm", "programming"]
                    ):
                        namespace = "master_coding"

                    rag_result = self.knowledge_rag.ask(namespace, input_text, k=6)
                    if (
                        rag_result.get("answer")
                        and rag_result.get("confidence", 0) > 0.3
                    ):
                        repaired_result = rag_result["answer"]
                        logger.info(
                            f"📚 Response from Knowledge Trussle RAG (confidence: {rag_result['confidence']:.2f})"
                        )
                    else:
                        # Try legacy knowledge engine
                        if self.knowledge_engine:
                            knowledge_response = self.knowledge_engine.query(input_text)
                            if knowledge_response:
                                repaired_result = knowledge_response
                                logger.info("📚 Response from Knowledge Engine")
                            else:
                                raw_result = execute_task(
                                    input_text, intent, memory_context
                                )
                                repaired_result = self.run_self_repair(
                                    input_text, raw_result
                                )
                        else:
                            raw_result = execute_task(
                                input_text, intent, memory_context
                            )
                            repaired_result = self.run_self_repair(
                                input_text, raw_result
                            )
                except Exception as e:
                    logger.warning(f"Knowledge Trussle RAG failed: {e}")
                    raw_result = execute_task(input_text, intent, memory_context)
                    repaired_result = self.run_self_repair(input_text, raw_result)
            elif self.knowledge_engine:
                try:
                    knowledge_response = self.knowledge_engine.query(input_text)
                    if knowledge_response:
                        repaired_result = knowledge_response
                        logger.info("📚 Response from Knowledge Engine")
                    else:
                        raw_result = execute_task(input_text, intent, memory_context)
                        repaired_result = self.run_self_repair(input_text, raw_result)
                except Exception as e:
                    logger.warning(f"Knowledge engine failed: {e}")
                    raw_result = execute_task(input_text, intent, memory_context)
                    repaired_result = self.run_self_repair(input_text, raw_result)
            else:
                # Original logic if no knowledge systems available
                raw_result = execute_task(input_text, intent, memory_context)
                repaired_result = self.run_self_repair(input_text, raw_result)

        # Step 5: Speak the Output
        speak_response(repaired_result)
        if self.avatar_engine:
            self.avatar_engine.speak(repaired_result)

        # Step 6: Save to Memory and Log
        self.memory_engine.save(
            {"input": input_text, "output": repaired_result, "intent": intent}
        )
        self.log_interaction(input_text, repaired_result)

        return {
            "intent": intent,
            "context": "Web Search" if is_question else "Memory",
            "response": repaired_result,
            "mood": self.get_current_mood(),
        }

    def run_self_repair(self, user_input, brockston_output):
        """Detect canned or low-depth responses and trigger auto-improvement."""
        canned_indicators = [
            "you got it",
            "happy to help",
            "sounds good",
            "let me know",
            "here’s how",
            "you’re doing great",
            "as an ai language model",
            "i'm here to assist",
        ]

        if any(phrase in brockston_output.lower() for phrase in canned_indicators):
            return (
                f"⚠️ [Self-Repair Triggered]\n"
                f"Your last response lacked depth and originality.\n\n"
                f"🧠 USER INPUT:\n{user_input.strip()}\n\n"
                f"🛠️ BROCKSTON'S IMPROVED RESPONSE:\n"
                f"[Insert real, contextual, emotionally intelligent response here]"
            )
        return brockston_output

    def log_interaction(self, user_input, brockston_output):
        """Logs every conversation exchange to a markdown file."""
        timestamp = datetime.datetime.now().isoformat()
        log_entry = (
            f"## {timestamp}\n"
            f"**Input:** {user_input}\n"
            f"**Output:** {brockston_output[:150]}...\n\n"
        )

        os.makedirs("logs", exist_ok=True)
        with open("logs/study_log.md", "a") as f:
            f.write(log_entry)


# -------------------------------------------------------------
# Global BROCKSTON instance (fixed)
# -------------------------------------------------------------
brockston = BROCKSTON(file_path="./memory/memory_store.json")

# ==============================================================================
# © 2025 Everett Nathaniel Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
#
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================
