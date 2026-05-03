"""
embodiment.voice package — BROCKSTON's voice and audio subsystems.

Modules in this package:
  tts_service                 — Primary text-to-speech service
  tts_bridge                  — TTS bridge layer
  tts_bridget                 — TTS bridge variant
  tts_advanced                — Advanced TTS features
  speech_recognition_engine   — Main speech recognition engine
  real_speech_recognition     — Hardware speech recognition
  audio_processor             — Raw audio processing
  audio_pattern               — Audio pattern analysis
  tone_manager                — Tone management
  tone_score_engine           — Tone scoring
  sound_recognition           — Environmental sound recognition
  sound_recognition_service   — Sound recognition service layer
  derek_interface             — Derek voice interface

All modules in this package are loaded dynamically by
brockston_module_loader.py. Individual .py files for each module
must be placed in this directory to be importable.
"""
