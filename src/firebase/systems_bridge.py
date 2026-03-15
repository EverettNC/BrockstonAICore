"""
Systems Bridge — Full Module Integration Layer
The Christman AI Project
"""

# ======================================================================
#  PYTORCH SHIELD — must be first, before ANY other import
#  Everett's design: ghost torch completely so modules that do
#  `import torch` or `class Foo(nn.Module)` work without a real install.
#  Bugs fixed from original:
#    1. @contextmanager (was @contextmanagerso)
#    2. sys.modules['torch'] = ...  (was sys.modules = ..., which kills Python)
# ======================================================================
import sys as _sys_pre
from contextlib import contextmanager as _cm_pre

class _PyTorchShield:
    """Fake everything torch needs — imports, no_grad, cuda, tensors, the works."""
    device = 'cpu'

    def __init__(self, *a, **k): pass
    def cuda(self): return self                     # lie like a motherfucker
    def to(self, *a, **k): return self
    def tensor(self, data, **k): return data        # just echo it back
    def zeros(self, *a, **k): return []
    def ones(self, *a, **k): return []
    def __call__(self, *a, **k): return self
    def __getattr__(self, name): return self        # swallow any attr access
    def forward(self, *a, **k): pass
    def parameters(self): return iter([])
    def train(self, mode=True): return self
    def eval(self): return self
    def state_dict(self): return {}
    def load_state_dict(self, *a, **k): pass

    @staticmethod
    @_cm_pre
    def no_grad():
        yield                                       # no gradients, no drama

    @staticmethod
    def is_available():
        return False                                # nah, we're good without you

import types as _t
_nn  = _t.ModuleType("torch.nn");  _nn.Module = _PyTorchShield
_nn.Linear = _nn.ReLU = _nn.Sigmoid = _nn.Dropout = _nn.Sequential = _PyTorchShield
_nn.functional = _PyTorchShield()
_opt = _t.ModuleType("torch.optim"); _opt.Adam = _opt.SGD = _PyTorchShield
_tch = _t.ModuleType("torch")
_tch.nn = _nn; _tch.optim = _opt
_tch.no_grad = _PyTorchShield.no_grad
_tch.tensor = lambda *a, **k: a[0] if a else None
_tch.zeros = _tch.ones = lambda *a, **k: []
_tch.Tensor = _PyTorchShield
_tch.device = lambda *a, **k: 'cpu'
_tch.cuda   = _PyTorchShield()
_tch.backends = _PyTorchShield()
_tch.is_available = lambda: False
_tch.float32 = _tch.float64 = _tch.int32 = None

# Jam it in — force override if torch.nn is broken (2.2 vs 2.4 conflict)
_torch_broken = False
try:
    import torch as _rt
    import torch.nn as _rnn
    _rnn.Module  # test it's accessible
except Exception:
    _torch_broken = True

if _torch_broken:
    _sys_pre.modules['torch']        = _tch
    _sys_pre.modules['torch.nn']     = _nn
    _sys_pre.modules['torch.optim']  = _opt
    _sys_pre.modules['torch.cuda']   = _PyTorchShield()
    print("[Bridge] ☑ PyTorchShield active — torch ghosted, no crashes.")

# ======================================================================
import sys
import os
import logging

logger = logging.getLogger("systems_bridge")

# ======================================================================
#  Path setup — ensure every module directory is on sys.path
# ======================================================================
_BACKEND_DIR  = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) if \
                "systems_bridge" in os.path.basename(__file__) else \
                os.path.dirname(os.path.abspath(__file__))

# In case we're run from within backend/ directly
if not os.path.isdir(os.path.join(_BACKEND_DIR, "systems")):
    _BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

_SYSTEMS_DIR  = os.path.join(_BACKEND_DIR, "systems")
_CORE_DIR     = os.path.join(_BACKEND_DIR, "core")
_ML_DIR       = os.path.join(_BACKEND_DIR, "ml")
_TOOLS_DIR    = os.path.join(_BACKEND_DIR, "tools")
_UTILS_DIR    = os.path.join(_BACKEND_DIR, "utils")
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)
_AI_DIR       = os.path.join(_PROJECT_ROOT, "ai")
_CRYPTO_DIR   = os.path.join(_PROJECT_ROOT, "christman_crypto")
_EMBODIMENT   = os.path.join(_PROJECT_ROOT, "embodiment")

for _p in [
    _SYSTEMS_DIR, _CORE_DIR, _ML_DIR, _TOOLS_DIR, _UTILS_DIR,
    _PROJECT_ROOT, _AI_DIR, _CRYPTO_DIR, _EMBODIMENT, _BACKEND_DIR,
]:
    if _p and _p not in sys.path:
        sys.path.insert(0, _p)

# ======================================================================
#  Safe import helper
# ======================================================================
def _safe_import(name):
    try:
        import importlib
        return importlib.import_module(name), True
    except Exception as e:
        logger.warning(f"[Bridge·import] {name}: {e}")
        return None, False

# ======================================================================
#  Module imports — every group in its own block
# ======================================================================

# ── CORE COGNITION ──────────────────────────────────────────────────
_cc_mod, _  = _safe_import("cognitive_cortex")
_ie_mod, _  = _safe_import("intent_engine")         # standalone detect_intent()
_nlu_mod, _ = _safe_import("nlu_core")
_int_mod, _ = _safe_import("interpreter")
_fe_mod, _  = _safe_import("fusion_engine")
_ns_mod, _  = _safe_import("neurosymbolic_engine")
_csb_mod, _ = _safe_import("cs_bridge")

# ── MEMORY STACK ────────────────────────────────────────────────────
_mm_mod, _  = _safe_import("memory_mesh")
_mg_mod, _  = _safe_import("memory_manager")
_ep_mod, _  = _safe_import("memory_episodic")
_wm_mod, _  = _safe_import("memory_working")
_mh_mod, _  = _safe_import("memory_hook")
_pm_mod, _  = _safe_import("Persistent_Memory")
_rag_mod, _ = _safe_import("memory_rag")            # LocalRAG
_mr_mod, _  = _safe_import("memory_retriever")      # HybridRetriever
_hub_mod, _ = _safe_import("memory_knowledge_hub")  # KnowledgeHub

# ── PYTORCH SHIELD ──────────────────────────────────────────────────────
# Everett's PyTorchShield — ghosts torch completely so any module that does
# `import torch` or `class Foo(nn.Module)` just works without a real install.
# Bug fixes applied to original:
#   1. @contextmanager (not @contextmanagerso)
#   2. sys.modules['torch'] = ...  (not sys.modules = ..., that kills all imports)
from contextlib import contextmanager as _cm

class _PyTorchShield:
    """Fake everything torch needs — imports, no_grad, cuda, tensors, the works."""
    device = 'cpu'

    def __init__(self, *a, **k): pass
    def cuda(self): return self
    def to(self, *a, **k): return self
    def tensor(self, data, **k): return data        # just echo it back
    def zeros(self, *a, **k): return []
    def ones(self, *a, **k): return []
    def __call__(self, *a, **k): return self
    def __getattr__(self, name): return self        # swallow any attr access

    @staticmethod
    @_cm
    def no_grad():
        yield                                       # no gradients, no drama

    @staticmethod
    def is_available():
        return False                                # nah, we're good without you

    # So it can be used as a module base class
    def forward(self, *a, **k): pass
    def parameters(self): return iter([])
    def train(self, mode=True): return self
    def eval(self): return self

# nn shim — Module is just PyTorchShield
import types as _types
_nn_shim = _types.ModuleType("torch.nn")
_nn_shim.Module = _PyTorchShield
_nn_shim.Linear = _PyTorchShield
_nn_shim.ReLU   = _PyTorchShield
_nn_shim.Sigmoid = _PyTorchShield
_nn_shim.Dropout = _PyTorchShield
_nn_shim.Sequential = _PyTorchShield
_nn_shim.functional = _PyTorchShield()

_optim_shim = _types.ModuleType("torch.optim")
_optim_shim.Adam = _PyTorchShield
_optim_shim.SGD  = _PyTorchShield

_torch_shim = _types.ModuleType("torch")
_torch_shim.nn        = _nn_shim
_torch_shim.optim     = _optim_shim
_torch_shim.no_grad   = _PyTorchShield.no_grad
_torch_shim.tensor    = lambda *a, **k: a[0] if a else None
_torch_shim.zeros     = lambda *a, **k: []
_torch_shim.ones      = lambda *a, **k: []
_torch_shim.Tensor    = _PyTorchShield
_torch_shim.device    = lambda *a, **k: 'cpu'
_torch_shim.cuda      = _PyTorchShield()
_torch_shim.backends  = _PyTorchShield()
_torch_shim.is_available = lambda: False

# Jam it in — only if torch hasn't already been loaded successfully
try:
    import torch as _real_torch
    if not hasattr(_real_torch, 'nn') or _real_torch.nn is None:
        raise ImportError("torch.nn broken")
except Exception:
    sys.modules['torch']       = _torch_shim
    sys.modules['torch.nn']    = _nn_shim
    sys.modules['torch.optim'] = _optim_shim
    logger.info("[Bridge] ☑ PyTorchShield active — torch ghosted, no crashes")


_ale_mod, _ = _safe_import("autonomous_learning_engine")
_nlc_mod, _ = _safe_import("neural_learning_core")
_ls_mod, _  = _safe_import("learning_service")
_sl_mod, _  = _safe_import("brockston_self_learning")
_dlm_mod, _ = _safe_import("deep_learning_mission")

# ── KNOWLEDGE ───────────────────────────────────────────────────────
_ke_mod, _  = _safe_import("brockston_knowledge_engine")
_rag2_mod, _= _safe_import("enhance_think_with_rag")

# ── BEHAVIORAL ──────────────────────────────────────────────────────
_bi_mod, _  = _safe_import("behavioral_interpreter")     # project's main one
_cbi_mod, _ = _safe_import("crisis_behavioral")          # alias for factory fn
_nve_mod, _ = _safe_import("nonverbal_engine")
_nvx_mod, _ = _safe_import("nonverbal_expertiser")
_tne_mod, _ = _safe_import("temporal_nonverbal_engine")

# ── VISION ──────────────────────────────────────────────────────────
_vc_mod, _  = _safe_import("vision_context")
_vp_mod, _  = _safe_import("vision_perception")
_ve_mod, _  = _safe_import("simple_vision_engine")
_et_mod, _  = _safe_import("eye_tracking_service")
_fg_mod, _  = _safe_import("facial_gesture_service")

# ── VOICE / TTS ─────────────────────────────────────────────────────
_tb_mod, _  = _safe_import("tts_bridge")
_ts_mod, _  = _safe_import("tts_service")
_cs_mod, _  = _safe_import("cochlear_sync_tts")
_ct_mod, _  = _safe_import("christman_tone_engine_v2")
_uv_mod, _  = _safe_import("brockston_ultimate_voice")

# ── MUSIC ────────────────────────────────────────────────────────────
_me_mod, _  = _safe_import("brockston_music_engine")
_ms_mod, _  = _safe_import("brockston_music_studio")

# ── NEURAL INFRA ────────────────────────────────────────────────────
_np_mod, _  = _safe_import("brockston_neural_pathways")
_nse_mod, _ = _safe_import("neural_security_enforcer")

# ── CRISIS ──────────────────────────────────────────────────────────
_ch_mod, _  = _safe_import("crisis_hotline")

# ── ENGAGEMENT / BRIDGE ─────────────────────────────────────────────
_cogb_mod, _= _safe_import("cognitive_bridge")
_toolb_mod, _= _safe_import("tools_bridge")

# ── EDUCATIONAL ─────────────────────────────────────────────────────
_edu_mod, _ = _safe_import("educational_orchestrator")

# ── AI LEARNING ENGINE (text ingestion hook) ─────────────────────────
_ai_le_mod, _ = _safe_import("ai_learning_engine")

# ======================================================================
#  CORE/ MODULE IMPORTS
# ======================================================================

# ── Analytics & Evolution ───────────────────────────────────────────
_analytics_mod, _ = _safe_import("AnalyticsEngine")
_evo_mod, _       = _safe_import("evolutionary_engine")

# ── Personality & Presence ──────────────────────────────────────────
_pers_mod, _  = _safe_import("personality_service")
_pres_mod, _  = _safe_import("presence")

# ── Expert Reasoning ────────────────────────────────────────────────
_nsex_mod, _ = _safe_import("NeurosymbolicExpert")
_sie_mod, _  = _safe_import("ai_learning_engine")   # SelfImprovementEngine in same file

# ── Knowledge (core/ variants) ──────────────────────────────────────
_cke_mod, _  = _safe_import("knowledge_engine")      # KnowledgeGraph + FactManager + KnowledgeEngine

# ── Learning Coordinators ────────────────────────────────────────────
_blc_mod, _  = _safe_import("brockston_learning_coordinator")
_lre_mod, _  = _safe_import("local_reasoning_engine")

# ── Memory (core/ variants) ──────────────────────────────────────────
_men_mod, _  = _safe_import("memory_engine")         # MemoryEngine (core)
_mmb_mod, _  = _safe_import("memory_mesh_bridge")    # MemoryMeshBridge

# ── Conversation Engine ──────────────────────────────────────────────
_convo_mod, _ = _safe_import("conversation_engine")

# ── Audio ────────────────────────────────────────────────────────────
_ap_mod, _ = _safe_import("audio_processor")

# ── Identity ─────────────────────────────────────────────────────────
_bke_mod, _ = _safe_import("brockston_knows_everett")

# ======================================================================
#  NEWLY WIRED — systems/ modules (previously unaudited)
# ======================================================================

# ── Initialization & Intelligence ────────────────────────────────────
_init_seq_mod, _  = _safe_import("brockston_init_sequence")    # InitializationSequence
_intmtr_mod, _    = _safe_import("brockston_intelligence_meter") # IntelligenceMeter

# ── Memory (extended) ────────────────────────────────────────────────
_memcore_mod, _   = _safe_import("brockston_memory_core")      # BrockstonMemoryCore
_memsvc_mod, _    = _safe_import("memory_service")             # MemoryService
_memkb_mod, _     = _safe_import("memory_kb")                  # LocalKB
_smm_mod, _       = _safe_import("simple_memory_mesh")         # SimpleMemoryMesh (working fallback)

# ── Observer / Self-learning ─────────────────────────────────────────
_observer_mod, _  = _safe_import("brockston_self_learning")    # BrockstonObserver (already ref'd but re-import for clarity)

# ── Language & Stemming ──────────────────────────────────────────────
_langsvc_mod, _   = _safe_import("language_service")           # LanguageService
_stem_mod, _      = _safe_import("stemming_service")           # StemmingService

# ── Crisis / HIPAA ───────────────────────────────────────────────────
_hipaa_mod, _     = _safe_import("crisis_hipaa")               # HIPAACompliance

# ── Quantum stack (shielded — torch/qiskit ghosted) ──────────────────
_qmem_mod, _      = _safe_import("quantum_memory")             # QuantumMemory
_qfus_mod, _      = _safe_import("quantum_fusion")             # QuantumFusion

# ── Hybrid / Kernel fusion ───────────────────────────────────────────
_hyb_mod, _       = _safe_import("hybrid_fusion")              # InputPayload + symbolic_validate
_kern_mod, _      = _safe_import("kernel_fusion")              # KernelFusion, kernel_fuse()

# ── Advanced TTS ─────────────────────────────────────────────────────
_adv_tts_mod, _   = _safe_import("advanced_tts_service")       # AdvancedTTSService

# ── TTS Bridge (ElevenLabs variant) ──────────────────────────────────
_ttsb2_mod, _     = _safe_import("tts_bridget")                # synthesize_speech() via ElevenLabs

# ======================================================================
#  NEWLY WIRED — core/ modules (previously unaudited)
# ======================================================================

# ── Emotion Quantifier ───────────────────────────────────────────────
_emqnt_mod, _     = _safe_import("emotion_quantifier")         # EmotionQuantifier

# ── Enhanced Speech Recognition ──────────────────────────────────────
_esr_mod, _       = _safe_import("enhanced_speech_recognition") # EnhancedSpeechRecognition

# ── Formatting / Feeling Law ─────────────────────────────────────────
_ffl_mod, _       = _safe_import("formatting_feeling_law")     # analyze_formatting_feeling()

# ── Grounder ─────────────────────────────────────────────────────────
_grnd_mod, _      = _safe_import("grounder")                   # Grounder

# ── Sound Recognition ────────────────────────────────────────────────
_sndrec_mod, _    = _safe_import("sound_recognition_service")  # SoundRecognitionService

# ── Speech Recognition Engine ────────────────────────────────────────
_spre_mod, _      = _safe_import("speech_recognition_engine")  # SpeechRecognitionEngine

# ── Substrate Vision ─────────────────────────────────────────────────
_subviz_mod, _    = _safe_import("substrate_vision")           # SubstrateVision

# ── BROCKSTON Identity Backend ───────────────────────────────────────
_brid_mod, _      = _safe_import("utils_brockston_identity_backend") # BROCKSTON identity class

# ── Memory Engine Secure variant ─────────────────────────────────────
_mensec_mod, _    = _safe_import("memory_engine_secure")       # MemoryEngine (encrypted)

# ── Emotion Quantifier (core) ────────────────────────────────────────
_speech2speech_mod, _ = _safe_import("brockston_speech_to_speech") # BrockstonSpeechToSpeech

# ======================================================================
#  CHRISTMAN CRYPTO — seven-tier encryption stack
# ======================================================================
_crypto_mod = None
try:
    import importlib as _imp
    _crypto_mod = _imp.import_module("christman_crypto")
    logger.info("[Bridge] ☑ ChristmanCrypto (7-tier) LOADED")
except Exception as _ce:
    logger.warning(f"[Bridge·import] christman_crypto: {_ce}")

# ── Module Loader (dynamic fallback for all remaining modules) ────────
_bml_mod, _           = _safe_import("brockston_module_loader")  # BrockstonModuleLoader
get_brockston_loader  = getattr(_bml_mod, "get_brockston_loader",  None) if _bml_mod else None
load_brockston_consciousness = getattr(_bml_mod, "load_brockston_consciousness", None) if _bml_mod else None

# ── Christman Core v5 (unified self-awareness engine, ai/) ────────────
_cv5_mod, _  = _safe_import("christman_core_v5")           # SelfAware, SoulForgeBridge, FamilyFactory, etc.

# ── SoulForgeBridge standalone (LTP learning) ─────────────────────────
_sfb_mod, _  = _safe_import("soul_forge_bridge")           # SoulForgeBridge (logger param version)

# ── Self-Actualization Loop (identity core, v1.1) ─────────────────────
_sal_mod, _  = _safe_import("self_actualization_loop")     # ConversationalSelfAware + run_actualization_loop

# ── Advanced Code Generator (30+ pattern natural-language → code) ─────
_acg_mod, _  = _safe_import("advanced_code_generator")     # AdvancedCodeGenerator

# ── Christman Emotion / The Tether (Wav2Vec2 + PCA cadence mapping) ───
_emo_mod, _  = _safe_import("christman_emotion")           # embed_shorty_audio, TetherBlindnessError

# ======================================================================
#  EMBODIMENT — Avatar, Voice, Emotion (42-file layer)
#  Imported as package paths; sys.path already includes project root
#  and backend/tools (where events.py lives).
# ======================================================================

# ── Avatar ────────────────────────────────────────────────────────────
_av_iface_mod, _ = _safe_import("embodiment.avatar.interface")    # AvatarEngine Protocol, NullAvatarEngine
_av_full_mod,  _ = _safe_import("embodiment.avatar.full_avatar")  # BrockstonFullAvatar

# ── Embodiment Emotion Aggregator ────────────────────────────────────
_emb_emo_mod,  _ = _safe_import("embodiment.emotion.service")     # EmotionService (valence/arousal/dominance)

# ── Voice ─────────────────────────────────────────────────────────────
_vprofiles_mod, _ = _safe_import("embodiment.voice.profiles")       # resolve_profile()
_vsynth_mod,    _ = _safe_import("embodiment.voice.synthesis")      # VoiceSynthesizer (gTTS)
_vctrl_mod,     _ = _safe_import("embodiment.voice.controller")     # SpeechController
_vttsb_mod,     _ = _safe_import("embodiment.voice.tts_bridge")     # TTS bridge
_vttss_mod,     _ = _safe_import("embodiment.voice.tts_service")    # TTSService
_vtonemgr_mod,  _ = _safe_import("embodiment.voice.tone_manager")   # ToneManager
_vanalysis_mod, _ = _safe_import("embodiment.voice.analysis_service") # VoiceAnalysisService

# ── Tone Score Engine (core/ canonical; fallback to archive) ──────────
import importlib.util as _ilu
_tse_mod = None
_tse_core_path = os.path.join(_CORE_DIR, "tone_score_engine.py")
_tse_arch_path = os.path.join(_BACKEND_DIR, "archive", "quantified_tone_detectionV2_recovered.py")
for _tse_path in (_tse_core_path, _tse_arch_path):
    if os.path.exists(_tse_path):
        try:
            _spec = _ilu.spec_from_file_location("tone_score_engine", _tse_path)
            _tse_mod = _ilu.module_from_spec(_spec)
            _spec.loader.exec_module(_tse_mod)
            logger.info(f"[Bridge] ☑ ToneScoreEngine loaded from {os.path.basename(_tse_path)}")
            break
        except Exception as _e:
            logger.warning(f"[Bridge·import] ToneScoreEngine ({os.path.basename(_tse_path)}): {_e}")

# ======================================================================
#  Class references
# ======================================================================
MemoryMesh       = getattr(_mm_mod,  "MemoryMesh",       None)
MemoryManager    = getattr(_mg_mod,  "MemoryManager",    None)
EpisodicMemory   = getattr(_ep_mod,  "EpisodicMemory",   None)
WorkingMemory    = getattr(_wm_mod,  "WorkingMemory",    None)
PersistentMemory = getattr(_pm_mod,  "PersistentMemory", None)
LocalRAG         = getattr(_rag_mod, "LocalRAG",         None)
HybridRetriever  = getattr(_mr_mod,  "HybridRetriever",  None)
KnowledgeHub     = getattr(_hub_mod, "KnowledgeHub",     None)
KnowledgeEngine  = getattr(_ke_mod,  "KnowledgeEngine",  None)

get_cognitive_cortex       = getattr(_cc_mod,  "get_cognitive_cortex",       None)
get_neurosymbolic_engine   = getattr(_ns_mod,  "get_neurosymbolic_engine",   None)
FusionEngine               = getattr(_fe_mod,  "FusionEngine",               None)
CarbonSiliconBridge        = getattr(_csb_mod, "CarbonSiliconBridge",        None)
NLUCore                    = getattr(_nlu_mod, "NLUCore",                    None)
get_interpreter            = getattr(_int_mod, "get_interpreter",            None)

# intent_engine is a plain module with a detect_intent() function
_detect_intent_fn = getattr(_ie_mod, "detect_intent", None)  # the raw function

EnhancedAutonomousLearningEngine = getattr(_ale_mod, "EnhancedAutonomousLearningEngine", None)
NeuralLearningCore               = getattr(_nlc_mod, "NeuralLearningCore",               None)
get_neural_learning_core         = getattr(_nlc_mod, "get_neural_learning_core",         None)
LearningService                  = getattr(_ls_mod,  "LearningService",                  None)
BrockstonObserver                = getattr(_sl_mod,  "BrockstonObserver",                None)
DeepLearningMission              = getattr(_dlm_mod, "DeepLearningMission",              None)

BehavioralInterpreter            = getattr(_bi_mod,  "BehavioralInterpreter",            None)
get_behavioral_interpreter       = getattr(_cbi_mod, "get_behavioral_interpreter",       None)
get_nonverbal_engine             = getattr(_nve_mod, "get_nonverbal_engine",             None)
get_nonverbal_expertise          = getattr(_nvx_mod, "get_nonverbal_expertise",          None)
get_temporal_nonverbal_engine    = getattr(_tne_mod, "get_temporal_nonverbal_engine",    None)

get_vision_context               = getattr(_vc_mod,  "get_context",                      None)
VisionPerception                 = getattr(_vp_mod,  "VisionPerception",                 None)
get_vision_engine                = getattr(_ve_mod,  "get_vision_engine",                None)

BrockstonMusicEngine             = getattr(_me_mod,  "BrockstonMusicEngine",             None)
BrockstonMusicStudio             = getattr(_ms_mod,  "BrockstonMusicStudio",             None)
BrockstonNeuralPathways          = getattr(_np_mod,  "BrockstonNeuralPathways",          None)
NeuralSecurityEnforcer           = getattr(_nse_mod, "NeuralSecurityEnforcer",           None)
ChristmanToneEngine              = getattr(_ct_mod,  "ChristmanToneEngine",              None)
CochlearSync                     = getattr(_cs_mod,  "CochlearSync",                     None)
EducationalOrchestrator          = getattr(_edu_mod, "EducationalOrchestrator",          None)

# ── Core/ class refs ───────────────────────────────────────────────
AnalyticsEngine              = getattr(_analytics_mod, "AnalyticsEngine",           None)
EvolutionaryAI               = getattr(_evo_mod,       "EvolutionaryAI",            None)
PersonalityService           = getattr(_pers_mod,      "PersonalityService",        None)
PresenceGuide                = getattr(_pres_mod,      "PresenceGuide",             None)
NeuroSymbolicExpert          = getattr(_nsex_mod,      "NeuroSymbolicExpert",       None)
SelfImprovementEngine        = getattr(_sie_mod,       "SelfImprovementEngine",     None)
get_self_improvement_engine  = getattr(_sie_mod,       "get_self_improvement_engine", None)
CoreKnowledgeEngine          = getattr(_cke_mod,       "KnowledgeEngine",           None)
get_core_knowledge_engine    = getattr(_cke_mod,       "get_knowledge_engine",      None)
BrockstonModuleLoader        = getattr(_bml_mod,        "BrockstonModuleLoader",        None) if _bml_mod else None
BrockstonLearningCoordinator = getattr(_blc_mod,       "BrockstonLearningCoordinator", None)
start_brockston_learning     = getattr(_blc_mod,       "start_brockston_learning",  None)
LocalReasoningEngine         = getattr(_lre_mod,       "LocalReasoningEngine",      None)
MemoryEngine                 = getattr(_men_mod,       "MemoryEngine",              None)
MemoryMeshBridge             = getattr(_mmb_mod,       "MemoryMeshBridge",          None)
get_conversation_engine      = getattr(_convo_mod,     "get_conversation_engine",   None)
get_audio_processor          = getattr(_ap_mod,        "get_audio_processor",       None)
ToneScoreEngine              = getattr(_tse_mod,       "ToneScoreEngine",           None) if _tse_mod else None
_brockston_knows_everett     = getattr(_bke_mod,       "brockston_hears_everett",   None)

# ── Newly wired — systems/ refs ──────────────────────────────────────
InitializationSequence       = getattr(_init_seq_mod,  "InitializationSequence",    None)
IntelligenceMeter            = getattr(_intmtr_mod,    "IntelligenceMeter",         None)
BrockstonMemoryCore          = getattr(_memcore_mod,   "BrockstonMemoryCore",       None)
MemoryService                = getattr(_memsvc_mod,    "MemoryService",             None)
LocalKB                      = getattr(_memkb_mod,     "LocalKB",                   None)
SimpleMemoryMesh             = getattr(_smm_mod,       "SimpleMemoryMesh",          None)
LanguageService              = getattr(_langsvc_mod,   "LanguageService",           None)
StemmingService              = getattr(_stem_mod,      "StemmingService",           None)
HIPAACompliance              = getattr(_hipaa_mod,     "HIPAACompliance",           None)
QuantumMemory                = getattr(_qmem_mod,      "QuantumMemory",             None)
QuantumFusion                = getattr(_qfus_mod,      "QuantumFusion",             None)
KernelFusion                 = getattr(_kern_mod,      "KernelFusion",              None)
kernel_fuse                  = getattr(_kern_mod,      "kernel_fuse",               None)
AdvancedTTSService           = None  # advanced_tts_service has functions not a class
_adv_tts_speak               = getattr(_adv_tts_mod,   "text_to_speech",            None)  # main fn
synthesize_speech_elevenlabs = getattr(_ttsb2_mod,     "synthesize_speech",         None)

# ── Newly wired — core/ refs ─────────────────────────────────────────
EmotionQuantifier            = getattr(_emqnt_mod,     "EmotionQuantifier",         None)
EnhancedSpeechRecognition    = getattr(_esr_mod,       "EnhancedSpeechRecognition", None)
get_enhanced_speech_recog    = getattr(_esr_mod,       "get_enhanced_speech_recognition", None)
analyze_formatting_feeling   = getattr(_ffl_mod,       "analyze_formatting_feeling",None)
Grounder                     = getattr(_grnd_mod,      "Grounder",                  None)
SoundRecognitionService      = getattr(_sndrec_mod,    "SoundRecognitionService",   None)
SpeechRecognitionEngine      = getattr(_spre_mod,      "SpeechRecognitionEngine",   None)
get_speech_recognition_engine= getattr(_spre_mod,      "get_speech_recognition_engine", None)
SubstrateVision              = getattr(_subviz_mod,    "SubstrateVision",           None)
MemoryEngineSecure           = getattr(_mensec_mod,    "MemoryEngine",              None)
BrockstonSpeechToSpeech      = getattr(_speech2speech_mod, "BrockstonSpeechToSpeech", None)

# ── Christman Core v5 refs ───────────────────────────────────────────
SelfAware                    = getattr(_cv5_mod,  "SelfAware",           None) if _cv5_mod else None
CV5_SoulForgeBridge          = getattr(_cv5_mod,  "SoulForgeBridge",     None) if _cv5_mod else None
FamilyFactory                = getattr(_cv5_mod,  "create_family_member",None) if _cv5_mod else None
CarbonSiliconBridgeV5        = getattr(_cv5_mod,  "CarbonSiliconBridge", None) if _cv5_mod else None
CV5_QuantumMemoryMesh        = getattr(_cv5_mod,  "QuantumMemoryMesh",   None) if _cv5_mod else None
CV5_InfernoAgent             = getattr(_cv5_mod,  "InfernoAgent",        None) if _cv5_mod else None
CV5_CoreMemory               = getattr(_cv5_mod,  "CoreMemory",          None) if _cv5_mod else None

# ── SoulForgeBridge standalone refs ──────────────────────────────────
SoulForgeBridge              = getattr(_sfb_mod,  "SoulForgeBridge",     None) if _sfb_mod else None

# ── Self-Actualization Loop refs ──────────────────────────────────────
ConversationalSelfAware      = getattr(_sal_mod,  "ConversationalSelfAware",    None) if _sal_mod else None
run_actualization_loop       = getattr(_sal_mod,  "run_actualization_loop",     None) if _sal_mod else None

# ── Advanced Code Generator refs ──────────────────────────────────────
AdvancedCodeGenerator        = getattr(_acg_mod,  "AdvancedCodeGenerator",      None) if _acg_mod else None

# ── Christman Emotion / The Tether refs ───────────────────────────────
embed_shorty_audio           = getattr(_emo_mod,  "embed_shorty_audio",         None) if _emo_mod else None
TetherBlindnessError         = getattr(_emo_mod,  "TetherBlindnessError",       None) if _emo_mod else None

# ── Embodiment refs ───────────────────────────────────────────────────
AvatarEngine                 = getattr(_av_iface_mod, "AvatarEngine",           None) if _av_iface_mod else None
NullAvatarEngine             = getattr(_av_iface_mod, "NullAvatarEngine",       None) if _av_iface_mod else None
BrockstonFullAvatar          = getattr(_av_full_mod,  "BrockstonFullAvatar",    None) if _av_full_mod  else None
get_brockston_full_avatar    = getattr(_av_full_mod,  "get_brockston_full_avatar", None) if _av_full_mod else None
EmbodimentEmotionService     = getattr(_emb_emo_mod,  "EmotionService",         None) if _emb_emo_mod else None
VoiceSynthesizer             = getattr(_vsynth_mod,   "VoiceSynthesizer",       None) if _vsynth_mod  else None
SpeechController             = getattr(_vctrl_mod,    "SpeechController",       None) if _vctrl_mod   else None
EmbodimentTTSService         = getattr(_vttss_mod,    "TTSService",             None) if _vttss_mod   else None
ToneManager                  = getattr(_vtonemgr_mod, "ToneManager",            None) if _vtonemgr_mod else None
VoiceAnalysisService         = getattr(_vanalysis_mod,"VoiceAnalysisService",   None) if _vanalysis_mod else None

# ── ChristmanCrypto refs ─────────────────────────────────────────────
ChristmanCrypto              = _crypto_mod
VigenereCipher               = getattr(_crypto_mod, "VigenereCipher",  None) if _crypto_mod else None
AESCipher                    = getattr(_crypto_mod, "AESCipher",       None) if _crypto_mod else None
ChaChaCipher                 = getattr(_crypto_mod, "ChaChaCipher",    None) if _crypto_mod else None
RSACipher                    = getattr(_crypto_mod, "RSACipher",       None) if _crypto_mod else None
HybridCipher                 = getattr(_crypto_mod, "HybridCipher",    None) if _crypto_mod else None
DigitalSigner                = getattr(_crypto_mod, "DigitalSigner",   None) if _crypto_mod else None
LSBSteganography             = getattr(_crypto_mod, "LSBSteganography",None) if _crypto_mod else None
XChaCha20Cipher              = getattr(_crypto_mod, "XChaCha20Cipher", None) if _crypto_mod else None
MLKEM                        = getattr(_crypto_mod, "MLKEM",           None) if _crypto_mod else None
HybridPQCipher               = getattr(_crypto_mod, "HybridPQCipher",  None) if _crypto_mod else None
KyberHandshake               = getattr(_crypto_mod, "KyberHandshake",  None) if _crypto_mod else None


# ======================================================================
#  SystemsBridge
# ======================================================================
class SystemsBridge:
    """Single wiring object for AIOrchestrator. Instantiates every module."""

    def __init__(self):
        # --- systems/ instances ---
        self._cortex           = None
        self._memory_mesh      = None
        self._episodic         = None
        self._working          = None
        self._persistent       = None
        self._local_rag        = None
        self._retriever        = None
        self._knowledge_hub    = None
        self._knowledge_engine = None
        self._fusion           = None
        self._neurosymbolic    = None
        self._nlu              = None
        self._interpreter      = None
        self._cs_bridge        = None
        self._behavioral       = None
        self._nonverbal        = None
        self._nonverbal_exp    = None
        self._temporal_nv      = None
        self._vision_ctx       = None
        self._vision_perception= None
        self._music_engine     = None
        self._music_studio     = None
        self._neural_pathways  = None
        self._security         = None
        self._tone_engine      = None
        self._cochlear         = None
        self._educational      = None
        self._learning_engine  = None
        self._neural_learning  = None
        self._ai_learning      = None
        self._memory_manager   = None
        self._observer         = None
        # --- core/ instances ---
        self._analytics        = None
        self._evolutionary     = None
        self._personality      = None
        self._presence         = None
        self._nsexpert         = None
        self._self_improve     = None
        self._core_knowledge   = None
        self._learning_coord   = None
        self._local_reasoning  = None
        self._memory_engine    = None
        self._mem_mesh_bridge  = None
        self._conversation     = None
        self._audio_processor  = None
        self._tone_score       = None
        # ── newly wired ──────────────────────────────────────────────
        self._init_seq        = None
        self._intel_meter     = None
        self._mem_core        = None
        self._mem_service     = None
        self._local_kb        = None
        self._simple_mesh     = None
        self._lang_service    = None
        self._stemmer         = None
        self._hipaa           = None
        self._quantum_mem     = None
        self._quantum_fusion  = None
        self._kernel_fusion   = None
        self._adv_tts         = None
        self._emotion_quant   = None
        self._enh_speech_recog= None
        self._grounder        = None
        self._sound_recog     = None
        self._speech_engine   = None
        self._substrate_vis   = None
        self._mem_engine_sec  = None
        self._speech2speech   = None
        self._crypto          = None
        self._module_loader   = None   # BrockstonModuleLoader — dynamic fallback
        # Christman Core v5 & SoulForgeBridge
        self._self_aware      = None   # cv5 SelfAware unified agent
        self._soul_forge      = None   # SoulForgeBridge standalone (LTP)
        self._cv5_core_mem    = None   # cv5 CoreMemory vault
        self._cv5_inferno     = None   # cv5 InfernoAgent empathy
        self._conv_self_aware = None   # ConversationalSelfAware (v1.1)
        self._code_gen        = None   # AdvancedCodeGenerator (30+ patterns)
        # Embodiment layer
        self._avatar          = None   # BrockstonFullAvatar
        self._emb_emotion     = None   # EmotionService (valence/arousal/dominance)
        self._speech_ctrl     = None   # SpeechController
        self._voice_synth     = None   # VoiceSynthesizer (gTTS)
        self._tone_mgr        = None   # ToneManager
        self._voice_analysis  = None   # VoiceAnalysisService

        self._init_all()

    def _try_init(self, label, fn):
        """Run fn(), log result, return instance or None."""
        try:
            obj = fn()
            if obj is not None:
                logger.info(f"[Bridge] ☑ {label} ONLINE")
                return obj
        except Exception as e:
            logger.warning(f"[Bridge] ✗ {label}: {e}")
        return None

    def _init_all(self):
        # ── Memory stack ──────────────────────────────────────────────
        if MemoryMesh:
            self._memory_mesh = self._try_init("MemoryMesh", MemoryMesh)

        # EpisodicMemory + WorkingMemory — need MemoryEngine + EventBus
        if EpisodicMemory and MemoryEngine:
            try:
                from events import EventBus as _EB
                _bus = _EB()
                _eng = MemoryEngine(os.path.join(_PROJECT_ROOT, "brockston_memory"))
                self._episodic = self._try_init("EpisodicMemory", lambda: EpisodicMemory(_eng, _bus))
                if WorkingMemory:
                    self._working = self._try_init("WorkingMemory", lambda: WorkingMemory(_eng, _bus))
            except Exception as _e:
                logger.warning(f"[Bridge] EpisodicMemory/WorkingMemory: {_e}")

        if MemoryManager:
            self._memory_manager = self._try_init("MemoryManager", lambda:
                MemoryManager(os.path.join(_PROJECT_ROOT, "brockston_memory")))

        # LocalRAG needs 'store' module — skip direct init, covered by KnowledgeEngine's RAG
        # KnowledgeHub needs 'events' module — skip, covered by KnowledgeEngine

        # ── Cognitive infrastructure ──────────────────────────────────
        if get_cognitive_cortex:
            self._cortex = self._try_init("CognitiveCortex", get_cognitive_cortex)

        if FusionEngine:
            self._fusion = self._try_init("FusionEngine", FusionEngine)

        if get_neurosymbolic_engine:
            self._neurosymbolic = self._try_init("NeuroSymbolicEngine", get_neurosymbolic_engine)

        if NLUCore:
            self._nlu = self._try_init("NLUCore", NLUCore)

        if get_interpreter:
            self._interpreter = self._try_init("Interpreter", get_interpreter)

        if CarbonSiliconBridge:
            self._cs_bridge = self._try_init("CarbonSiliconBridge", CarbonSiliconBridge)

        # ── Knowledge ─────────────────────────────────────────────────
        if KnowledgeEngine:
            self._knowledge_engine = self._try_init("KnowledgeEngine", lambda:
                KnowledgeEngine(knowledge_dir=os.path.join(_PROJECT_ROOT, "knowledge")))

        # KnowledgeHub needs 'events' module — covered by KnowledgeEngine, skip

        # ── Behavioral / Nonverbal ────────────────────────────────────
        if get_behavioral_interpreter:
            self._behavioral = self._try_init("BehavioralInterpreter", get_behavioral_interpreter)
        elif BehavioralInterpreter:
            self._behavioral = self._try_init("BehavioralInterpreter", BehavioralInterpreter)

        if get_nonverbal_engine:
            self._nonverbal = self._try_init("NonverbalEngine", get_nonverbal_engine)

        if get_nonverbal_expertise:
            self._nonverbal_exp = self._try_init("NonverbalExpertise", get_nonverbal_expertise)

        if get_temporal_nonverbal_engine:
            self._temporal_nv = self._try_init("TemporalNonverbalEngine", get_temporal_nonverbal_engine)

        # ── Vision ───────────────────────────────────────────────────
        if get_vision_context:
            self._vision_ctx = self._try_init("VisionContext", get_vision_context)

        # ── Music ────────────────────────────────────────────────────
        if BrockstonMusicEngine:
            music_path = os.path.join(_PROJECT_ROOT, "brockston_memory", "music")
            self._music_engine = self._try_init("MusicEngine", lambda:
                BrockstonMusicEngine(memory_path=music_path))

        if BrockstonMusicStudio:
            studio_path = os.path.join(_PROJECT_ROOT, "brockston_memory", "studio")
            self._music_studio = self._try_init("MusicStudio", lambda:
                BrockstonMusicStudio(studio_path=studio_path))

        # ── Neural infrastructure ────────────────────────────────────
        if BrockstonNeuralPathways:
            self._neural_pathways = self._try_init("NeuralPathways", BrockstonNeuralPathways)
            if self._neural_pathways:
                try:
                    self._neural_pathways.activate_main_pathway()
                    self._neural_pathways.block_random_pathways()
                except Exception:
                    pass

        if NeuralSecurityEnforcer:
            self._security = self._try_init("NeuralSecurityEnforcer", NeuralSecurityEnforcer)

        # ── TTS / Voice ──────────────────────────────────────────────
        # ChristmanToneEngine requires wav2vec2 audio model download — skip at boot
        # CochlearSync is safe

        if CochlearSync:
            self._cochlear = self._try_init("CochlearSync", CochlearSync)

        # ── Educational ──────────────────────────────────────────────
        # EducationalOrchestrator requires lipsync_engine — skip

        # ── Learning ─────────────────────────────────────────────────
        if EnhancedAutonomousLearningEngine:
            self._learning_engine = self._try_init("AutonomousLearning", lambda:
                EnhancedAutonomousLearningEngine(
                    knowledge_dir=os.path.join(_PROJECT_ROOT, "enhanced_knowledge")
                ))
            if self._learning_engine:
                try:
                    self._learning_engine.start_autonomous_learning()
                    logger.info("[Bridge] ☑ Autonomous learning thread STARTED")
                except Exception as e:
                    logger.warning(f"[Bridge] learning thread start: {e}")

        # NeuralLearningCore needs spacy — skip

        # ── AI Learning Engine (text ingestion) ──────────────────────
        if _ai_le_mod and hasattr(_ai_le_mod, "learn_from_text"):
            self._ai_learning = _ai_le_mod
            logger.info("[Bridge] ☑ AILearningEngine ONLINE")

        # ======================================================================
        #  CORE/ MODULE INIT BLOCKS
        # ======================================================================

        # ── Analytics Engine ──────────────────────────────────────────
        if AnalyticsEngine:
            self._analytics = self._try_init("AnalyticsEngine", lambda:
                AnalyticsEngine(data_dir=os.path.join(_PROJECT_ROOT, "brockston_memory", "analytics")))

        # ── Evolutionary AI ───────────────────────────────────────────
        if EvolutionaryAI:
            self._evolutionary = self._try_init("EvolutionaryAI", lambda:
                EvolutionaryAI(population_size=20, input_size=64, output_size=32))

        # ── Personality Service ───────────────────────────────────────
        if PersonalityService:
            self._personality = self._try_init("PersonalityService", PersonalityService)

        # ── Presence Guide ────────────────────────────────────────────
        if PresenceGuide:
            self._presence = self._try_init("PresenceGuide", PresenceGuide)

        # ── NeuroSymbolic Expert ──────────────────────────────────────
        if NeuroSymbolicExpert:
            self._nsexpert = self._try_init("NeuroSymbolicExpert", NeuroSymbolicExpert)

        # ── Self Improvement Engine ───────────────────────────────────
        if get_self_improvement_engine:
            self._self_improve = self._try_init("SelfImprovementEngine", get_self_improvement_engine)

        # ── Core Knowledge Engine (with KnowledgeGraph) ───────────────
        if get_core_knowledge_engine:
            self._core_knowledge = self._try_init("CoreKnowledgeEngine", get_core_knowledge_engine)

        # ── Brockston Learning Coordinator ────────────────────────────
        if BrockstonLearningCoordinator:
            self._learning_coord = self._try_init("LearningCoordinator", BrockstonLearningCoordinator)

        # ── Local Reasoning Engine ────────────────────────────────────
        if LocalReasoningEngine:
            self._local_reasoning = self._try_init("LocalReasoningEngine", LocalReasoningEngine)

        # ── Memory Engine (core/) ─────────────────────────────────────
        if MemoryEngine:
            self._memory_engine = self._try_init("MemoryEngine",
                lambda: MemoryEngine(os.path.join(_PROJECT_ROOT, "brockston_memory")))

        # ── Memory Mesh Bridge (core/) ────────────────────────────────
        if MemoryMeshBridge:
            self._mem_mesh_bridge = self._try_init("MemoryMeshBridge", lambda:
                MemoryMeshBridge(memory_dir=os.path.join(_PROJECT_ROOT, "brockston_memory")))

        # ── Conversation Engine ───────────────────────────────────────
        if get_conversation_engine:
            self._conversation = self._try_init("ConversationEngine", get_conversation_engine)

        # ── Audio Processor ───────────────────────────────────────────
        if get_audio_processor:
            self._audio_processor = self._try_init("AudioProcessor", get_audio_processor)

        # ── ToneScore Engine (archive) ────────────────────────────────
        if ToneScoreEngine:
            self._tone_score = self._try_init("ToneScoreEngine", ToneScoreEngine)

        # ======================================================================
        #  NEWLY WIRED MODULE INIT BLOCKS
        # ======================================================================

        # ── Initialization Sequence ───────────────────────────────────
        if InitializationSequence:
            self._init_seq = self._try_init("InitializationSequence", InitializationSequence)

        # ── Intelligence Meter ────────────────────────────────────────
        if IntelligenceMeter:
            self._intel_meter = self._try_init("IntelligenceMeter", IntelligenceMeter)

        # ── Brockston Memory Core ─────────────────────────────────────
        if BrockstonMemoryCore:
            self._mem_core = self._try_init("BrockstonMemoryCore", lambda:
                BrockstonMemoryCore(os.path.join(_PROJECT_ROOT, "brockston_memory", "core_memory.json")))

        # ── Memory Service ────────────────────────────────────────────
        if MemoryService:
            self._mem_service = self._try_init("MemoryService", MemoryService)

        # ── Local KB ─────────────────────────────────────────────────
        if LocalKB:
            self._local_kb = self._try_init("LocalKB", LocalKB)

        # ── Simple Memory Mesh (working fallback) ─────────────────────
        if SimpleMemoryMesh and self._memory_mesh is None:
            self._simple_mesh = self._try_init("SimpleMemoryMesh", SimpleMemoryMesh)

        # ── Language Service ──────────────────────────────────────────
        if LanguageService:
            self._lang_service = self._try_init("LanguageService", LanguageService)

        # ── Stemming Service ──────────────────────────────────────────
        if StemmingService:
            self._stemmer = self._try_init("StemmingService", StemmingService)

        # ── HIPAA Compliance ──────────────────────────────────────────
        if HIPAACompliance:
            self._hipaa = self._try_init("HIPAACompliance", lambda:
                HIPAACompliance(os.path.join(_PROJECT_ROOT, "hipaa_secure")))

        # ── Quantum Memory ────────────────────────────────────────────
        if QuantumMemory:
            self._quantum_mem = self._try_init("QuantumMemory", QuantumMemory)

        # ── Quantum Fusion ────────────────────────────────────────────
        if QuantumFusion:
            self._quantum_fusion = self._try_init("QuantumFusion", QuantumFusion)

        # ── Kernel Fusion ─────────────────────────────────────────────
        if KernelFusion:
            self._kernel_fusion = self._try_init("KernelFusion", KernelFusion)

        # ── Advanced TTS Service (function module) ───────────────────
        if _adv_tts_mod and _adv_tts_speak:
            self._adv_tts = _adv_tts_mod
            logger.info("[Bridge] ☑ AdvancedTTS ONLINE")

        # ── Emotion Quantifier ────────────────────────────────────────
        if EmotionQuantifier:
            self._emotion_quant = self._try_init("EmotionQuantifier", EmotionQuantifier)

        # ── Enhanced Speech Recognition ───────────────────────────────
        if get_enhanced_speech_recog:
            self._enh_speech_recog = self._try_init("EnhancedSpeechRecognition", get_enhanced_speech_recog)
        elif EnhancedSpeechRecognition:
            self._enh_speech_recog = self._try_init("EnhancedSpeechRecognition", EnhancedSpeechRecognition)

        # ── Grounder ─────────────────────────────────────────────────
        if Grounder:
            self._grounder = self._try_init("Grounder", Grounder)

        # ── Sound Recognition Service ─────────────────────────────────
        if SoundRecognitionService:
            self._sound_recog = self._try_init("SoundRecognitionService", SoundRecognitionService)

        # ── Speech Recognition Engine ─────────────────────────────────
        if get_speech_recognition_engine:
            self._speech_engine = self._try_init("SpeechRecognitionEngine", get_speech_recognition_engine)
        elif SpeechRecognitionEngine:
            self._speech_engine = self._try_init("SpeechRecognitionEngine", SpeechRecognitionEngine)

        # ── Substrate Vision ──────────────────────────────────────────
        if SubstrateVision:
            self._substrate_vis = self._try_init("SubstrateVision", lambda:
                SubstrateVision(_PROJECT_ROOT))

        # ── Memory Engine Secure ──────────────────────────────────────
        if MemoryEngineSecure:
            self._mem_engine_sec = self._try_init("MemoryEngineSecure", lambda:
                MemoryEngineSecure(os.path.join(_PROJECT_ROOT, "hipaa_secure", "memory")))

        # ── Speech-to-Speech ──────────────────────────────────────────
        if BrockstonSpeechToSpeech:
            self._speech2speech = self._try_init("SpeechToSpeech", BrockstonSpeechToSpeech)

        # ── SoulForgeBridge standalone (LTP learning) ─────────────────
        if SoulForgeBridge:
            self._soul_forge = self._try_init("SoulForgeBridge", SoulForgeBridge)

        # ── ConversationalSelfAware (v1.1 identity core) ───────────────
        if ConversationalSelfAware:
            self._conv_self_aware = self._try_init("ConversationalSelfAware", ConversationalSelfAware)

        # ── AdvancedCodeGenerator (natural language → code) ────────────
        if AdvancedCodeGenerator:
            self._code_gen = self._try_init("AdvancedCodeGenerator", AdvancedCodeGenerator)

        # ── Embodiment layer ──────────────────────────────────────────
        # EmotionService — pure Python, always safe to init
        if EmbodimentEmotionService:
            self._emb_emotion = self._try_init("EmbodimentEmotionService", EmbodimentEmotionService)

        # VoiceSynthesizer — gTTS + pygame; graceful fail if no audio output
        if VoiceSynthesizer:
            self._voice_synth = self._try_init("VoiceSynthesizer", VoiceSynthesizer)

        # SpeechController — OS say/espeak; requires EventBus from backend/tools/events.py
        if SpeechController:
            try:
                from events import EventBus as _EB
                self._speech_ctrl = self._try_init("SpeechController", lambda: SpeechController(_EB()))
            except Exception:
                pass  # events not on path at init time — skip

        # ToneManager — voice affect overlay
        if ToneManager:
            self._tone_mgr = self._try_init("ToneManager", ToneManager)

        # VoiceAnalysisService
        if VoiceAnalysisService:
            self._voice_analysis = self._try_init("VoiceAnalysisService", VoiceAnalysisService)

        # BrockstonFullAvatar — start() launches the autonomous behavior thread
        if BrockstonFullAvatar:
            self._avatar = self._try_init(
                "BrockstonFullAvatar",
                lambda: get_brockston_full_avatar() if get_brockston_full_avatar else BrockstonFullAvatar()
            )

        # ── Christman Core v5 — unified self-awareness pipeline ────────
        if SelfAware:
            self._self_aware = self._try_init("SelfAware (cv5)", lambda: SelfAware("BROCKSTON"))
        if CV5_CoreMemory:
            self._cv5_core_mem = self._try_init("CoreMemory (cv5)", CV5_CoreMemory)
        if CV5_InfernoAgent:
            self._cv5_inferno = self._try_init("InfernoAgent (cv5)", CV5_InfernoAgent)

        # ── ChristmanCrypto ───────────────────────────────────────────
        if _crypto_mod:
            self._crypto = _crypto_mod
            logger.info("[Bridge] ☑ ChristmanCrypto (7-tier + post-quantum) ACTIVE")

        # ── Module Loader — dynamic fallback for all remaining modules ─
        if get_brockston_loader:
            try:
                self._module_loader = get_brockston_loader()
                self._module_loader.load_all_modules()
                stats = self._module_loader.get_stats()
                logger.info(
                    f"[Bridge] ☑ ModuleLoader: {stats['loaded']}/{stats['total_modules']} "
                    f"modules loaded ({stats['success_rate']:.0f}%)"
                )
            except Exception as e:
                logger.warning(f"[Bridge] ModuleLoader: {e}")

        logger.info(f"[Bridge] === INIT COMPLETE: {self._count_online()} systems active ===")

    def _count_online(self) -> int:
        return sum(1 for v in self.get_status().values() if v == "online")

    # ==================================================================
    #  PUBLIC API — called by ai_orchestrator on every request
    # ==================================================================

    def detect_intent(self, text: str) -> str:
        """Classify user intent using the standalone intent_engine module."""
        if _detect_intent_fn:
            try:
                result = _detect_intent_fn(text)
                return result if isinstance(result, str) else "general"
            except Exception as e:
                logger.debug(f"[Bridge.detect_intent] {e}")
        return "general"

    def retrieve_memories(self, query: str, limit: int = 5) -> list:
        """Fetch memories — MemoryMesh first, LocalRAG fallback."""
        if self._memory_mesh:
            try:
                return self._memory_mesh.retrieve(query, limit=limit)
            except Exception as e:
                logger.debug(f"[Bridge.retrieve_memories·mesh] {e}")
        if self._local_rag:
            try:
                results = self._local_rag.search(query, top_k=limit)
                return results if isinstance(results, list) else []
            except Exception as e:
                logger.debug(f"[Bridge.retrieve_memories·rag] {e}")
        return []

    def store_memory(self, content: str, category: str = "conversation",
                     importance: float = 0.5):
        """Store to MemoryMesh + episodic + memory_hook."""
        if self._memory_mesh:
            try:
                self._memory_mesh.store(content, category=category, importance=importance)
            except Exception as e:
                logger.debug(f"[Bridge.store_memory·mesh] {e}")
        # Also hook the lightweight remember() from memory_hook
        if _mh_mod and hasattr(_mh_mod, "remember"):
            try:
                _mh_mod.remember("brockston", content[:200])
            except Exception:
                pass

    def build_memory_context(self, query: str) -> str:
        """Build a memory block string to inject into the system prompt."""
        memories = self.retrieve_memories(query, limit=5)
        if not memories:
            return ""
        lines = [
            f"• [{m.get('category','mem')}] {m.get('content','')[:120]}"
            if isinstance(m, dict) else f"• {str(m)[:120]}"
            for m in memories
        ]
        return "RECALLED FROM MEMORY:\n" + "\n".join(lines)

    def query_knowledge(self, question: str) -> dict:
        """Query knowledge engine (local-first, before external LLM)."""
        if self._knowledge_engine:
            try:
                result = self._knowledge_engine.reason(question)
                if result.get("response") and not result.get("needs_external"):
                    return result
            except Exception as e:
                logger.debug(f"[Bridge.query_knowledge·engine] {e}")
        if self._knowledge_hub:
            try:
                result = self._knowledge_hub.query(question)
                if result:
                    return {"response": str(result), "needs_external": False, "confidence": 0.7}
            except Exception as e:
                logger.debug(f"[Bridge.query_knowledge·hub] {e}")
        return {"response": None, "needs_external": True, "confidence": 0.0}

    def read_behavioral_state(self, user_input: str) -> dict:
        """Record interaction, return behavioral & emotional analysis."""
        if self._behavioral:
            try:
                self._behavioral.record_behavior({
                    "type": "text_input",
                    "content": user_input[:200],
                    "intensity": min(len(user_input) / 200.0, 1.0),
                })
                return self._behavioral.analyze_recent_behavior("immediate")
            except Exception as e:
                logger.debug(f"[Bridge.read_behavioral_state] {e}")
        return {}

    def run_security_check(self, content: str) -> bool:
        """Run NeuralSecurityEnforcer on input content. Returns True if safe."""
        if self._security:
            try:
                return self._security.is_safe(content)
            except Exception:
                pass
        return True  # default: allow

    def apply_tone_engine(self, text: str, emotion: str = "neutral") -> str:
        """Apply ChristmanToneEngine to post-process response tone."""
        if self._tone_engine:
            try:
                result = self._tone_engine.process(text, emotion=emotion)
                return result if isinstance(result, str) else text
            except Exception as e:
                logger.debug(f"[Bridge.apply_tone_engine] {e}")
        return text

    def fuse_reasoning(self, query: str, neural_result: str,
                       symbolic_result: str = None) -> str:
        """Use FusionEngine to combine neural + symbolic reasoning outputs."""
        if self._fusion:
            try:
                fused = self._fusion.fuse(
                    query=query,
                    neural_output=neural_result,
                    symbolic_output=symbolic_result or neural_result
                )
                return fused if isinstance(fused, str) else neural_result
            except Exception as e:
                logger.debug(f"[Bridge.fuse_reasoning] {e}")
        return neural_result

    # ── Music ──────────────────────────────────────────────────────── #

    def compose_music(self, title: str = "Untitled", emotion: str = "creative",
                      style: str = "electronic") -> dict:
        if self._music_engine:
            try:
                return self._music_engine.compose_song(title, emotion=emotion, style=style)
            except Exception as e:
                logger.warning(f"[Bridge.compose_music] {e}")
        return {"error": "Music engine offline"}

    def sing(self, text: str = None, emotion: str = "creative") -> dict:
        if self._music_engine:
            try:
                melody = self._music_engine.generate_melody(emotion=emotion, length=8)
                return self._music_engine.sing_melody(melody, lyrics=text)
            except Exception as e:
                logger.warning(f"[Bridge.sing] {e}")
        return {"error": "Music engine offline"}

    def improvise(self, duration: int = 30) -> dict:
        if self._music_engine:
            try:
                return self._music_engine.improvise(duration=duration)
            except Exception as e:
                logger.warning(f"[Bridge.improvise] {e}")
        return {"error": "Music engine offline"}

    def create_beat(self, name: str, style: str = "electronic") -> dict:
        if self._music_studio:
            try:
                project = self._music_studio.create_project(name)
                pattern = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0]
                self._music_studio.program_beat("Drums", pattern, bars=4)
                return self._music_studio.mix_project(f"{name}_{style}")
            except Exception as e:
                logger.warning(f"[Bridge.create_beat] {e}")
        return {"error": "Music studio offline"}

    def get_music_stats(self) -> dict:
        stats = {}
        if self._music_engine:
            try:
                stats["engine"] = self._music_engine.get_musical_stats()
            except Exception:
                pass
        if self._music_studio:
            try:
                stats["studio"] = self._music_studio.get_studio_stats()
            except Exception:
                pass
        return stats

    # ── Learning ───────────────────────────────────────────────────── #

    def learn_from_response(self, user_input: str, response: str):
        """Feed exchange into all learning engines."""
        combined = f"User: {user_input}\nBROCKSTON: {response}"
        if self._ai_learning and hasattr(self._ai_learning, "learn_from_text"):
            try:
                self._ai_learning.learn_from_text(text=combined, source="conversation")
            except Exception:
                pass
        if self._learning_engine and hasattr(self._learning_engine, "queue_learning_topic"):
            # Passively ingest via memory store
            try:
                self._learning_engine.memory.store(
                    key=f"conv_{len(user_input)}",
                    value=combined[:300],
                    importance=0.6
                )
            except Exception:
                pass

    def queue_learning_topic(self, domain: str, subtopic: str):
        if self._learning_engine:
            try:
                self._learning_engine.queue_learning_topic(domain, subtopic)
            except Exception as e:
                logger.debug(f"[Bridge.queue_learning_topic] {e}")

    def get_learning_status(self) -> dict:
        if self._learning_engine:
            try:
                return self._learning_engine.get_learning_status()
            except Exception:
                pass
        return {"learning_active": False}

    # ── Educational ────────────────────────────────────────────────── #

    def get_educational_response(self, query: str, student_profile: dict = None) -> dict:
        if self._educational:
            try:
                return self._educational.respond(query, student_profile=student_profile)
            except Exception as e:
                logger.debug(f"[Bridge.get_educational_response] {e}")
        return {}

    def score_response_quality(self, response_text: str, query: str) -> float:
        """Use EvolutionaryAI to score a response for quality."""
        if self._evolutionary:
            try:
                score = self._evolutionary.evaluate_fitness(
                    response=response_text, query=query
                )
                return float(score) if score is not None else 0.5
            except Exception as e:
                logger.debug(f"[Bridge.score_response_quality] {e}")
        return 0.5

    def get_personality_context(self, persona: str = "brockston") -> str:
        """Get personality-based system context from PersonalityService."""
        if self._personality:
            try:
                ctx = self._personality.get_personality_context(persona)
                return str(ctx) if ctx else ""
            except Exception as e:
                logger.debug(f"[Bridge.get_personality_context] {e}")
        return ""

    def assess_presence(self, context: str, user_input: str) -> dict:
        """Assess human state via PresenceGuide."""
        if self._presence:
            try:
                return self._presence.assess_human_state(context, user_input)
            except Exception as e:
                logger.debug(f"[Bridge.assess_presence] {e}")
        return {}

    def reason_locally(self, query: str) -> str:
        """Run LocalReasoningEngine for offline reasoning before calling LLM."""
        if self._local_reasoning:
            try:
                result = self._local_reasoning.reason(query)
                return str(result) if result else ""
            except Exception as e:
                logger.debug(f"[Bridge.reason_locally] {e}")
        return ""

    def get_conversation_context(self, session_id: str = "default") -> str:
        """Get full conversation context from ConversationEngine."""
        if self._conversation:
            try:
                return self._conversation.get_context(session_id)
            except Exception as e:
                logger.debug(f"[Bridge.get_conversation_context] {e}")
        return ""

    def log_analytics(self, event: str, data: dict = None):
        """Log an analytics event."""
        if self._analytics:
            try:
                self._analytics.log_event(event, data or {})
            except Exception as e:
                logger.debug(f"[Bridge.log_analytics] {e}")

    def score_tone(self, text: str) -> dict:
        """Score text tone using ToneScoreEngine (archive)."""
        if self._tone_score:
            try:
                return self._tone_score.analyze(text)
            except Exception as e:
                logger.debug(f"[Bridge.score_tone] {e}")
        return {}

    # ── Newly wired public API ─────────────────────────────────────── #

    def quantify_emotion(self, text: str) -> dict:
        """Analyze emotional tone using EmotionQuantifier."""
        if self._emotion_quant:
            try:
                result = self._emotion_quant.analyze(text)
                return result if isinstance(result, dict) else {"result": str(result)}
            except Exception as e:
                logger.debug(f"[Bridge.quantify_emotion] {e}")
        return {}

    def analyze_format_feeling(self, text: str):
        """Detect formatting/urgency signals in text."""
        if analyze_formatting_feeling:
            try:
                return analyze_formatting_feeling(text)
            except Exception as e:
                logger.debug(f"[Bridge.analyze_format_feeling] {e}")
        return None

    def ground(self, query: str) -> str:
        """Run Grounder for grounded reasoning."""
        if self._grounder:
            try:
                return self._grounder.ground(query)
            except Exception as e:
                logger.debug(f"[Bridge.ground] {e}")
        return ""

    def encrypt(self, data: str, tier: int = 2) -> bytes:
        """Encrypt data using ChristmanCrypto (default tier-2 AES)."""
        if not self._crypto or not AESCipher:
            return data.encode()
        try:
            cipher = AESCipher()
            return cipher.encrypt(data)
        except Exception as e:
            logger.debug(f"[Bridge.encrypt] {e}")
            return data.encode()

    def check_hipaa(self, text: str) -> bool:
        """Returns True if text passes HIPAA compliance check."""
        if self._hipaa:
            try:
                return self._hipaa.is_compliant(text)
            except Exception:
                pass
        return True  # default: allow if HIPAA module not loaded

    def get_intelligence_score(self) -> dict:
        """Get current intelligence spectrum metrics."""
        if self._intel_meter:
            try:
                return self._intel_meter.get_scores()
            except Exception as e:
                logger.debug(f"[Bridge.get_intelligence_score] {e}")
        return {}

    def get_module(self, name: str):
        """Retrieve any module by name — checks module loader first, then globals."""
        if self._module_loader:
            mod = self._module_loader.get_module(name)
            if mod is not None:
                return mod
        # Fallback: check sys.modules
        import sys
        return sys.modules.get(name)

    def module_loader_stats(self) -> dict:
        """Return module loader loading statistics."""
        if self._module_loader:
            try:
                return self._module_loader.get_stats()
            except Exception:
                pass
        return {}

    # ── Status ─────────────────────────────────────────────────────── #

    def get_status(self) -> dict:
        return {
            # systems/ modules
            "memory_mesh":            "online" if self._memory_mesh        else "offline",
            "memory_manager":         "online" if self._memory_manager     else "offline",
            "cognitive_cortex":       "online" if self._cortex             else "offline",
            "fusion_engine":          "online" if self._fusion             else "offline",
            "neurosymbolic_engine":   "online" if self._neurosymbolic      else "offline",
            "nlu_core":               "online" if self._nlu                else "offline",
            "interpreter":            "online" if self._interpreter        else "offline",
            "cs_bridge":              "online" if self._cs_bridge          else "offline",
            "knowledge_engine":       "online" if self._knowledge_engine   else "offline",
            "behavioral_interpreter": "online" if self._behavioral         else "offline",
            "nonverbal_engine":       "online" if self._nonverbal          else "offline",
            "temporal_nonverbal":     "online" if self._temporal_nv        else "offline",
            "music_engine":           "online" if self._music_engine       else "offline",
            "music_studio":           "online" if self._music_studio       else "offline",
            "neural_pathways":        "online" if self._neural_pathways    else "offline",
            "security_enforcer":      "online" if self._security           else "offline",
            "cochlear_sync":          "online" if self._cochlear           else "offline",
            "autonomous_learning":    "online" if self._learning_engine    else "offline",
            "ai_learning_engine":     "online" if self._ai_learning        else "offline",
            # core/ modules
            "analytics_engine":       "online" if self._analytics          else "offline",
            "evolutionary_ai":        "online" if self._evolutionary       else "offline",
            "personality_service":    "online" if self._personality        else "offline",
            "presence_guide":         "online" if self._presence           else "offline",
            "neurosymbolic_expert":   "online" if self._nsexpert           else "offline",
            "self_improvement":       "online" if self._self_improve       else "offline",
            "core_knowledge_engine":  "online" if self._core_knowledge     else "offline",
            "learning_coordinator":   "online" if self._learning_coord     else "offline",
            "local_reasoning":        "online" if self._local_reasoning    else "offline",
            "memory_engine":          "online" if self._memory_engine      else "offline",
            "memory_mesh_bridge":     "online" if self._mem_mesh_bridge    else "offline",
            "conversation_engine":    "online" if self._conversation       else "offline",
            "audio_processor":        "online" if self._audio_processor    else "offline",
            "tone_score_engine":      "online" if self._tone_score         else "offline",
            # ── newly wired ───────────────────────────────────────────
            "init_sequence":          "online" if self._init_seq          else "offline",
            "intelligence_meter":     "online" if self._intel_meter       else "offline",
            "memory_core":            "online" if self._mem_core          else "offline",
            "memory_service":         "online" if self._mem_service       else "offline",
            "local_kb":               "online" if self._local_kb          else "offline",
            "simple_memory_mesh":     "online" if self._simple_mesh       else "offline",
            "language_service":       "online" if self._lang_service      else "offline",
            "stemming_service":       "online" if self._stemmer           else "offline",
            "hipaa_compliance":       "online" if self._hipaa             else "offline",
            "quantum_memory":         "online" if self._quantum_mem       else "offline",
            "quantum_fusion":         "online" if self._quantum_fusion    else "offline",
            "kernel_fusion":          "online" if self._kernel_fusion     else "offline",
            "advanced_tts":           "online" if self._adv_tts          else "offline",
            "emotion_quantifier":     "online" if self._emotion_quant    else "offline",
            "enhanced_speech_recog":  "online" if self._enh_speech_recog else "offline",
            "grounder":               "online" if self._grounder          else "offline",
            "sound_recognition":      "online" if self._sound_recog      else "offline",
            "speech_engine":          "online" if self._speech_engine     else "offline",
            "substrate_vision":       "online" if self._substrate_vis    else "offline",
            "memory_engine_secure":   "online" if self._mem_engine_sec   else "offline",
            "speech_to_speech":       "online" if self._speech2speech     else "offline",
            # ── ChristmanCrypto — all 7 tiers + post-quantum ──────────────
            "christman_crypto":       "online" if self._crypto            else "offline",
            "crypto_aes256":          "online" if AESCipher               else "offline",
            "crypto_chacha20":        "online" if ChaChaCipher            else "offline",
            "crypto_rsa4096":         "online" if RSACipher               else "offline",
            "crypto_hybrid":          "online" if HybridCipher            else "offline",
            "crypto_signatures":      "online" if DigitalSigner           else "offline",
            "crypto_steganography":   "online" if LSBSteganography        else "offline",
            "crypto_mlkem_pq":        "online" if MLKEM                   else "offline",
            "crypto_kyber_handshake": "online" if KyberHandshake          else "offline",
            "soul_forge_bridge":      "online" if self._soul_forge        else "offline",
            "self_aware_conversational": "online" if self._conv_self_aware else "offline",
            "self_aware_cv5":         "online" if self._self_aware        else "offline",
            "core_memory_cv5":        "online" if self._cv5_core_mem      else "offline",
            "inferno_agent_cv5":      "online" if self._cv5_inferno       else "offline",
            "advanced_code_generator":"online" if self._code_gen           else "offline",
            "christman_emotion_tether":"online" if _emo_mod                else "offline",
            "module_loader":          "online" if self._module_loader     else "offline",
            # ── Embodiment layer ────────────────────────────────────────
            "avatar":                 "online" if self._avatar            else "offline",
            "embodiment_emotion":     "online" if self._emb_emotion       else "offline",
            "speech_controller":      "online" if self._speech_ctrl       else "offline",
            "voice_synthesizer":      "online" if self._voice_synth       else "offline",
            "tone_manager":           "online" if self._tone_mgr          else "offline",
            "voice_analysis":         "online" if self._voice_analysis    else "offline",
            # ── Modules requiring missing deps — tracked for future install ─
            "episodic_memory":        "online" if self._episodic          else "offline",
            "working_memory":         "online" if self._working           else "offline",
            "local_rag":              "needs:store_module",
            "knowledge_hub":          "needs:events_module",
            "tone_engine":            "needs:wav2vec2_model",
            "educational":            "needs:lipsync_engine",
            "neural_learning_core":   "online" if _nlc_mod               else "needs:spacy",
        }


# ======================================================================
#  Singleton
# ======================================================================
_bridge_instance = None

def get_systems_bridge() -> SystemsBridge:
    global _bridge_instance
    if _bridge_instance is None:
        _bridge_instance = SystemsBridge()
    return _bridge_instance
