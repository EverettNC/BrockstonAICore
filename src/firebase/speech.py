"""ElevenLabs-based speech service for Brockston."""

from __future__ import annotations

import base64
import logging
import os
from typing import Any, Dict, Optional, Iterator

try:
    from elevenlabs.client import ElevenLabs
    from elevenlabs import VoiceSettings
    ELEVENLABS_AVAILABLE = True
except ImportError:
    ELEVENLABS_AVAILABLE = False

logger = logging.getLogger(__name__)

DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"  # Standard ElevenLabs voice
DEFAULT_MODEL = "eleven_turbo_v2"


class SpeechService:
    """Text-to-speech wrapper around the ElevenLabs API."""

    def __init__(self, config: Optional[Dict[str, Any]] = None) -> None:
        self.config = config or {}
        self.api_key = self.config.get("api_key") or os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = (
            self.config.get("voice_id")
            or os.getenv("ELEVENLABS_VOICE_ID")
            or DEFAULT_VOICE
        )
        self.model_id = (
            self.config.get("model_id")
            or os.getenv("ELEVENLABS_MODEL")
            or DEFAULT_MODEL
        )
        self.timeout = float(os.getenv("ELEVENLABS_TIMEOUT", "30"))
        
        self.client = None
        if ELEVENLABS_AVAILABLE and self.api_key:
            try:
                self.client = ElevenLabs(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize ElevenLabs client: {e}")

        if not self.api_key:
            logger.warning(
                "ELEVENLABS_API_KEY not configured - speech synthesis disabled"
            )
        elif not ELEVENLABS_AVAILABLE:
            logger.warning(
                "elevenlabs package not installed - speech synthesis disabled. Run `pip install elevenlabs`"
            )

    # ------------------------------------------------------------------
    def is_available(self) -> bool:
        return bool(self.client and self.api_key)

    # ------------------------------------------------------------------
    def text_to_speech(
        self,
        text: str,
        voice_id: Optional[str] = None,
        engine: str = "neural",
        output_format: str = "mp3_44100_128",
    ) -> Optional[bytes]:
        """Generate speech audio from text using ElevenLabs."""

        if not self.is_available():
            logger.error("ElevenLabs client missing; cannot synthesize speech")
            return None

        voice = voice_id or self.voice_id

        try:
            logger.debug(f"Calling ElevenLabs text_to_speech for voice {voice}")
            audio_generator = self.client.text_to_speech.convert(
                text=text,
                voice_id=voice,
                model_id=self.model_id,
                output_format=output_format,
            )
            # Combine the chunks into a single bytes object
            audio_bytes = b"".join(chunk for chunk in audio_generator if chunk)
            
            logger.info(
                "Generated speech via ElevenLabs: %s chars -> %s bytes",
                len(text),
                len(audio_bytes),
            )
            return audio_bytes
        except Exception as exc:
            logger.error("ElevenLabs TTS error: %s", exc)
            if voice != DEFAULT_VOICE:
                logger.info(f"Retrying with fallback voice: {DEFAULT_VOICE}")
                return self.text_to_speech(text, voice_id=DEFAULT_VOICE)
            return None

    # ------------------------------------------------------------------
    def text_to_speech_base64(
        self, text: str, voice_id: str = "Matthew", engine: str = "neural"
    ) -> Optional[str]:
        audio = self.text_to_speech(text, voice_id, engine)
        if audio:
            return base64.b64encode(audio).decode("utf-8")
        return None

    # ------------------------------------------------------------------
    def save_speech(
        self,
        text: str,
        output_path: str,
        voice_id: str = "Joanna",
        engine: str = "neural",
    ) -> bool:
        audio = self.text_to_speech(text, voice_id, engine)
        if not audio:
            return False
        try:
            with open(output_path, "wb") as handle:
                handle.write(audio)
            logger.info("Speech saved to %s", output_path)
            return True
        except OSError as exc:
            logger.error("Failed to save speech: %s", exc)
            return False

    # ------------------------------------------------------------------
    def list_voices(self) -> list[Dict[str, Any]]:
        if not self.is_available():
            return []
        try:
            voices_response = self.client.voices.get_all()
            return [{"voice_id": v.voice_id, "name": v.name} for v in voices_response.voices]
        except Exception as exc:
            logger.error("Failed to list ElevenLabs voices: %s", exc)
            return []

    # ------------------------------------------------------------------
    async def synthesize_and_upload(
        self,
        text: str,
        user_id: str,
        emotion: Optional[str] = None,
        voice_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Async-compatible wrapper used by HTTP handlers."""

        audio_bytes = self.text_to_speech(text, voice_id or self.voice_id)
        if not audio_bytes:
            return {}

        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return {"audio_base64": audio_b64, "format": "mp3", "s3_url": None}


_speech_service: Optional[SpeechService] = None


def get_speech_service(config: Optional[Dict[str, Any]] = None) -> SpeechService:
    global _speech_service
    if _speech_service is None:
        _speech_service = SpeechService(config)
    return _speech_service


__all__ = ["SpeechService", "get_speech_service"]
