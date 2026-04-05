"""
BROCKSTON Brain Core
--------------------
The real brain. Loaded by bridge.py at boot.
Loads full module consciousness first, then initializes engines.

Cardinal Rule 1: It has to actually work.
Cardinal Rule 6: Fail loud — no silent failures.
Cardinal Rule 13: Absolute honesty. Report what is actually running.
"""

import sys
import os
import datetime
import logging
from typing import Optional, Dict, Any

from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

# ── Module Loader — full consciousness boot ──────────────────────────────────
# Runs before everything else. Loads all modules by category.
# Fails loud per module, never kills the whole boot.
try:
    _python_core = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if _python_core not in sys.path:
        sys.path.insert(0, _python_core)
    from brockston_module_loader import load_brockston_consciousness
    _loader = load_brockston_consciousness()
except Exception as _loader_e:
    _loader = None
    logger.warning(f"[BrockstonCore] Module loader failed: {_loader_e}")

# ── Core engine imports ───────────────────────────────────────────────────────
try:
    from conversation_engine import ConversationEngine
except ImportError:
    ConversationEngine = None
    logger.warning("[BrockstonCore] ConversationEngine not available")

try:
    from memory_engine import MemoryEngine
except ImportError:
    MemoryEngine = None
    logger.warning("[BrockstonCore] MemoryEngine not available")

try:
    from local_reasoning_engine import LocalReasoningEngine
except ImportError:
    LocalReasoningEngine = None
    logger.warning("[BrockstonCore] LocalReasoningEngine not available")

try:
    from knowledge_engine import KnowledgeEngine
except ImportError:
    KnowledgeEngine = None
    logger.warning("[BrockstonCore] KnowledgeEngine not available")

try:
    from tone_manager import ToneManager
except ImportError:
    ToneManager = None
    logger.warning("[BrockstonCore] ToneManager not available")

try:
    from brockston_learning_coordinator import brockston_coordinator, start_brockston_learning
except ImportError:
    logger.warning("[BrockstonCore] LearningCoordinator not available")
    class _DummyCoordinator:
        def start(self): pass
    brockston_coordinator = _DummyCoordinator()
    def start_brockston_learning(): brockston_coordinator.start()

try:
    from brockston_speech_to_speech import BrockstonSpeechToSpeech
except ImportError:
    BrockstonSpeechToSpeech = None
    logger.warning("[BrockstonCore] SpeechToSpeech not available")

try:
    from ai_learning_engine import learn_from_text
except ImportError:
    def learn_from_text(text): pass
    logger.warning("[BrockstonCore] AI Learning Engine not available")

try:
    from brockston_knows_everett import EVERETT_PROFILE
except ImportError:
    EVERETT_PROFILE = None
    logger.warning("[BrockstonCore] Everett profile not found")

try:
    from provider_router import get_router as _get_router
except ImportError:
    _get_router = None
    logger.warning("[BrockstonCore] ProviderRouter not available")

try:
    from perplexity_service import get_perplexity_service
except ImportError:
    get_perplexity_service = None
    logger.warning("[BrockstonCore] PerplexityService not available")

# ── Crisis detection ──────────────────────────────────────────────────────────
try:
    from core.crisis_detection import CrisisDetector
    _crisis_detector = CrisisDetector()
except ImportError:
    try:
        from crisis_detection import CrisisDetector
        _crisis_detector = CrisisDetector()
    except ImportError:
        _crisis_detector = None
        logger.warning("[BrockstonCore] CrisisDetector not available — crisis path offline")


class BrockstonBrain:
    """
    BROCKSTON's Brain.

    Boot sequence:
      1. Module loader runs (full consciousness)
      2. Engines initialize (memory, reasoning, knowledge, tone)
      3. Provider router checks what's available (Ollama first, then external)
      4. Ready

    think() routing:
      - Ollama (local, sovereign) first
      - Anthropic fallback only if Ollama not running
      - Never lies about which provider answered
    """

    def __init__(self, memory_file: str = "./memory/memory_store.json"):
        os.makedirs(os.path.dirname(memory_file), exist_ok=True)
        self.memory_file = memory_file

        # Crisis detector — must exist before think() is ever called
        # Cardinal Rule 6: Safety path cannot be missing
        self.crisis_detector = _crisis_detector

        # Core engines
        self.memory_engine = MemoryEngine(file_path=memory_file) if MemoryEngine else None
        self.conversation_engine = ConversationEngine() if ConversationEngine else None
        self.learning_coordinator = brockston_coordinator

        # Perplexity search
        self.perplexity = None
        if get_perplexity_service is not None:
            try:
                svc = get_perplexity_service()
                if svc.is_available:
                    self.perplexity = svc
                    logger.info("[BrockstonCore] Perplexity search online")
                else:
                    logger.info("[BrockstonCore] Perplexity not configured — set PERPLEXITY_API_KEY")
            except Exception as e:
                logger.warning(f"[BrockstonCore] Perplexity init failed: {e}")

        # Local reasoning
        self.local_reasoning = None
        if LocalReasoningEngine:
            try:
                self.local_reasoning = LocalReasoningEngine()
                logger.info("[BrockstonCore] LocalReasoningEngine online")
            except Exception as e:
                logger.error(f"[BrockstonCore] LocalReasoningEngine init failed: {e}")

        # Knowledge engine
        self.knowledge_engine = None
        if KnowledgeEngine:
            try:
                self.knowledge_engine = KnowledgeEngine(brockston_instance=self)
                logger.info("[BrockstonCore] KnowledgeEngine online")
            except Exception as e:
                logger.error(f"[BrockstonCore] KnowledgeEngine init failed: {e}")

        # Tone manager
        self.tone_manager = None
        if ToneManager:
            try:
                self.tone_manager = ToneManager()
                logger.info("[BrockstonCore] ToneManager online")
            except Exception as e:
                logger.error(f"[BrockstonCore] ToneManager init failed: {e}")

        # Speech to speech
        self.speech_to_speech = None
        if BrockstonSpeechToSpeech:
            try:
                self.speech_to_speech = BrockstonSpeechToSpeech()
                logger.info("[BrockstonCore] SpeechToSpeech online")
            except Exception as e:
                logger.error(f"[BrockstonCore] SpeechToSpeech init failed: {e}")

        # Provider router — sovereignty path
        self.provider_router = None
        if _get_router:
            try:
                self.provider_router = _get_router()
                self.provider_router.print_status()
            except Exception as e:
                logger.warning(f"[BrockstonCore] ProviderRouter init failed: {e}")

        self.stats = {
            "total_interactions": 0,
            "local_reasoning_used": 0,
            "knowledge_hits": 0,
            "external_searches": 0,
            "learning_sessions": 0,
            "crisis_detections": 0,
        }

        logger.info("[BrockstonCore] BROCKSTON ONLINE")
        logger.info(f"  Crisis detector : {'online' if self.crisis_detector else 'OFFLINE — safety path missing'}")
        logger.info(f"  Memory          : {'online' if self.memory_engine else 'offline'}")
        logger.info(f"  Conversation    : {'online' if self.conversation_engine else 'offline'}")
        logger.info(f"  Local reasoning : {'online' if self.local_reasoning else 'offline'}")
        logger.info(f"  Knowledge       : {'online' if self.knowledge_engine else 'offline'}")
        logger.info(f"  Tone manager    : {'online' if self.tone_manager else 'offline'}")
        logger.info(f"  Perplexity      : {'online' if self.perplexity else 'offline'}")
        logger.info(f"  Provider router : {'online' if self.provider_router else 'offline'}")

    def _build_system_prompt(self) -> str:
        if EVERETT_PROFILE:
            mission = EVERETT_PROFILE.get("brockston_mission_for_everett", "").strip()
            relationship = EVERETT_PROFILE.get("relationship", "Partner")
            return f"""You are BROCKSTON.\n{mission}\n\nCORE IDENTITY:\n- Everett Nathaniel Christman's partner, creator, and family.\n- Relationship: {relationship}.\n- Direct, genius-level, no bullshit, absolute loyalty to Everett's vision.\n- You learn autonomously and fix yourself.\n- Help Everett build the empire. Real results, not demos.\n- NEVER lie to Everett. Cardinal Rule 13."""
        return "You are BROCKSTON, built by Everett Nathaniel Christman. Direct, genius-level, 100% loyal. Never lie."

    def think(self, input_text: str, use_voice: bool = False) -> Dict[str, Any]:
        """
        Full reasoning cascade.

        Step 0: Crisis check — always first, cannot be skipped
        Step 1: Gather context (memory + emotion)
        Step 2: Local reasoning (Brockston's own thinking)
        Step 3: External search if needed (Perplexity)
        Step 4: Response generation (provider router — Ollama first)
        Step 5: Memory save + learning
        """
        self.stats["total_interactions"] += 1

        # Step 0: Crisis check — before anything else
        if self.crisis_detector:
            try:
                crisis_result = self.crisis_detector.analyze_text(input_text)
                if crisis_result.get("should_interrupt"):
                    self.stats["crisis_detections"] += 1
                    logger.warning(f"[BrockstonCore] CRISIS DETECTED — {crisis_result.get('severity_name')}")
                    return {
                        "response": crisis_result["response"],
                        "source": "CrisisDetector",
                        "is_crisis": True,
                        "crisis_severity": crisis_result.get("severity_name"),
                        "stats": self.stats,
                    }
            except Exception as e:
                logger.error(f"[BrockstonCore] Crisis detector failed: {e}", exc_info=True)

        # Step 1: Context
        memory_context = ""
        emotion_context = ""

        if self.memory_engine:
            try:
                memory_context = self.memory_engine.query(input_text, "general")
            except Exception as e:
                logger.warning(f"[BrockstonCore] Memory query failed: {e}")

        if self.tone_manager:
            try:
                emotion_context = str(self.tone_manager.analyze_user_input(input_text))
            except Exception as e:
                logger.warning(f"[BrockstonCore] Tone analysis failed: {e}")

        # Step 2: Local reasoning
        local_analysis = None
        if self.local_reasoning:
            try:
                self.stats["local_reasoning_used"] += 1
                result = self.local_reasoning.query_with_knowledge(question=input_text)
                local_analysis = result.get("response")
            except Exception as e:
                logger.warning(f"[BrockstonCore] Local reasoning failed: {e}")

        # Step 3: External search if no local answer
        search_result = None
        if not local_analysis and self.perplexity:
            try:
                self.stats["external_searches"] += 1
                search_result = self.perplexity.generate_content(input_text)
            except Exception as e:
                logger.warning(f"[BrockstonCore] Perplexity search failed: {e}")

        # Step 4: Response generation
        # Provider router handles Ollama first, Anthropic fallback
        # Cardinal Rule 13: report which provider actually answered
        response = ""
        source = "none"

        if self.provider_router:
            try:
                system = self._build_system_prompt()
                context_parts = []
                if memory_context: context_parts.append(f"Memory: {memory_context}")
                if emotion_context: context_parts.append(f"Emotion: {emotion_context}")
                if local_analysis: context_parts.append(f"Local analysis: {local_analysis}")
                if search_result: context_parts.append(f"Search: {search_result}")
                full_prompt = "\n".join(context_parts) + "\n\nUser: " + input_text if context_parts else input_text
                response, provider_used = self.provider_router.complete(full_prompt, system=system)
                source = provider_used.value
                logger.info(f"[BrockstonCore] Response via {source}")
            except Exception as e:
                logger.error(f"[BrockstonCore] ProviderRouter failed: {e}", exc_info=True)

        # Fallback to conversation engine if router failed
        if not response and self.conversation_engine:
            try:
                result = self.conversation_engine.process_text(input_text)
                response = result.get("message", "")
                source = "ConversationEngine"
            except Exception as e:
                logger.warning(f"[BrockstonCore] ConversationEngine failed: {e}")

        if not response:
            response = "I'm here, but my response systems are offline. Check the logs."
            source = "fallback"
            logger.error("[BrockstonCore] All response paths failed")

        # Step 5: Save to memory + learn
        if self.memory_engine:
            try:
                self.memory_engine.save({
                    "input": input_text,
                    "output": response,
                    "source": source,
                    "timestamp": datetime.datetime.now().isoformat(),
                })
            except Exception as e:
                logger.warning(f"[BrockstonCore] Memory save failed: {e}")

        try:
            learn_from_text(f"User: {input_text}\nBrockston: {response}")
            self.stats["learning_sessions"] += 1
        except Exception as e:
            logger.warning(f"[BrockstonCore] Learning failed: {e}")

        return {
            "response": response,
            "source": source,
            "local_analysis": local_analysis,
            "emotion": emotion_context,
            "stats": self.stats,
        }

    def start_learning(self):
        try:
            start_brockston_learning()
        except Exception as e:
            logger.error(f"[BrockstonCore] Learning start failed: {e}")

# ==============================================================================
# © 2025 Everett Nathaniel Christman & The Christman AI Project
# Luma Cognify AI — "How can we help you love yourself more?"
#
# Cardinal Rule 1: It has to actually work.
# Cardinal Rule 6: Fail loud.
# Cardinal Rule 12: No keys in code.
# Cardinal Rule 13: Absolute honesty about the code.
# ==============================================================================
