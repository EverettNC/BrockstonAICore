# Christman AI Proprietary.
"""Base synthesizer interface and SynthesisResult container."""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Dict


@dataclass
class SynthesisResult:
    """Output from any synthesis engine."""
    audio_path: Optional[Path] = None
    audio_bytes: Optional[bytes] = None
    sample_rate: int = 22050
    duration_seconds: float = 0.0
    emotion_params: Dict = field(default_factory=dict)
    engine_used: str = "unknown"
    success: bool = False
    error: Optional[str] = None


class BaseSynthesizer:
    """Interface contract for all Christman Voice synthesis engines."""

    def load_voice(self, reference_audio: Path) -> None:
        raise NotImplementedError

    def synthesize(
        self,
        text: str,
        emotion_params: Optional[Dict] = None,
        **kwargs,
    ) -> SynthesisResult:
        raise NotImplementedError
