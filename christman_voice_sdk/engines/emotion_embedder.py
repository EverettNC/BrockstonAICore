# Christman AI Proprietary.
"""EmotionEmbedder — derives synthesis-ready emotion params from ToneScore."""
from __future__ import annotations
from dataclasses import dataclass
from typing import Dict

from christman_voice_sdk.utils.config import Tier
from christman_voice_sdk.core.tone_analyzer import ToneScoreCalculator


@dataclass
class EmotionEmbedding:
    """Synthesis-ready emotion parameters."""
    tone_score: float
    mode: str
    arousal: float
    valence: float
    warmth: float
    pace_modifier: float  # 1.0 = normal, <1.0 = slower, >1.0 = faster

    def to_dict(self) -> Dict:
        return {
            "tone_score": self.tone_score,
            "mode": self.mode,
            "arousal": self.arousal,
            "valence": self.valence,
            "warmth": self.warmth,
            "pace_modifier": self.pace_modifier,
        }


class EmotionEmbedder:
    """Maps ToneScore to synthesis emotion parameters per tier."""

    def __init__(self, tier: Tier = Tier.ULTRA):
        self.tier = tier

    def get_response_mode_emotion(self, tone_score: float) -> EmotionEmbedding:
        mode_info = ToneScoreCalculator.get_response_mode(tone_score)
        mode = mode_info["mode"]

        if mode == "hold_space":
            return EmotionEmbedding(
                tone_score=tone_score, mode=mode,
                arousal=0.2, valence=-0.3,
                warmth=0.95, pace_modifier=0.85,
            )
        elif mode == "gentle_lift":
            return EmotionEmbedding(
                tone_score=tone_score, mode=mode,
                arousal=0.4, valence=0.2,
                warmth=0.8, pace_modifier=0.95,
            )
        else:
            return EmotionEmbedding(
                tone_score=tone_score, mode=mode,
                arousal=0.5, valence=0.5,
                warmth=0.65, pace_modifier=1.0,
            )
