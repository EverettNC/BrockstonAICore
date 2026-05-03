"""
embodiment.voice namespace package.

Real voice engines (TTS, STT, ToneScore, synthesis) are implemented
in christman_voice_sdk. This __init__.py exists only so Python can
resolve `embodiment.voice.*` import paths in brockston_module_loader.py.

Individual .py files (tts_service.py, tts_bridge.py, etc.) that live
in this directory are the actual module implementations.
"""
