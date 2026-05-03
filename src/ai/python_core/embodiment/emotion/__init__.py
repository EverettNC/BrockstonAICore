"""
embodiment.emotion — delegates entirely to christman_voice_sdk.

Brain_core.py imports:
    from embodiment.emotion import emotion_service

That service is backed by the real ToneScore + EmotionEmbedder pipeline
from christman_voice_sdk, not a stub.
"""
import logging
import sys
import os

logger = logging.getLogger(__name__)

# Ensure repo root is on path so christman_voice_sdk is importable
_repo_root = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..")
)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

try:
    from christman_voice_sdk import get_response_mode, get_response_emotion, ToneScoreResult
    from christman_voice_sdk.tonescore_api import analyze_tone, compute_tonescore
    _sdk_available = True
    logger.info("🎭 embodiment.emotion wired to christman_voice_sdk")
except ImportError as e:
    _sdk_available = False
    logger.warning(f"christman_voice_sdk not available for emotion service: {e}")


class _EmotionService:
    """
    Thin facade over christman_voice_sdk.
    Provides the `emotion_service` singleton brain_core.py expects.
    All tone/emotion intelligence routes through the real SDK.
    """

    @property
    def sdk_available(self) -> bool:
        return _sdk_available

    def score_from_audio(self, audio_path: str):
        """Run full 5-layer ToneScore analysis on an audio file."""
        if not _sdk_available:
            logger.warning("ToneScore unavailable — christman_voice_sdk not loaded")
            return None
        return compute_tonescore(audio_path)

    def get_response_mode(self, tone_score: float):
        """Return recommended response mode for a given ToneScore."""
        if not _sdk_available:
            return {"mode": "standard"}
        return get_response_mode(tone_score)

    def get_response_emotion(self, tone_score: float):
        """Return emotion params for voice synthesis at a given ToneScore."""
        if not _sdk_available:
            return {}
        return get_response_emotion(tone_score)


# Singleton — imported by brain_core.py as:
#   from embodiment.emotion import emotion_service
emotion_service = _EmotionService()
