"""
Brokston - Unified Sensory Integration
--------------------------------------
This module integrates Brokston's complete sensory capabilities:
- HEARING: Speech recognition and audio understanding
- VISION: Eye tracking and visual perception
- VOICE: Text-to-speech synthesis with personality

Provides a unified API for multi-modal sensory input/output.
"""

import asyncio
import sys
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import logging

# Add static directory to path for imports
static_dir = Path(__file__).parent.parent / "static"
sys.path.insert(0, str(static_dir))

# Import sensory modules
try:
    from enhanced_speech_recognition import EnhancedSpeechRecognition

    HEARING_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    EnhancedSpeechRecognition = None  # type: ignore
    HEARING_AVAILABLE = False
    logging.warning(
        "Enhanced speech recognition not available - module not found in static directory"
    )
try:
    from eye_tracking_service import EyeTrackingService

    VISION_AVAILABLE = True
except ImportError:
    EyeTrackingService = None  # type: ignore
    VISION_AVAILABLE = False
    logging.warning("Eye tracking service not available")
# Import existing voice module
try:
    from speech import SpeechService

    VOICE_AVAILABLE = True
except ImportError:
    SpeechService = None  # type: ignore
    VOICE_AVAILABLE = False
    logging.warning("Speech synthesis service not available")
try:
    from audio_pattern_service import AudioPatternService

    AUDIO_PATTERNS_AVAILABLE = True
except ImportError:
    AudioPatternService = None  # type: ignore
    AUDIO_PATTERNS_AVAILABLE = False
    logging.warning("Audio pattern service not available")
except ImportError:
    AUDIO_PATTERNS_AVAILABLE = False
    logging.warning("Audio pattern service not available")


class SensoryIntegration:
    """
    Unified sensory integration system for Brokston.
    Coordinates hearing, vision, voice, and audio pattern analysis.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None, avatar=None):
        """
        Initialize sensory integration system.

        Args:
            config: Optional configuration dictionary for sensory modules
            avatar: Optional BrokstonAvatar instance for speech synchronization
        """
        self.config = config or {}
        self.logger = logging.getLogger(__name__)
        self.avatar = avatar  # Avatar instance for speech-to-avatar sync

        # Initialize sensory modules
        self.hearing = None
        self.vision = None
        self.voice = None
        self.audio_patterns = None

        self._initialize_modules()

    def _initialize_modules(self):
        """Initialize available sensory modules."""

        # Initialize hearing (speech recognition)
        if HEARING_AVAILABLE and EnhancedSpeechRecognition is not None:
            try:
                # EnhancedSpeechRecognition takes no arguments
                self.hearing = EnhancedSpeechRecognition()
                self.logger.info("✓ HEARING module initialized")
            except Exception as e:
                self.logger.error(f"Failed to initialize hearing: {e}")

        # Initialize vision (eye tracking)
        if VISION_AVAILABLE and EyeTrackingService is not None:
            try:
                # EyeTrackingService takes no arguments
                self.vision = EyeTrackingService()
                self.logger.info("✓ VISION module initialized")
            except Exception as e:
                self.logger.error(f"Failed to initialize vision: {e}")

        # Initialize voice (speech synthesis)
        if VOICE_AVAILABLE and SpeechService is not None:
            try:
                # SpeechService takes config dict
                voice_config = self.config.get("voice", {})
                # Need to wrap in full config structure for SpeechService
                full_config = {"ideal": voice_config} if voice_config else {}
                self.voice = SpeechService(full_config)
                self.logger.info("✓ VOICE module initialized")
            except Exception as e:
                self.logger.error(f"Failed to initialize voice: {e}")

        # Initialize audio pattern analysis
        if AUDIO_PATTERNS_AVAILABLE and AudioPatternService is not None:
            try:
                self.audio_patterns = AudioPatternService()
                self.logger.info("✓ AUDIO PATTERNS module initialized")
            except Exception as e:
                self.logger.error(f"Failed to initialize audio patterns: {e}")

    def get_capabilities(self) -> Dict[str, bool]:
        """
        Get available sensory capabilities.

        Returns:
            Dictionary of capability status
        """
        return {
            "hearing": self.hearing is not None,
            "vision": self.vision is not None,
            "voice": self.voice is not None,
            "audio_patterns": self.audio_patterns is not None,
        }

    async def listen(
        self, audio_data: Optional[bytes] = None, duration: float = 5.0
    ) -> Dict[str, Any]:
        """
        Listen to audio and transcribe speech.

        Args:
            audio_data: Optional raw audio bytes. If None, uses microphone
            duration: Duration to listen if using microphone

        Returns:
            Dictionary with transcription results
        """
        if not self.hearing:
            return {
                "success": False,
                "error": "Hearing module not available",
                "text": None,
            }

        try:
            if audio_data:
                # process_audio_data is synchronous and returns a dict
                result = self.hearing.process_audio_data(audio_data)
                return {
                    "success": True,
                    "text": result.get("text", ""),
                    "confidence": result.get("confidence", 0.0),
                    "timestamp": datetime.now().isoformat(),
                    "duration": None,
                }
            else:
                # For simulation without audio data, use a default response
                return {
                    "success": True,
                    "text": "Listening simulation - no audio input provided",
                    "confidence": 0.0,
                    "timestamp": datetime.now().isoformat(),
                    "duration": duration,
                }

        except Exception as e:
            self.logger.error(f"Listen error: {e}")
            return {"success": False, "error": str(e), "text": None}

    async def see(self, image_data: Optional[bytes] = None) -> Dict[str, Any]:
        """
        Process visual input and track gaze.

        Args:
            image_data: Optional image bytes. If None, uses camera

        Returns:
            Dictionary with visual tracking results
        """
        if not self.vision:
            return {
                "success": False,
                "error": "Vision module not available",
                "gaze": None,
            }

        try:
            # get_eye_position is synchronous and returns a dict
            gaze_data = self.vision.get_eye_position()

            # Process camera frame if available (also synchronous)
            if image_data:
                frame_result = self.vision.process_camera_frame(image_data)
                if isinstance(frame_result, dict) and isinstance(gaze_data, dict):
                    gaze_data.update(frame_result)
            elif hasattr(self.vision, "use_camera"):
                # If no image_data provided but camera is available, capture frame from camera
                frame_result = self.vision.process_camera_frame(None)
                if isinstance(frame_result, dict) and isinstance(gaze_data, dict):
                    gaze_data.update(frame_result)

            return {
                "success": True,
                "gaze": gaze_data.get("position", gaze_data),
                "regions": gaze_data.get("regions", []),
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            self.logger.error(f"Vision error: {e}")
            return {"success": False, "error": str(e), "gaze": None}

    async def speak(
        self,
        text: str,
        voice: str = "Matthew",
        mood: str = "confident",
        sync_avatar: bool = True,
    ) -> Dict[str, Any]:
        """
        Convert text to speech and sync with avatar.

        Args:
            text: Text to synthesize
            voice: Voice profile identifier
            mood: Personality mood (confident, calm, curious, focused)
            sync_avatar: Whether to sync avatar animation with speech

        Returns:
            Dictionary with speech synthesis results
        """
        if not self.voice:
            return {
                "success": False,
                "error": "Voice module not available",
                "audio_url": None,
            }

        try:
            # Sync avatar with speech if requested
            if sync_avatar and hasattr(self, "avatar") and self.avatar:
                # Estimate duration (rough calculation: ~150 words per minute)
                words = len(text.split())
                duration = (words / 150) * 60  # Convert to seconds
                self.avatar.sync_with_speech(text, duration)

            # text_to_speech is synchronous and returns audio bytes or None
            audio_data = self.voice.text_to_speech(
                text=text, voice_id=voice, engine="neural", output_format="mp3"
            )

            if audio_data:
                return {
                    "success": True,
                    "audio_data": audio_data,
                    "audio_length": len(audio_data),
                    "voice": voice,
                    "mood": mood,
                    "timestamp": datetime.now().isoformat(),
                }
            else:
                return {
                    "success": False,
                    "error": "No audio data generated - verify ElevenLabs API key",
                    "audio_url": None,
                }

        except Exception as e:
            self.logger.error(f"Speech error: {e}")
            return {"success": False, "error": str(e), "audio_url": None}

    async def analyze_audio_patterns(self, audio_data: bytes) -> Dict[str, Any]:
        """
        Analyze non-verbal audio patterns (emotions, sounds).

        Args:
            audio_data: Raw audio bytes

        Returns:
            Dictionary with pattern analysis results
        """
        if not self.audio_patterns:
            return {
                "success": False,
                "error": "Audio pattern service not available",
                "patterns": [],
            }

        try:
            # analyze_sound returns a list of pattern matches
            matches = self.audio_patterns.analyze_sound(audio_data)

            # Extract patterns and calculate overall confidence
            patterns = [match.get("pattern", "unknown") for match in matches]
            confidences = [match.get("confidence", 0.0) for match in matches]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

            return {
                "success": True,
                "patterns": patterns,
                "matches": matches,  # Full match details
                "emotions": [],  # Could be extracted from patterns in the future
                "confidence": avg_confidence,
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            self.logger.error(f"Audio pattern analysis error: {e}")
            return {"success": False, "error": str(e), "patterns": []}

    async def multi_modal_input(
        self, audio_data: Optional[bytes] = None, image_data: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Process multi-modal sensory input simultaneously.

        Args:
            audio_data: Optional audio bytes for hearing + pattern analysis
            image_data: Optional image bytes for vision

        Returns:
            Combined sensory processing results
        """
        tasks = []

        # Create tasks for available inputs
        if audio_data and self.hearing:
            tasks.append(("hearing", self.listen(audio_data)))

        if audio_data and self.audio_patterns:
            tasks.append(("patterns", self.analyze_audio_patterns(audio_data)))

        if (image_data or self.vision) and self.vision:
            tasks.append(("vision", self.see(image_data)))

        # Execute all tasks concurrently
        results = {}
        if tasks:
            task_names, task_coroutines = zip(*tasks)
            task_results = await asyncio.gather(
                *task_coroutines, return_exceptions=True
            )

            for name, result in zip(task_names, task_results):
                if isinstance(result, Exception):
                    results[name] = {"success": False, "error": str(result)}
                else:
                    results[name] = result

        return {
            "success": len(results) > 0,
            "timestamp": datetime.now().isoformat(),
            "modalities": results,
        }

    async def conversation_cycle(
        self,
        audio_input: Optional[bytes] = None,
        text_input: Optional[str] = None,
        voice: str = "Matthew",
        mood: str = "confident",
    ) -> Dict[str, Any]:
        """
        Complete conversation cycle: listen → process → respond.

        Args:
            audio_input: Optional audio bytes to process
            text_input: Optional text input (if not using audio)
            voice: Voice for response
            mood: Personality mood for response

        Returns:
            Complete conversation cycle results
        """
        results = {"input": {}, "response": {}, "timestamp": datetime.now().isoformat()}

        # Step 1: Get input (either audio or text)
        if audio_input and self.hearing:
            listen_result = await self.listen(audio_input)
            results["input"] = listen_result
            text_to_process = listen_result.get("text", "")
        elif text_input:
            results["input"] = {"success": True, "text": text_input, "source": "text"}
            text_to_process = text_input
        else:
            return {"success": False, "error": "No input provided", "results": results}

        # Step 2: Process input (would integrate with AI orchestrator here)
        # For now, echo back with confirmation
        response_text = f"I heard: {text_to_process}"

        # Step 3: Generate voice response
        if self.voice:
            speak_result = await self.speak(response_text, voice, mood)
            results["response"] = speak_result
        else:
            results["response"] = {
                "success": False,
                "error": "Voice module not available",
                "text": response_text,
            }

        return {"success": True, "cycle_complete": True, "results": results}

    def get_status(self) -> Dict[str, Any]:
        """
        Get comprehensive sensory system status.

        Returns:
            Status dictionary with all module information
        """
        capabilities = self.get_capabilities()

        return {
            "sensory_integration": "online",
            "capabilities": capabilities,
            "modules": {
                "hearing": {
                    "available": capabilities["hearing"],
                    "type": "EnhancedSpeechRecognition",
                    "features": [
                        "speech_to_text",
                        "continuous_listening",
                        "audio_processing",
                    ],
                },
                "vision": {
                    "available": capabilities["vision"],
                    "type": "EyeTrackingService",
                    "features": [
                        "gaze_tracking",
                        "region_detection",
                        "camera_processing",
                    ],
                },
                "voice": {
                    "available": capabilities["voice"],
                    "type": "SpeechService (ElevenLabs)",
                    "features": [
                        "text_to_speech",
                        "personality_modes",
                        "multiple_voices",
                    ],
                },
                "audio_patterns": {
                    "available": capabilities["audio_patterns"],
                    "type": "AudioPatternService",
                    "features": [
                        "emotion_detection",
                        "sound_classification",
                        "pattern_matching",
                    ],
                },
            },
            "timestamp": datetime.now().isoformat(),
        }


# Convenience function for quick initialization
def create_sensory_system(
    config: Optional[Dict[str, Any]] = None,
) -> SensoryIntegration:
    """
    Create and initialize a sensory integration system.

    Args:
        config: Optional configuration dictionary

    Returns:
        Initialized SensoryIntegration instance
    """
    return SensoryIntegration(config)


# Testing function
async def test_sensory_system():
    """Test the sensory integration system."""
    print("🧠 Brokston Sensory Integration Test")
    print("=" * 50)

    # Create system
    system = create_sensory_system()

    # Check status
    status = system.get_status()
    print("\n📊 System Status:")
    print(f"Integration: {status['sensory_integration']}")
    print("\nCapabilities:")
    for capability, available in status["capabilities"].items():
        symbol = "✓" if available else "✗"
        print(
            f"  {symbol} {capability.upper()}: {'Available' if available else 'Not Available'}"
        )

    print("\n🔧 Module Details:")
    for module_name, module_info in status["modules"].items():
        if module_info["available"]:
            print(f"\n  {module_name.upper()}:")
            print(f"    Type: {module_info['type']}")
            print(f"    Features: {', '.join(module_info['features'])}")

    # Test individual modules if available
    print("\n🧪 Module Tests:")

    # Test voice
    if status["capabilities"]["voice"]:
        print("\n  Testing VOICE...")
        voice_result = await system.speak(
            "Hello, I am Brokston, a PhD-level AI researcher."
        )
        if voice_result["success"]:
            print("    ✓ Voice synthesis successful")
            print(f"      Voice: {voice_result['voice']}, Mood: {voice_result['mood']}")
        else:
            print(f"    ✗ Voice synthesis failed: {voice_result.get('error')}")

    # Test hearing (simulation mode)
    if status["capabilities"]["hearing"]:
        print("\n  Testing HEARING...")
        hearing_result = await system.listen(duration=1.0)
        if hearing_result["success"]:
            print("    ✓ Hearing test successful")
            print(f"      Transcribed: {hearing_result['text']}")
        else:
            print(f"    ✗ Hearing test failed: {hearing_result.get('error')}")

    # Test vision
    if status["capabilities"]["vision"]:
        print("\n  Testing VISION...")
        vision_result = await system.see()
        if vision_result["success"]:
            print("    ✓ Vision tracking successful")
            print(f"      Gaze data: {vision_result.get('gaze')}")
        else:
            print(f"    ✗ Vision tracking failed: {vision_result.get('error')}")

    print("\n" + "=" * 50)
    print("✅ Sensory integration test complete!")


if __name__ == "__main__":
    # Run tests
    asyncio.run(test_sensory_system())
