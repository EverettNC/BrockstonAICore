import logging
from typing import Dict, Tuple

import numpy as np

try:
    from embodiment.emotion import emotion_service
except ImportError:
    class _NullEmotionService:
        def update_from_voice(self, *args, **kwargs): pass
        def update_from_conversation(self, *args, **kwargs): pass
    emotion_service = _NullEmotionService()

logger = logging.getLogger(__name__)


class VoiceAnalysisService:
    def __init__(self):
        self.gesture_responses = {
            "wave_left": {
                "default": "I see you waving left",
                "confident": "Great left wave!",
                "uncertain": "Try moving your left hand more clearly",
            },
            "wave_right": {
                "default": "I see you waving right",
                "confident": "Excellent right wave!",
                "uncertain": "Try moving your right hand more smoothly",
            },
            "hand_up": {
                "default": "Hand raised",
                "confident": "Perfect hand raise!",
                "uncertain": "Try raising your hand a bit higher",
            },
            "hand_down": {
                "default": "Hand lowered",
                "confident": "Smooth downward motion!",
                "uncertain": "Try lowering your hand more steadily",
            },
            "circular": {
                "default": "Circular motion detected",
                "confident": "Beautiful circular movement!",
                "uncertain": "Try making a more complete circle",
            },
            "two_hands": {
                "default": "Two hands detected",
                "confident": "Perfect two-handed gesture!",
                "uncertain": "Try keeping both hands visible",
            },
        }

    def gesture_to_speech(self, gesture: str, confidence: float = 0.0) -> str:
        """Convert a gesture to speech feedback based on confidence level.

        Args:
            gesture: The type of gesture detected
            confidence: Confidence level of the gesture detection (0.0 to 1.0)

        Returns:
            Appropriate speech response based on gesture and confidence
        """
        try:
            responses = self.gesture_responses.get(
                gesture,
                {
                    "default": "Movement detected",
                    "confident": "Good movement!",
                    "uncertain": "Try that movement again",
                },
            )

            if confidence > 0.8:
                return responses["confident"]
            elif confidence < 0.4:
                return responses["uncertain"]
            else:
                return responses["default"]

        except Exception as e:
            logger.error(f"Error generating speech for gesture {gesture}: {str(e)}")
            return "I noticed your gesture"

    def analyze_tone(
        self, audio_data: bytes
    ) -> Tuple[Dict[str, float], Dict[str, float], float]:
        """Proprietary ToneScore™ analysis via Christman Voice SDK.
        
        Returns: (emotions dict, communication_patterns dict, confidence score)
        """
        import tempfile
        import os
        import uuid
        
        try:
            from christman_voice_sdk.tonescore_api import compute_tonescore
            
            # Save audio_data to temporary wav for SDK analysis
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp.write(audio_data)
                temp_path = tmp.name
            
            try:
                # Run proprietary analysis
                result = compute_tonescore(temp_path)
                
                # Map ToneScore results to the legacy interface
                emotions = {
                    "calm": 1.0 - result.arousal,
                    "engaged": result.valence,
                    "uncertain": 1.0 - result.intensity,
                    "focused": result.arousal * result.intensity,
                    "overwhelmed": result.intensity if result.valence < 0.5 else 0.0
                }
                
                communication_patterns = {
                    "rhythm_consistency": result.response_mode.get("rhythm", 0.5),
                    "sound_complexity": result.response_mode.get("complexity", 0.5),
                    "pattern_repetition": 0.5, # Placeholder from SDK
                    "intensity_control": result.intensity,
                    "engagement_level": result.valence
                }
                
                confidence = result.score
                
                return emotions, communication_patterns, confidence
                
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        except ImportError:
            logger.warning("Christman Voice SDK not found, falling back to basic analysis")
            return self._get_default_response()
        except Exception as e:
            logger.error(f"Error during ToneScore analysis: {e}")
            return self._get_default_response()

        except Exception as e:
            logger.error(f"Error analyzing audio patterns: {str(e)}", exc_info=True)
            return self._get_default_response()

    def _detect_repetitive_patterns(self, frame_energies: list) -> float:
        """Enhanced detection of repetitive patterns that might indicate self-
        stimulating behavior or communication attempts."""
        if len(frame_energies) < 2:
            return 0.0

        try:
            # Calculate frame differences
            diffs = np.diff(frame_energies)

            if len(diffs) == 0:
                return 0.0

            # Enhanced pattern detection
            mean_abs_diff = np.mean(np.abs(diffs))
            if mean_abs_diff == 0:
                return 0.0

            # Calculate pattern strength with stability check
            pattern_strength = 1.0 - (np.std(diffs) / (mean_abs_diff + 1e-6))

            return float(max(min(pattern_strength, 1.0), 0.0))

        except Exception as e:
            logger.error(f"Error detecting repetitive patterns: {str(e)}")
            return 0.0

    def _get_default_response(self) -> Tuple[Dict[str, float], Dict[str, float], float]:
        """Returns balanced default values when analysis fails."""
        return (
            {
                "calm": 0.2,
                "engaged": 0.2,
                "uncertain": 0.2,
                "focused": 0.2,
                "overwhelmed": 0.2,
            },
            {
                "rhythm_consistency": 0.0,
                "sound_complexity": 0.0,
                "pattern_repetition": 0.0,
                "intensity_control": 0.0,
                "engagement_level": 0.0,
            },
            0.5,
        )


# ==============================================================================
# © 2025 Everett Nathaniel Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
#
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================
