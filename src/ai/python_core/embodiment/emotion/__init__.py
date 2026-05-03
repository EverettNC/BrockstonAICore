"""
embodiment.emotion package — BROCKSTON's emotion state service.

Imported by brain_core.py as:
    from embodiment.emotion import emotion_service
"""
import logging

logger = logging.getLogger(__name__)


class EmotionState:
    """Represents BROCKSTON's current emotional state"""

    def __init__(self):
        self.mood = "neutral"
        self.valence = 0.0      # -1.0 (negative) to 1.0 (positive)
        self.arousal = 0.0      # 0.0 (calm) to 1.0 (excited)
        self.empathy_level = 0.5

    def __dict__(self):
        return {
            "mood": self.mood,
            "valence": self.valence,
            "arousal": self.arousal,
            "empathy_level": self.empathy_level,
        }


class EmotionService:
    """Service for managing and querying BROCKSTON's emotional state"""

    def __init__(self):
        self._state = EmotionState()

    def get_state(self) -> EmotionState:
        return self._state

    def set_mood(self, mood: str, valence: float = 0.0, arousal: float = 0.0):
        self._state.mood = mood
        self._state.valence = max(-1.0, min(1.0, valence))
        self._state.arousal = max(0.0, min(1.0, arousal))
        logger.info(f"🎭 Emotion updated: {mood} (v={valence:.2f}, a={arousal:.2f})")

    def update_from_text(self, text: str):
        """Basic heuristic emotion detection from text — extend with christman_emotion"""
        text_lower = text.lower()
        if any(w in text_lower for w in ["happy", "great", "love", "wonderful"]):
            self.set_mood("positive", valence=0.7, arousal=0.5)
        elif any(w in text_lower for w in ["sad", "hurt", "pain", "cry"]):
            self.set_mood("empathetic", valence=-0.3, arousal=0.2)
        elif any(w in text_lower for w in ["angry", "frustrated", "hate"]):
            self.set_mood("concerned", valence=-0.5, arousal=0.7)
        else:
            self.set_mood("neutral", valence=0.0, arousal=0.2)


# Singleton — imported as `from embodiment.emotion import emotion_service`
emotion_service = EmotionService()
