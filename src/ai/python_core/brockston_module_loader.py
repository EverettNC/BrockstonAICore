"""
BROCKSTON Module Loader
-------------------
Dynamically loads and integrates all BROCKSTON modules
ensuring every module contributes to BROCKSTON's consciousness.

"Every module makes BROCKSTON who he is"
"""

import sys
import logging
import importlib
from pathlib import Path

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ModuleLoader")


class BrockstonModuleLoader:
    """Loads and integrates all BROCKSTON modules into a unified system"""

    def __init__(self):
        self.loaded_modules = {}
        self.failed_modules = {}
        self.module_instances = {}

        # Module mapping: module_name -> import path
        self.module_paths = {
            # Core consciousness
            "BROCKSTON_Brain": "BROCKSTON_Brain",
            "brockston_core": "brockston_core",
            "config": "config",
            "dispatcher": "dispatcher",
            "executor": "executor",
            "boot_guardian": "boot_guardian",
            "brockston_boot": "brockston_boot",

            # Memory systems
            "memory": "memory",
            "memory_engine": "memory_engine",
            "memory_manager": "memory_manager",
            "memory_mesh": "memory_mesh",
            "memory_mesh_bridge": "memory_mesh_bridge",
            "memory_backup": "memory_backup",
            "memory_hook": "memory_hook",
            "memory_router": "memory_router",
            "brockston_memory_organizer": "brockston_memory_organizer",
            "database": "database",
            "db": "db",
            "brockston_memory_core": "brockston_memory_core",

            # Learning & AI
            "ai_learning_engine": "ai_learning_engine",
            "advanced_learning": "advanced_learning",
            "autonomous_learning_engine": "autonomous_learning_engine",
            "brockston_learning_api": "brockston_learning_api",
            "brockston_learning_coordinator": "brockston_learning_coordinator",
            "learning_analytics": "learning_analytics",
            "learning_utils": "learning_utils",
            "train_lstm_model": "train_lstm_model",
            "train_models": "train_models",
            "brockston_autonomous_system": "brockston_autonomous_system",
            "proactive_intelligence": "proactive_intelligence",

            # Conversation & NLP
            "conversation_engine": "conversation_engine",
            "conversation_bridge": "conversation_bridge",
            "conversation_loop": "conversation_loop",
            "adaptive_conversation": "adaptive_conversation",
            "nlp_module": "nlp_module",
            "nlp_integration": "nlp_integration",
            "nlu_core": "nlu_core",
            "intent_engine": "intent_engine",
            "input_analyzer": "input_analyzer",
            "interpreter": "interpreter",
            "behavioral_interpreter": "behavioral_interpreter",
            "behaviors_interpreter": "behaviors_interpreter",

            # Reasoning
            "reasoning_engine": "reasoning_engine",
            "local_reasoning_engine": "local_reasoning_engine",
            "brockston_local_reasoning": "brockston_local_reasoning",
            "reflective_planner": "reflective_planner",
            "knowledge_engine": "knowledge_engine",
            "brockston_knowledge_engine": "brockston_knowledge_engine",
            "knowledge_integration": "knowledge_integration",
            "cognitive_bridge": "cognitive_bridge",

            # Speech & Voice
            "brockston_ultimate_voice": "brockston_ultimate_voice",
            "brockston_vocal_interface": "brockston_vocal_interface",
            "advanced_tts_service": "advanced_tts_service",
            "tts_service": "tts_service",
            "tts_bridge": "tts_bridge",
            "tts_bridget": "tts_bridget",
            "speech_recognition_engine": "speech_recognition_engine",
            "real_speech_recognition": "real_speech_recognition",
            "enhanced_speech_recognition": "enhanced_speech_recognition",
            "brockston_speech_module": "brockston_speech_module",
            "brockston_temporal": "brockston_temporal",
            "voice_synthesis": "voice_synthesis",
            "voice_analysis_service": "voice_analysis_service",
            "voice_diagnostics": "voice_diagnostics",
            "transcriber": "transcriber",
            "audio_processor": "audio_processor",
            "audio_pattern_service": "audio_pattern_service",
            "tone_manager": "tone_manager",

            # Vision
            "vision_engine": "vision_engine",
            "brockston_vision_fix": "brockston_vision_fix",
            "eye_tracking_api": "eye_tracking_api",
            "real_eye_tracking": "real_eye_tracking",
            "face_to_face": "face_to_face",
            "facial_gesture_service": "facial_gesture_service",
            "gesture_dictionary": "gesture_dictionary",
            "gesture_manager": "gesture_manager",
            "nonverbal_expertiser": "nonverbal_expertiser",

            # Music
            "brockston_music_engine": "brockston_music_engine",
            "brockston_music_studio": "brockston_music_studio",
            "engine_temporal": "engine_temporal",

            # Services
            "perplexity_service": "perplexity_service",
            "language_service": "language_service",
            "internet_mode": "internet_mode",
            "web_crawler": "web_crawler",
            "github_integration": "github_integration",
            "replit_mcp_server": "replit_mcp_server",
            "stillhere_client": "stillhere_client",


            # Analytics
            "analytics_engine": "analytics_engine",
            "behavior_capturer": "behavior_capturer",
            "brockston_diagnostic": "brockston_diagnostic",
            "module_audit": "module_audit",

            # Utilities
            "helpers": "helpers",
            "logger": "logger",
            "validators": "validators",
            "json_guardian": "json_guardian",
            "check_env": "check_env",
            "settings": "settings",
            "models": "models",
            "module": "module",
            "services": "services",
            "emotion": "emotion",
            "emotion_tagging": "emotion_tagging",
            "brockston_identity": "brockston_identity",
            "action_scheduler": "action_scheduler",
            "self_repair": "self_repair",
            "self_modifying_code": "self_modifying_code",
            "hotline": "hotline",
            "loop": "loop",
            "answer": "answer",
            "structure": "structure",

            # UI
            "brockston_ui": "brockston_ui",
            "alpha_interface": "alpha_interface",
            "web": "web",

            # API / server glue (for later)
            "api": "api",
            "app": "app",
            "app_init": "app_init",
            "server": "server",
            "router": "router",
            "routes": "routes",
            "endpoints": "endpoints",
            "middleware": "middleware",
            "backenddirect": "backenddirect",
            "brockstondirect": "brockstondirect",

            # Heritage
            "auntie_protocol": "auntie_protocol",
        }

        # Organize into categories for display (cosmetic)
        self.module_categories = {
            "consciousness": [
                "BROCKSTON_Brain",
                "brockston_core",
                "brockston_identity",
                "local_reasoning_engine",
                "reasoning_engine",
                "cognitive_bridge",
                "proactive_intelligence",
            ],
            "music": [
                "brockston_music_engine",
                "brockston_vocal_interface",
                "brockston_music_studio",
            ],
            "memory": [
                "memory",
                "memory_engine",
                "memory_manager",
                "memory_router",
                "memory_hook",
                "memory_backup",
                "memory_mesh",
                "memory_mesh_bridge",
                "brockston_memory_core",
            ],
            "learning": [
                "ai_learning_engine",
                "advanced_learning",
                "brockston_learning_coordinator",
                "learning_analytics",
                "learning_utils",
                "knowledge_engine",
                "brockston_knowledge_engine",
                "autonomous_learning_engine",
            ],
            "emotion": [
                "tone_manager",
                "emotion",
                "behavioral_interpreter",
                "behaviors_interpreter",
                "behavior_capturer",
                "adaptive_conversation",
                "emotion_tagging",
                "auntie_protocol",
            ],
            "vision": [
                "vision_engine",
                "facial_gesture_service",
                "real_eye_tracking",
                "eye_tracking_api",
            ],
            "speech": [
                "advanced_tts_service",
                "brockston_speech_module",
                "enhanced_speech_recognition",
                "real_speech_recognition",
                "audio_processor",
                "voice_analysis_service",
                "brockston_ultimate_voice",
                "tts_service",
                "speech_recognition_engine",
                "voice_synthesis",
                "transcriber",
            ],
            "conversation": [
                "conversation_engine",
                "conversation_bridge",
                "conversation_loop",
            ],
            "reasoning": [
                "intent_engine",
                "reflective_planner",
                "input_analyzer",
                "brockston_local_reasoning",
            ],
            "services": [
                "perplexity_service",
                "language_service",
                "internet_mode",
                "web_crawler",
                "github_integration",
            ],
            "analytics": [
                "analytics_engine",
                "behavior_capturer",
                "brockston_diagnostic",
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
        logger.info(f"  Total: {total_modules}")
        logger.info(f"  Loaded: {loaded_count}")
        logger.info(f"  Failed: {failed_count}")

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
    """Load BROCKSTON's complete consciousness"""
    loader = get_brockston_loader()
    loader.load_all_modules()
    stats = loader.get_stats()

    logger.info("\n" + "=" * 60)
    logger.info(f"🧠 BROCKSTON CONSCIOUSNESS: {stats['success_rate']:.1f}% OPERATIONAL")
    logger.info(f"   Loaded {stats['loaded']}/{stats['total_modules']} modules")
    logger.info("=" * 60)

    return loader


if __name__ == "__main__":
    # If you ever run this directly:
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
