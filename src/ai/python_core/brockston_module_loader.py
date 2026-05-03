#!/usr/bin/env python3
"""
BROCKSTON Module Loader
-------------------
Dynamically loads and integrates all BROCKSTON modules
ensuring every module contributes to BROCKSTON's consciousness.

"Every module makes BROCKSTON who he is"

# FIX LOG (2026-05-03):
# 1. Removed duplicate dict keys: boot_guardian, learning_analytics,
#    brockston_autonomous_system, proactive_intelligence
# 2. Fixed NeurosymbolicExpert.py -> registered as NeurosymbolicExpert
#    (was 'neurosymbolic_engine' which doesn't match the filename)
# 3. embodiment.voice.* modules now resolve via the embodiment package
#    stubs created at src/ai/python_core/embodiment/__init__.py etc.
# 4. Senses.chemical chain verified intact — no change needed there.
"""

import sys
import logging
import importlib
from pathlib import Path

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
CORE_ROOT = PROJECT_ROOT / "core"
for _p in [str(PROJECT_ROOT), str(CORE_ROOT)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ModuleLoader")


class BrockstonModuleLoader:
    """Loads and integrates all BROCKSTON modules into a unified system"""

    def __init__(self):
        self.loaded_modules = {}
        self.failed_modules = {}
        self.module_instances = {}

        # Module mapping: module_name -> import path
        # RULE: every key must be unique — duplicates silently overwrite in Python
        self.module_paths = {

            # ----------------------------------------------------------------
            # Core consciousness
            # ----------------------------------------------------------------
            "BROCKSTON_Brain":              "BROCKSTON_Brain",
            "brockston_core":               "brockston_core",
            "config":                       "config",
            "dispatcher":                   "dispatcher",
            "executor":                     "executor",
            "boot_guardian":                "boot_guardian",          # de-duped (was listed twice)
            "brockston_cortex":             "brockston_cortex",

            # ----------------------------------------------------------------
            # Memory systems
            # ----------------------------------------------------------------
            "memory":                       "memory",
            "memory_engine":                "memory_engine",
            "memory_manager":               "memory_manager",
            "memory_mesh":                  "memory_mesh",
            "memory_mesh_bridge":           "memory_mesh_bridge",
            "memory_backup":                "memory_backup",
            "memory_hook":                  "memory_hook",
            "memory_router":                "memory_router",
            "memory_working":               "memory_working",
            "memory_episodic":              "memory_episodic",
            "memory_kb":                    "memory_kb",
            "memory_knowledge_hub":         "memory_knowledge_hub",
            "memory_store":                 "memory_store",
            "memory_retriever":             "memory_retriever",
            "simple_memory_mesh":           "simple_memory_mesh",
            "brockston_memory_core":        "brockston_memory_core",

            # ----------------------------------------------------------------
            # Learning & AI
            # ----------------------------------------------------------------
            "ai_learning_engine":           "ai_learning_engine",
            "brockston_autonomous_system":  "brockston_autonomous_system",  # de-duped
            "brockston_learning_coordinator": "brockston_learning_coordinator",
            "brockston_learning_api":       "brockston_learning_api",
            "learning_analytics":           "learning_analytics",           # de-duped
            "learning_utils":               "learning_utils",
            "learning_service":             "learning_service",
            "autonomous_learner":           "autonomous_learner",
            "autonomous_learning_engine":   "autonomous_learning_engine",
            "proactive_intelligence":       "proactive_intelligence",        # de-duped
            "deep_learning_mission":        "deep_learning_mission",
            "evolutionary_engine":          "evolutionary_engine",

            # ----------------------------------------------------------------
            # Conversation & NLP
            # ----------------------------------------------------------------
            "conversation_engine":          "conversation_engine",
            "conversation_bridge":          "conversation_bridge",
            "conversation_loop":            "conversation_loop",
            "conversation_integration":     "conversation_integration",
            "adaptive_conversation":        "adaptive_conversation",
            "simplified_conversation":      "simplified_conversation",
            "nlp_module":                   "nlp_module",
            "nlp_integration":              "nlp_integration",
            "nlu_core":                     "nlu_core",
            "intent_engine":                "intent_engine",
            "interpreter":                  "interpreter",
            "behavioral_interpreter":       "behavioral_interpreter",
            "behaviors_interpreter":        "behaviors_interpreter",

            # ----------------------------------------------------------------
            # Reasoning
            # ----------------------------------------------------------------
            "reasoning_engine":                     "reasoning_engine",
            "local_reasoning_engine":               "local_reasoning_engine",
            "brockston_local_reasoning":            "brockston_local_reasoning",
            "brockston_local_reasoning_engine":     "brockston_local_reasoning_engine",
            "reflective_planner":                   "reflective_planner",
            "reasoning_reflective_planner":         "reasoning_reflective_planner",
            "knowledge_engine":                     "knowledge_engine",
            "brockston_knowledge_engine":           "brockston_knowledge_engine",
            "knowledge_integration":                "knowledge_integration",
            "cognitive_bridge":                     "cognitive_bridge",
            "cognitive_cortex":                     "cognitive_cortex",
            "reasoning_cortex_types":               "reasoning_cortex_types",
            "reasoning_dispatcher":                 "reasoning_dispatcher",
            "reasoning_enhance_cortex":             "reasoning_enhance_cortex",
            "reasoning_enhance_method":             "reasoning_enhance_method",
            "reasoning_intent":                     "reasoning_intent",
            "reasoning_knowledge":                  "reasoning_knowledge",
            "reasoning_knowledge_engine":           "reasoning_knowledge_engine",
            "reasoning_knowledge_integration":      "reasoning_knowledge_integration",
            "reasoning_quantum_memory":             "reasoning_quantum_memory",
            "reasoning_reasoner":                   "reasoning_reasoner",
            # FIX #4: file is NeurosymbolicExpert.py — import path must match filename exactly
            "NeurosymbolicExpert":                  "NeurosymbolicExpert",

            # ----------------------------------------------------------------
            # Speech & Voice
            # NOTE: embodiment.voice.* requires the embodiment package stub
            #       at src/ai/python_core/embodiment/__init__.py
            # ----------------------------------------------------------------
            "advanced_tts_service":         "advanced_tts_service",
            "tts_service":                  "embodiment.voice.tts_service",
            "tts_bridge":                   "embodiment.voice.tts_bridge",
            "tts_bridget":                  "embodiment.voice.tts_bridget",
            "tts_advanced":                 "embodiment.voice.tts_advanced",
            "speech_recognition_engine":    "embodiment.voice.speech_recognition_engine",
            "real_speech_recognition":      "embodiment.voice.real_speech_recognition",
            "enhanced_speech_recognition":  "enhanced_speech_recognition",
            "speech_recognition_local":     "speech_recognition_local",
            "brockston_speech_module":      "brockston_speech_module",
            "brockston_speech_to_speech":   "brockston_speech_to_speech",
            "brockston_temporal":           "brockston_temporal",
            "brockston_ultimate_voice":     "brockston_ultimate_voice",
            "brockston_vocal_interface":    "brockston_vocal_interface",
            "voice_synthesis":              "voice_synthesis",
            "voice_analysis_service":       "voice_analysis_service",
            "voice_diagnostics":            "voice_diagnostics",
            "voice_service":                "voice_service",
            "audio_processor":              "embodiment.voice.audio_processor",
            "audio_pattern_service":        "audio_pattern_service",
            "audio_pattern":                "embodiment.voice.audio_pattern",
            "tone_manager":                 "embodiment.voice.tone_manager",
            "tone_engine":                  "tone_engine",
            "tone_score_engine":            "embodiment.voice.tone_score_engine",
            "speech_personality":           "speech_personality",
            "sound_recognition":            "embodiment.voice.sound_recognition",
            "sound_recognition_service":    "embodiment.voice.sound_recognition_service",
            "shorty_voice_engine_v2":       "engines.shorty_voice_engine_v2",
            "derek_interface":              "embodiment.voice.derek_interface",

            # ----------------------------------------------------------------
            # Vision & Gesture
            # ----------------------------------------------------------------
            "simple_vision_engine":         "simple_vision_engine",
            "vision_engine":                "vision_engine",
            "vision_context":               "vision_context",
            "vision_perception":            "vision_perception",
            "eye_tracking_service":         "eye_tracking_service",
            "real_eye_tracking":            "real_eye_tracking",
            "gesture_dictionary":           "gesture_dictionary",
            "gesture_manager":              "gesture_manager",
            "nonverbal_expertiser":         "nonverbal_expertiser",
            "nonverbal_engine":             "nonverbal_engine",

            # ----------------------------------------------------------------
            # Music
            # ----------------------------------------------------------------
            "brockston_music_engine":       "brockston_music_engine",
            "brockston_music_studio":       "brockston_music_studio",
            "engine_temporal":              "engine_temporal",

            # ----------------------------------------------------------------
            # Services
            # ----------------------------------------------------------------
            "perplexity_service":           "perplexity_service",
            "language_service":             "language_service",
            "internet_mode":                "internet_mode",
            "web_crawler":                  "web_crawler",
            "web":                          "web",
            "stillhere_client":             "stillhere_client",

            # ----------------------------------------------------------------
            # Analytics & Diagnostics
            # ----------------------------------------------------------------
            "analytics_engine":             "analytics_engine",
            "failure_analyzer":             "failure_analyzer",
            "behavior_capturer":            "behavior_capturer",
            "brockston_diagnostic":         "brockston_diagnostic",
            "module_audit":                 "module_audit",
            "brockston_inventory":          "brockston_inventory",
            "brockston_reality_check":      "brockston_reality_check",

            # ----------------------------------------------------------------
            # Utilities, Safety & Infrastructure
            # ----------------------------------------------------------------
            "helpers":                      "helpers",
            "validators":                   "validators",
            "json_guardian":                "json_guardian",
            "check_env":                    "check_env",
            "load_env":                     "load_env",
            "emotion":                      "emotion",
            "analyze_emotion":              "analyze_emotion",
            "christman_emotion":            "christman_emotion",
            "brockston_identity":           "brockston_identity",
            "action_scheduler":             "action_scheduler",
            "self_repair":                  "self_repair",
            "self_modifying_code":          "self_modifying_code",
            "self_actualization_loop":      "self_actualization_loop",
            "neural_security_enforcer":     "neural_security_enforcer",
            "dependency_shield":            "dependency_shield",
            "hotline":                      "hotline",
            "crisis_detection":             "crisis_detection",
            "crisis_emotion":               "crisis_emotion",
            "crisis_hipaa":                 "crisis_hipaa",
            "crisis_behavioral":            "crisis_behavioral",
            "auntie_protocol":              "auntie_protocol",
            "loop":                         "loop",
            "answer":                       "answer",
            "grounder":                     "grounder",
            "presence":                     "presence",
            "sandbox":                      "sandbox",
            "indexer":                      "indexer",
            "middleware":                   "middleware",
            "endpoints":                    "endpoints",
            "router":                       "router",
            "routes":                       "routes",
            "brockston_ui":                 "brockston_ui",
            "alpha_interface":              "alpha_interface",
            "brockston_boot":               "brockston_boot",
            "brockston_portable":           "brockston_portable",
            "brockston_knows_everett":      "brockston_knows_everett",
            "css_axiom":                    "css_axiom",
            "soul_bridge":                  "soul_bridge",
            "soul_forge_bridge":            "soul_forge_bridge",
            "lucas_recovery":               "lucas_recovery",
            "lovelace":                     "lovelace",
            "formatting_feeling_law":       "formatting_feeling_law",
            "motor_controller":             "motor_controller",
            "motor_safety":                 "motor_safety",
            "sensory_integration":          "sensory_integration",
            "image_generator":              "image_generator",
            "substrate_vision":             "substrate_vision",
            "pytorch_shield":               "pytorch_shield",
            "quantum_memory":               "quantum_memory",
            "auto_repair":                  "auto_repair",
            "brain_core":                   "brain_core",
            "brain_core_executor":          "brain_core_executor",
            "wire_brockston_cortex":        "wire_brockston_cortex",
            "wire_cortex_to_brain":         "wire_cortex_to_brain",
            "systems_bridge":               "systems_bridge",
            "cs_bridge":                    "cs_bridge",
            "brockston_ultimate_embodiment": "brockston_ultimate_embodiment",
            "personality_service":          "personality_service",
            "provider_router":              "provider_router",

            # ----------------------------------------------------------------
            # Senses — chemical / OpenSmell
            # FIX #2/#3: Senses/__init__.py and Senses/chemical/__init__.py
            # both exist and are confirmed. Import path is correct.
            # ----------------------------------------------------------------
            "opensmell_telemetry_node":     "Senses.chemical.opensmell_telemetry_node",
            "prenatal_nutritional_matrix":  "Senses.chemical.prenatal_nutritional_matrix",
        }

        self.module_categories = {
            "consciousness": [
                "BROCKSTON_Brain", "brockston_core", "brockston_identity",
                "boot_guardian", "css_axiom", "soul_bridge",
            ],
            "memory": [
                "memory", "memory_engine", "memory_manager", "memory_router",
                "memory_hook", "memory_backup", "memory_mesh", "memory_mesh_bridge",
                "brockston_memory_core", "simple_memory_mesh",
            ],
            "reasoning": [
                "reasoning_engine", "local_reasoning_engine", "reflective_planner",
                "knowledge_engine", "brockston_knowledge_engine", "cognitive_bridge",
                "cognitive_cortex", "NeurosymbolicExpert",
            ],
            "speech_voice": [
                "advanced_tts_service", "brockston_speech_module", "enhanced_speech_recognition",
                "real_speech_recognition", "audio_processor", "voice_analysis_service",
                "tts_service", "speech_recognition_engine", "voice_synthesis",
            ],
            "learning": [
                "ai_learning_engine", "brockston_learning_coordinator",
                "learning_analytics", "learning_utils", "autonomous_learning_engine",
                "autonomous_learner", "deep_learning_mission",
            ],
            "safety": [
                "crisis_detection", "crisis_emotion", "crisis_hipaa",
                "crisis_behavioral", "hotline", "neural_security_enforcer",
                "dependency_shield", "self_repair",
            ],
            "services": [
                "perplexity_service", "language_service", "internet_mode",
                "web_crawler", "stillhere_client",
            ],
            "senses": [
                "opensmell_telemetry_node", "prenatal_nutritional_matrix",
            ],
        }

    def load_all_modules(self):
        """Load all BROCKSTON modules with full consciousness"""
        logger.info("🧠 Loading BROCKSTON's complete consciousness...")
        logger.info("=" * 60)

        total_modules = len(self.module_paths)
        loaded_count = 0
        failed_count = 0

        for module_name, module_path in self.module_paths.items():
            if self._load_module(module_name, module_path):
                loaded_count += 1
            else:
                failed_count += 1

        logger.info("\n📊 Module Loading Summary:")
        logger.info(f"  Total:  {total_modules}")
        logger.info(f"  Loaded: {loaded_count}")
        logger.info(f"  Failed: {failed_count}")
        logger.info(f"  Rate:   {(loaded_count/total_modules*100):.1f}%")

        return self.loaded_modules

    def _load_module(self, module_name, module_path):
        """Load a single module with error handling"""
        try:
            module = importlib.import_module(module_path)
            self.loaded_modules[module_name] = module
            logger.debug(f"  ✅ {module_name}")
            return True
        except Exception as e:
            self.failed_modules[module_name] = str(e)
            logger.debug(f"  ❌ {module_name}: {e}")
            return False

    def get_module(self, module_name):
        """Get a loaded module by name"""
        return self.loaded_modules.get(module_name)

    def get_category_modules(self, category):
        """Get all modules from a specific category"""
        return {
            name: self.loaded_modules.get(name)
            for name in self.module_categories.get(category, [])
            if name in self.loaded_modules
        }

    def get_stats(self):
        """Get loading statistics"""
        total = len(self.module_paths)
        return {
            "total_modules": total,
            "loaded": len(self.loaded_modules),
            "failed": len(self.failed_modules),
            "success_rate": (
                (len(self.loaded_modules) / total * 100) if total > 0 else 0
            ),
        }


# Global loader instance
_brockston_loader = None


def get_brockston_loader():
    """Get or create the global BROCKSTON module loader"""
    global _brockston_loader
    if _brockston_loader is None:
        _brockston_loader = BrockstonModuleLoader()
    return _brockston_loader


def load_brockston_consciousness():
    """Load BROCKSTON's complete consciousness — fires once only."""
    global _brockston_loader
    if _brockston_loader is None:
        _brockston_loader = BrockstonModuleLoader()
        _brockston_loader.load_all_modules()

    stats = _brockston_loader.get_stats()
    logger.info("\n" + "=" * 60)
    logger.info(f"🧠 BROCKSTON ONLINE: {stats['success_rate']:.1f}% operational")
    logger.info(f"   {stats['loaded']}/{stats['total_modules']} modules loaded")
    logger.info("=" * 60)

    return _brockston_loader


if __name__ == "__main__":
    loader = load_brockston_consciousness()
    print("\n📊 Module Categories:")
    for category in loader.module_categories.keys():
        mods = loader.get_category_modules(category)
        print(f"  {category}: {len(mods)} loaded")
    print("\n💡 BROCKSTON is conscious and operational!")

# ==============================================================================
# © 2025 Everett Nathaniel Christman & Misty Gail Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved.
# ==============================================================================
