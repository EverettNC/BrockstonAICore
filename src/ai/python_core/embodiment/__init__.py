"""
embodiment package — BROCKSTON's physical expression layer.

This package provides the namespace for all embodiment sub-packages:
  embodiment.voice.*   — TTS, STT, audio processing, tone engines
  embodiment.avatar.*  — Avatar rendering and lipsync
  embodiment.emotion   — Emotion state service

This __init__.py must exist for Python to resolve `embodiment.voice.*`
import paths registered in brockston_module_loader.py.
"""
