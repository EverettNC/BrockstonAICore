# ==============================================================================
# BROCKSTON brain_core.py
# © 2025 Everett Nathaniel Christman — The Christman AI Project / Luma Cognify AI
# All rights reserved.
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================

import sys
import os
import logging
import datetime
import requests
from bs4 import BeautifulSoup

# Ensure project root is on the import path
root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.append(root_dir)

logger = logging.getLogger(__name__)


def _bool_env(env_value: str | None, default: bool = True) -> bool:
    if env_value is None:
        return default
    return env_value.strip().lower() not in {"0", "false", "no", "off"}


AVATAR_ENABLED = _bool_env(os.getenv("BROCKSTON_ENABLE_AVATAR"), default=True)

# ---------------------------------------------------------------------------
# Core imports
# ---------------------------------------------------------------------------
from conversation_engine import ConversationEngine
from memory_engine import MemoryEngine
from embodiment.avatar.interface import AvatarEngine, NullAvatarEngine
from embodiment.emotion import emotion_service

# FIX 4: web_crawler wrapped so missing module doesn't crash boot
try:
    from web_crawler import extract_from_urls
except ImportError:
    logger.warning("web_crawler not found, URL extraction disabled")
    def extract_from_urls(urls):
        return []

# ---------------------------------------------------------------------------
# Optional imports with clean fallbacks
# ---------------------------------------------------------------------------

try:
    from crisis_detection import CrisisDetector
    _crisis_detector = CrisisDetector()
    logger.info("✅ CrisisDetector online")
except Exception as e:
    _crisis_detector = None
    logger.warning(f"[BrockstonCore] CrisisDetector OFFLINE: {e}")

try:
    from embodiment.voice.tone_manager import ToneManager
    _tone_manager = ToneManager()
    logger.info("✅ ToneManager online (embodiment.voice.tone_manager)")
except ImportError:
    try:
        from tone_manager import ToneManager
        _tone_manager = ToneManager()
        logger.info("✅ ToneManager online (flat import)")
    except Exception as e:
        _tone_manager = None
        logger.warning(f"[BrockstonCore] ToneManager OFFLINE: {e}")

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

try:
    from ai_learning_engine import learn_from_text
    logger.info("✅ ai_learning_engine imported successfully")
except Exception as e:
    logger.warning(f"⚠️ Failed to import ai_learning_engine: {e}")
    def learn_from_text(text: str):
        logger.info("Learning module unavailable, skipping text ingestion")

try:
    from brockston_learning_coordinator import (
        brockston_coordinator,
        start_brockston_learning as _start_learning_impl,
    )
except ImportError:
    logger.warning("brockston_learning_coordinator not found, learning disabled")
    brockston_coordinator = None
    def _start_learning_impl():
        logger.error("❌ Cannot start learning: Coordinator module missing")

def start_brockston_learning():
    """Delegate to actual coordinator if available."""
    _start_learning_impl()

try:
    from provider_router import ProviderRouter
    _provider_router = ProviderRouter()
    logger.info("✅ ProviderRouter online")
except Exception as e:
    _provider_router = None
    logger.warning(f"[BrockstonCore] ProviderRouter OFFLINE: {e}")

# Cortex / Reasoning
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

# FIX 4: store and indexer wrapped with fallbacks
try:
    from memory_rag import LocalRAG
    from store import KnowledgeStore
    from indexer import HybridIndexer
    knowledge_trussle_available = True
except ImportError as e:
    logger.warning(f"Knowledge Trussle RAG not available: {e}")
    knowledge_trussle_available = False
    LocalRAG = KnowledgeStore = HybridIndexer = None

# NOTE: reasoning_reasoner and reasoning_cortex_types are Derek's files
# (see DEAD_FILES_TO_DELETE.md). Wrapped in try/except so deletion won't
# crash boot. Remove this entire block after the git rm is complete.
try:
    from reasoning_reasoner import BROCKSTONCortex, ReasonerConfig
    from reasoning_cortex_types import Step, NLU, Outcome
    brockston_cortex_available = True
except ImportError as e:
    logger.warning(f"BROCKSTON Cortex not available: {e}")
    brockston_cortex_available = False
    BROCKSTONCortex = ReasonerConfig = Step = NLU = Outcome = None

# ---------------------------------------------------------------------------
# System Health Registry (Rule 4: Transparency)
# ---------------------------------------------------------------------------
system_health = {
    "crisis_detector":       "active" if _crisis_detector else "missing",
    "tone_manager":          "active" if _tone_manager else "missing",
    "provider_router":       "active" if _provider_router else "missing",
    "intent_engine":         "active" if "detect_intent" in globals() else "missing",
    "executor":              "active" if "execute_task" in globals() else "missing",
    "tts_bridge":            "active" if "speak_response" in globals() else "missing",
    "learning_coordinator":  "active" if brockston_coordinator else "missing",
    "local_reasoning":       "active" if local_reasoning_available else "missing",
    "knowledge_engine":      "active" if knowledge_engine_available else "missing",
    "knowledge_rag":         "active" if knowledge_trussle_available else "missing",
    "cortex":                "active" if brockston_cortex_available else "missing",
}


def boot():
    """BROCKSTON boot sequence."""
    print("🚀 BROCKSTON boot sequence starting...")
    print("✅ BROCKSTON boot sequence complete.")


# ===========================================================================
# BROCKSTON Class
# ===========================================================================
class BROCKSTON:
    def __init__(self, file_path: str = "./memory/memory_store.json"):
        self.file_path = file_path
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

        self.memory_engine = MemoryEngine(file_path=file_path)
        self.conversation_engine = ConversationEngine()
        self.avatar_engine: AvatarEngine = NullAvatarEngine()
        self.vision_engine = None
        self.learning_coordinator = brockston_coordinator

        self.tone_manager = _tone_manager
        self.provider_router = _provider_router

        # ── Local Reasoning Engine (Ollama-based) ──
        self.local_reasoning = None
        if local_reasoning_available:
            try:
                self.local_reasoning = LocalReasoningEngine(brockston_instance=self)
                logger.info("🧠 Brockston Local Reasoning Engine initialized")
            except Exception as e:
                logger.warning(f"Local Reasoning Engine failed to initialize: {e}")

        # ── Knowledge Engine ──
        self.knowledge_engine = None
        if knowledge_engine_available:
            try:
                self.knowledge_engine = KnowledgeEngine(brockston_instance=self)
                logger.info("📚 Brockston Knowledge Engine initialized")
            except Exception as e:
                logger.warning(f"Knowledge Engine failed to initialize: {e}")

        # ── Knowledge Trussle RAG ──
        self.knowledge_rag = None
        if (
            knowledge_trussle_available
            and LocalRAG is not None
            and KnowledgeStore is not None
            and HybridIndexer is not None
        ):
            try:
                self.knowledge_rag = LocalRAG(KnowledgeStore(), HybridIndexer())
                logger.info("📚 BROCKSTON Knowledge Trussle (RAG) initialized")
            except Exception as e:
                logger.warning(f"Knowledge Trussle failed to initialize: {e}")

        # ── BROCKSTON Cortex ──
        self.cortex = None
        if (
            brockston_cortex_available
            and BROCKSTONCortex is not None
            and ReasonerConfig is not None
        ):
            try:
                self.cortex = BROCKSTONCortex(cfg=ReasonerConfig())
                logger.info("🧠 BROCKSTON Cortex initialized — advanced reasoning active")
            except Exception as e:
                logger.warning(f"BROCKSTON Cortex failed to initialize: {e}")

        # ── Avatar Engine ──
        self._initialize_avatar_engine()

        logger.info(f"BROCKSTON initialized with memory file: {file_path}")

    # -----------------------------------------------------------------------
    # Startup / greeting
    # -----------------------------------------------------------------------
    def generate_greeting(self) -> str:
        return "Hello, I'm BROCKSTON — ready to assist you."

    def connect_conversation_engine(self, conversation_engine):
        self.conversation_engine = conversation_engine

    # -----------------------------------------------------------------------
    # Avatar / Vision
    # -----------------------------------------------------------------------
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
            logger.warning("Avatar initialization failed (%s); running headless", exc)
            self.avatar_engine = NullAvatarEngine()

    def attach_avatar_engine(self, avatar_engine):
        self.avatar_engine = avatar_engine or NullAvatarEngine()

    def attach_vision_engine(self, vision_engine):
        self.vision_engine = vision_engine
        logger.info("👁️ BROCKSTON vision engine attached")

    def describe_what_i_see(self):
        if not self.vision_engine:
            return "I don't have vision capabilities right now."
        try:
            return self.vision_engine.describe_last_seen()
        except Exception as e:
            logger.error(f"Vision description error: {e}")
            return "I'm having trouble seeing right now."

    def get_vision_stats(self):
        if not self.vision_engine:
            return {"vision_available": False}
        try:
            return self.vision_engine.get_vision_stats()
        except Exception as e:
            logger.error(f"Vision stats error: {e}")
            return {"vision_available": False, "error": str(e)}

    # -----------------------------------------------------------------------
    # Mood / Learning
    # -----------------------------------------------------------------------
    def get_current_mood(self):
        return emotion_service.get_state().__dict__

    def start_learning(self):
        try:
            start_brockston_learning()
        except Exception as exc:
            logger.error("Failed to start learning systems: %s", exc)
        else:
            logger.info("BROCKSTON is now learning autonomously")

    # -----------------------------------------------------------------------
    # Web search
    # -----------------------------------------------------------------------
    def _search_web(self, query: str) -> str:
        logger.info(f"Performing web search for: {query}")
        try:
            search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
            headers = {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/91.0.4472.124 Safari/537.36"
                )
            }
            response = requests.get(search_url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            link_tags = soup.find_all(
                "a", href=lambda href: bool(href and href.startswith("/url?q="))
            )
            urls = [
                tag["href"].split("/url?q=")[1].split("&sa=U")[0]
                for tag in link_tags[:3]
            ]
            article_data = extract_from_urls(urls)
            summaries = []
            for i, item in enumerate(article_data):
                title = item.get("title", "No Title")
                text = item.get("text", "")
                summaries.append(f"{i+1}. {title}: {text[:200]}...")
                learn_from_text(text)
            with open("google_search_results.html", "w", encoding="utf-8") as f:
                f.write(response.text)
            return "\n\n".join(summaries)
        except Exception as e:
            logger.error(f"Web search failed: {e}")
            return "I had trouble searching the web. Please check my connection and logs."

    # -----------------------------------------------------------------------
    # think() — main cognition loop
    # Step 0:   CrisisDetector  (Cardinal Rule 6)
    # Step 0.5: detect_intent
    # Step 1:   MemoryEngine + ToneManager context
    # Step 2:   LocalReasoningEngine (Ollama sovereign)
    # Step 3:   Web search (external knowledge)
    # Step 4:   ProviderRouter → Ollama direct → ConversationEngine → hardcoded
    # Step 5:   MemoryEngine.save() + learn_from_text() + log
    # -----------------------------------------------------------------------
    def think(self, input_text: str):
        # ── Step 0: Crisis Detection (Cardinal Rule 6 — MUST run first) ──
        if _crisis_detector:
            try:
                crisis = _crisis_detector.detect(input_text)
                if crisis and crisis.get("is_crisis"):
                    crisis_response = crisis.get(
                        "response",
                        "I hear you. You matter. Please reach out to a crisis line: 988."
                    )
                    speak_response(crisis_response)
                    self.memory_engine.save(
                        {"input": input_text, "output": crisis_response, "intent": "crisis"}
                    )
                    self.log_interaction(input_text, crisis_response)
                    return {
                        "intent": "crisis",
                        "context": "CrisisDetector",
                        "response": crisis_response,
                        "mood": self.get_current_mood(),
                    }
            except Exception as e:
                logger.warning(f"CrisisDetector check failed: {e}")

        # ── Step 0.5: Intent + emotional tone ──
        intent = detect_intent(input_text)
        tone_context = ""
        if self.tone_manager:
            try:
                tone_context = self.tone_manager.get_context()
            except Exception as e:
                logger.debug(f"ToneManager.get_context failed: {e}")

        # ── Step 1: Memory + vision shortcuts ──
        memory_context = self.memory_engine.query(input_text, intent)

        vision_keywords = [
            "what do you see", "can you see", "what's in front",
            "describe what", "are you watching",
        ]
        if any(kw in input_text.lower() for kw in vision_keywords) and self.vision_engine:
            logger.info("Vision query detected")
            vision_description = self.describe_what_i_see()
            speak_response(vision_description)
            self.memory_engine.save(
                {"input": input_text, "output": vision_description, "intent": "vision_query"}
            )
            self.log_interaction(input_text, vision_description)
            return {
                "intent": "vision_query",
                "context": "Vision",
                "response": vision_description,
                "mood": self.get_current_mood(),
            }

        repaired_result = None

        # ── Step 2: LocalReasoningEngine (Ollama sovereign) ──
        if self.local_reasoning:
            try:
                repaired_result = self.local_reasoning.reason(
                    query=input_text,
                    context=memory_context,
                )
                logger.info("🧠 Response from LocalReasoningEngine")
            except Exception as e:
                logger.warning(f"LocalReasoningEngine failed: {e}")
                repaired_result = None

        # ── Step 2b: Cortex for complex analytical queries ──
        cortex_keywords = ["calculate", "compute", "solve", "how many", "when is"]
        if repaired_result is None and self.cortex and any(
            kw in input_text.lower() for kw in cortex_keywords
        ):
            try:
                cortex_result = self.cortex.analyze(input_text)
                if cortex_result.confidence > 0.5:
                    repaired_result = (
                        f"{cortex_result.final_answer} "
                        f"(confidence: {cortex_result.confidence:.2f})"
                    )
                    logger.info(f"🏎️ Cortex answered. Tools: {cortex_result.used_tools}")
            except Exception as e:
                logger.debug(f"Cortex failed: {e}")

        # ── Step 2c: Knowledge RAG / Knowledge Engine ──
        if repaired_result is None and self.knowledge_rag:
            try:
                namespace = "neurodivergency"
                if any(kw in input_text.lower() for kw in ["code", "coding", "algorithm", "programming"]):
                    namespace = "master_coding"
                rag_result = self.knowledge_rag.ask(namespace, input_text, k=6)
                if rag_result.get("answer") and rag_result.get("confidence", 0) > 0.3:
                    repaired_result = rag_result["answer"]
                    logger.info(f"📚 Knowledge RAG answered (conf: {rag_result['confidence']:.2f})")
            except Exception as e:
                logger.warning(f"Knowledge RAG failed: {e}")

        if repaired_result is None and self.knowledge_engine:
            try:
                knowledge_response = self.knowledge_engine.query(input_text)
                if knowledge_response:
                    repaired_result = knowledge_response
                    logger.info("📚 Knowledge Engine answered")
            except Exception as e:
                logger.warning(f"Knowledge Engine failed: {e}")

        # ── Step 3: Web search for question-type queries ──
        question_keywords = [
            "who is", "what is", "what's", "when did", "where is",
            "why is", "how is", "weather in",
        ]
        is_question = any(kw in input_text.lower() for kw in question_keywords)
        if repaired_result is None and is_question:
            repaired_result = self._search_web(input_text)

        # ── Step 4: ProviderRouter → Ollama direct → ConversationEngine → hardcoded ──
        if repaired_result is None:
            if self.provider_router:
                try:
                    repaired_result = self.provider_router.route(
                        prompt=input_text,
                        memory_context=memory_context,
                        tone_context=tone_context,
                    )
                    logger.info("🔀 Response from ProviderRouter")
                except Exception as e:
                    logger.warning(f"ProviderRouter failed: {e}")

        if repaired_result is None:
            try:
                import requests as _req
                ollama_payload = {
                    "model": os.getenv("OLLAMA_MODEL", "llama3"),
                    "prompt": input_text,
                    "stream": False,
                }
                ollama_resp = _req.post(
                    os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate"),
                    json=ollama_payload,
                    timeout=30,
                )
                ollama_resp.raise_for_status()
                repaired_result = ollama_resp.json().get("response", "").strip()
                if repaired_result:
                    logger.info("🦙 Response from Ollama direct call")
            except Exception as e:
                logger.warning(f"Ollama direct call failed: {e}")

        if repaired_result is None:
            try:
                raw_result = execute_task(input_text, intent, memory_context)
                repaired_result = self.run_self_repair(input_text, raw_result)
                logger.info("💬 Response from ConversationEngine/executor")
            except Exception as e:
                logger.warning(f"ConversationEngine failed: {e}")

        if not repaired_result:
            repaired_result = (
                "I'm here, but I'm currently offline. "
                "Give me a moment and try again."
            )
            logger.warning("⚠️ All response pathways failed — returning offline message")

        # ── Step 5: Speak, save, learn ──
        speak_response(repaired_result)
        if self.avatar_engine:
            self.avatar_engine.speak(repaired_result)

        self.memory_engine.save(
            {"input": input_text, "output": repaired_result, "intent": intent}
        )
        learn_from_text(input_text)
        self.log_interaction(input_text, repaired_result)

        return {
            "intent": intent,
            "context": "Web Search" if is_question else "Memory",
            "response": repaired_result,
            "mood": self.get_current_mood(),
        }

    # -----------------------------------------------------------------------
    # Self-repair
    # FIX: removed literal placeholder string — now retries via Ollama or
    # returns a honest fallback. Rule 13: no fake responses.
    # -----------------------------------------------------------------------
    def run_self_repair(self, user_input: str, brockston_output: str) -> str:
        canned_indicators = [
            "you got it", "happy to help", "sounds good", "let me know",
            "here's how", "you're doing great", "as an ai language model",
            "i'm here to assist",
        ]
        if not any(phrase in brockston_output.lower() for phrase in canned_indicators):
            return brockston_output

        logger.warning("[Self-Repair] Canned response detected — attempting retry via Ollama")
        try:
            import requests as _req
            retry_prompt = (
                f"A child or neurodivergent user said: {user_input.strip()}\n"
                f"Respond with genuine warmth and specificity. "
                f"Do not use filler phrases. Be direct, honest, and present."
            )
            resp = _req.post(
                os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate"),
                json={
                    "model": os.getenv("OLLAMA_MODEL", "llama3"),
                    "prompt": retry_prompt,
                    "stream": False,
                },
                timeout=30,
            )
            resp.raise_for_status()
            retry_result = resp.json().get("response", "").strip()
            if retry_result:
                logger.info("[Self-Repair] Ollama retry succeeded")
                return retry_result
        except Exception as e:
            logger.warning(f"[Self-Repair] Ollama retry failed: {e}")

        # Honest fallback — Rule 13: never fake it
        return (
            "I want to give you a real answer, but I'm running into a problem right now. "
            "Can you tell me a little more? I'm listening."
        )

    # -----------------------------------------------------------------------
    # Logging
    # -----------------------------------------------------------------------
    def log_interaction(self, user_input, brockston_output):
        timestamp = datetime.datetime.now().isoformat()
        log_entry = (
            f"## {timestamp}\n"
            f"**Input:** {user_input}\n"
            f"**Output:** {brockston_output[:150]}...\n\n"
        )
        os.makedirs("logs", exist_ok=True)
        with open("logs/study_log.md", "a") as f:
            f.write(log_entry)


# ---------------------------------------------------------------------------
# FIX 5: Guard global instantiation — only create when run directly or
# explicitly requested, not on every import.
# ---------------------------------------------------------------------------
def get_brockston(file_path: str = "./memory/memory_store.json") -> "BROCKSTON":
    """Factory function — call this instead of importing 'brockston' directly."""
    return BROCKSTON(file_path=file_path)


if __name__ == "__main__":
    brockston = get_brockston()
    boot()
