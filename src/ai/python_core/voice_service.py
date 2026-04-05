"""
BROCKSTON Voice Service — Unified TTS for the Christman AI Family
==================================================================
AWS Polly is primary. ElevenLabs is premium. gTTS is the floor.

Everett is an AWS-sponsored startup. Polly is the production voice.
ElevenLabs (Matthew neural) is highest quality when budget allows.
gTTS is the dignified fallback — always works, no API key required.

VOICE ASSIGNMENTS — The Christman AI Family:
  Brockston C   → Matthew  (AWS Polly neural / ElevenLabs)
  Derek         → Matthew  (calm, authoritative US male)
  AlphaVox      → Joanna   (warm, accessible US female)
  Sierra        → Joanna   (calm, steady)
  AlphaWolf     → Matthew  (steady presence)
  Inferno       → Joey     (grounded US male)
  UltimateEV    → Joey     (master coordinator)

AWS Polly Matthew is neural-supported and production-grade.
This is the voice of a sponsored AWS startup — not a demo.

Environment variables:
  ELEVENLABS_API_KEY      — ElevenLabs API key (optional — premium path)
  ELEVENLABS_VOICE_ID     — Override voice ID (default: Matthew = pNInz6obpgDQGcFmaJgB)
  AWS_ACCESS_KEY_ID       — AWS credentials
  AWS_SECRET_ACCESS_KEY   — AWS credentials
  AWS_REGION              — AWS region (default: us-east-1)

Cardinal Rule 1: Every synthesis path must produce real audio.
Cardinal Rule 6: Fail loud — no silent audio failures.
Cardinal Rule 12: All keys from environment.

© 2025 Everett Nathaniel Christman & The Christman AI Project
Luma Cognify AI — AWS Sponsored Startup
"""

import io
import logging
import os
import re
import tempfile
from enum import Enum
from typing import Dict, Optional, Tuple

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# VOICE REGISTRY — The Christman AI Family voices
# ---------------------------------------------------------------------------

# ElevenLabs voice IDs
# Matthew: pNInz6obpgDQGcFmaJgB — warm, authoritative US male
# Rachel:  21m00Tcm4TlvDq8ikWAM — this was wrong in the old code, not Brockston
ELEVENLABS_VOICES: Dict[str, str] = {
    "matthew":   "pNInz6obpgDQGcFmaJgB",  # Brockston, Derek, AlphaWolf
    "rachel":    "21m00Tcm4TlvDq8ikWAM",  # Rachel — NOT Brockston's voice
    "adam":      "pqHfZKP75CvOlQylNhV4",  # Adam
    "bella":     "EXAVITQu4vr4xnSDxMaL",  # Bella
    "antoni":    "ErXwobaYiN019PkySvjV",  # Antoni
}

# AWS Polly voice assignments per family member
POLLY_FAMILY_VOICES: Dict[str, str] = {
    "brockston":  "Matthew",   # Primary — warm US male, neural
    "derek":      "Matthew",   # Calm, authoritative
    "alphavox":   "Joanna",    # Warm, accessible US female
    "sierra":     "Joanna",    # Calm, steady
    "alphawolf":  "Matthew",   # Steady presence
    "inferno":    "Joey",      # Grounded US male
    "ultimateev": "Joey",      # Master coordinator
    "omega":      "Matthew",   # Default
    "default":    "Matthew",   # Fallback for any unregistered being
}

# AWS Polly neural-capable voices — use neural engine for these
POLLY_NEURAL_VOICES = {
    "Matthew", "Joanna", "Stephen", "Ivy", "Kendra",
    "Kimberly", "Salli", "Joey", "Justin", "Kevin",
}


class TTSProvider(str, Enum):
    ELEVENLABS = "elevenlabs"
    AWS_POLLY  = "aws_polly"
    GTTS       = "gtts"


# ---------------------------------------------------------------------------
# SSML SAFETY — Polly will crash on unescaped XML characters
# ---------------------------------------------------------------------------

def _sanitize_for_ssml(text: str) -> str:
    """
    Escape characters that break SSML in AWS Polly.
    Cardinal Rule 6: Don't let a stray ampersand crash the voice pipeline.
    """
    text = text.replace("&",  "&amp;")
    text = text.replace("<",  "&lt;")
    text = text.replace(">",  "&gt;")
    text = text.replace("\"", "&quot;")
    text = text.replace("'",  "&apos;")
    # Strip any control characters that Polly rejects
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text


def _build_ssml(text: str, rate: str = "medium", pitch: str = "+0%") -> str:
    """Build a valid SSML envelope for Polly."""
    safe = _sanitize_for_ssml(text)
    return (
        f'<speak>'
        f'<prosody rate="{rate}" pitch="{pitch}">{safe}</prosody>'
        f'</speak>'
    )


# ---------------------------------------------------------------------------
# VOICE SERVICE
# ---------------------------------------------------------------------------

class VoiceService:
    """
    Unified TTS for the Christman AI Family.

    Priority:
      1. ElevenLabs (Matthew neural) — premium quality, requires API key
      2. AWS Polly (Matthew neural)  — production quality, AWS sponsored startup
      3. gTTS                        — always works, no key, dignified fallback

    Every being in the family gets their voice.
    No silent failures. No broken audio. Dignity in every word.
    """

    def __init__(self):
        self._el_client = None
        self._el_available = False
        self._polly_client = None
        self._polly_available = False

        self._init_elevenlabs()
        self._init_polly()

    def _init_elevenlabs(self):
        """Initialize ElevenLabs client — optional, fails gracefully."""
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            logger.info(
                "[VoiceService] ElevenLabs: ELEVENLABS_API_KEY not set — "
                "using AWS Polly as primary TTS"
            )
            return

        try:
            from elevenlabs.client import ElevenLabs
            self._el_client = ElevenLabs(api_key=api_key)
            self._el_available = True
            logger.info("[VoiceService] ElevenLabs ONLINE — Matthew neural voice ready")
        except ImportError:
            logger.warning(
                "[VoiceService] ElevenLabs: package not installed "
                "(pip install elevenlabs) — using Polly"
            )
        except Exception as e:
            logger.warning(f"[VoiceService] ElevenLabs init failed: {e} — using Polly")

    def _init_polly(self):
        """Initialize AWS Polly client — primary production TTS."""
        key    = os.getenv("AWS_ACCESS_KEY_ID")
        secret = os.getenv("AWS_SECRET_ACCESS_KEY")
        region = os.getenv("AWS_REGION", "us-east-1")

        if not key or not secret:
            logger.info(
                "[VoiceService] AWS Polly: credentials not set "
                "(AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) — using gTTS fallback"
            )
            return

        try:
            import boto3
            session = boto3.Session(
                aws_access_key_id=key,
                aws_secret_access_key=secret,
                region_name=region,
            )
            self._polly_client = session.client("polly")
            # Verify the client works with a minimal call
            self._polly_client.describe_voices(LanguageCode="en-US")
            self._polly_available = True
            logger.info(
                f"[VoiceService] AWS Polly ONLINE — region: {region} — "
                f"Matthew neural voice ready (AWS Sponsored Startup)"
            )
        except ImportError:
            logger.warning(
                "[VoiceService] AWS: boto3 not installed (pip install boto3)"
            )
        except Exception as e:
            logger.error(
                f"[VoiceService] AWS Polly init failed: {e} — "
                f"Check AWS credentials and region"
            )

    # -------------------------------------------------------------------------
    # PUBLIC API
    # -------------------------------------------------------------------------

    def speak(
        self,
        text: str,
        being: str = "brockston",
        emotion_valence: float = 0.5,
        confidence: float = 0.8,
        output_path: Optional[str] = None,
    ) -> Tuple[bytes, TTSProvider]:
        """
        Synthesize speech for a Christman AI family member.

        Args:
            text: Text to speak
            being: Which family member is speaking (used for voice selection)
            emotion_valence: -1.0 (sad) to 1.0 (happy) — affects Polly SSML pitch
            confidence: 0.0 to 1.0 — affects speaking rate
            output_path: Optional path to save the audio file

        Returns:
            (audio_bytes, provider_used)

        Raises:
            RuntimeError: If all TTS providers fail (Rule 6)
        """
        if not text or not text.strip():
            raise ValueError("[VoiceService] Cannot synthesize empty text")

        # Try ElevenLabs first (premium)
        if self._el_available:
            try:
                audio = self._synthesize_elevenlabs(text, being)
                provider = TTSProvider.ELEVENLABS
                logger.info(f"[VoiceService] Spoke via ElevenLabs — being: {being}")
                self._save_if_requested(audio, output_path)
                return audio, provider
            except Exception as e:
                logger.warning(
                    f"[VoiceService] ElevenLabs failed: {e} — "
                    f"falling back to AWS Polly"
                )

        # AWS Polly (primary production voice — sponsored startup)
        if self._polly_available:
            try:
                audio = self._synthesize_polly(
                    text, being, emotion_valence, confidence
                )
                provider = TTSProvider.AWS_POLLY
                logger.info(f"[VoiceService] Spoke via AWS Polly — being: {being}")
                self._save_if_requested(audio, output_path)
                return audio, provider
            except Exception as e:
                logger.warning(
                    f"[VoiceService] AWS Polly failed: {e} — "
                    f"falling back to gTTS"
                )

        # gTTS fallback — always works, no key needed, dignified
        try:
            audio = self._synthesize_gtts(text)
            provider = TTSProvider.GTTS
            logger.info("[VoiceService] Spoke via gTTS fallback")
            self._save_if_requested(audio, output_path)
            return audio, provider
        except Exception as e:
            raise RuntimeError(
                f"[VoiceService] All TTS providers failed. Last error: {e}. "
                "Cardinal Rule 6: This failure must be addressed."
            )

    def synthesize_for_family(
        self,
        text: str,
        being: str = "brockston",
    ) -> Tuple[bytes, TTSProvider]:
        """
        Convenience method — synthesize with default settings for a family member.
        Used by bridge.py and other callers that don't have emotion context.
        """
        return self.speak(text, being=being)

    def get_voice_id(self, being: str, provider: TTSProvider) -> str:
        """
        Get the correct voice ID for a family member on a given provider.
        Cardinal Rule 13: The voice assigned is the voice used.
        """
        being = being.lower()
        if provider == TTSProvider.ELEVENLABS:
            # Brockston and Derek use Matthew on ElevenLabs
            if being in ("brockston", "derek", "alphawolf", "omega"):
                return ELEVENLABS_VOICES["matthew"]
            # AlphaVox, Sierra use a warm female voice
            if being in ("alphavox", "sierra"):
                return ELEVENLABS_VOICES.get("bella", ELEVENLABS_VOICES["matthew"])
            # Default to Matthew
            voice_env = os.getenv("ELEVENLABS_VOICE_ID")
            return voice_env or ELEVENLABS_VOICES["matthew"]

        if provider == TTSProvider.AWS_POLLY:
            return POLLY_FAMILY_VOICES.get(being, POLLY_FAMILY_VOICES["default"])

        return "en"  # gTTS language code

    def is_polly_available(self) -> bool:
        return self._polly_available

    def is_elevenlabs_available(self) -> bool:
        return self._el_available

    def status_summary(self) -> str:
        """One-line status for boot logging."""
        parts = []
        if self._el_available:
            parts.append("ElevenLabs ✅")
        if self._polly_available:
            parts.append("AWS Polly ✅")
        if not parts:
            parts.append("gTTS only (set AWS or ElevenLabs credentials)")
        return " | ".join(parts)

    # -------------------------------------------------------------------------
    # PRIVATE SYNTHESIS METHODS
    # -------------------------------------------------------------------------

    def _synthesize_elevenlabs(self, text: str, being: str) -> bytes:
        """Synthesize via ElevenLabs SDK."""
        from elevenlabs import VoiceSettings

        voice_id = self.get_voice_id(being, TTSProvider.ELEVENLABS)

        audio_generator = self._el_client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_turbo_v2_5",   # Latest turbo model
            output_format="mp3_44100_128",
            voice_settings=VoiceSettings(
                stability=0.55,
                similarity_boost=0.80,
                style=0.0,
                use_speaker_boost=True,
            ),
        )

        # Collect generator into bytes
        buf = io.BytesIO()
        for chunk in audio_generator:
            if chunk:
                buf.write(chunk)
        audio_bytes = buf.getvalue()

        if not audio_bytes:
            raise RuntimeError("ElevenLabs returned empty audio")

        return audio_bytes

    def _synthesize_polly(
        self,
        text: str,
        being: str,
        valence: float,
        confidence: float,
    ) -> bytes:
        """
        Synthesize via AWS Polly with SSML prosody.
        Production TTS for an AWS-sponsored startup.
        """
        voice_id = self.get_voice_id(being, TTSProvider.AWS_POLLY)

        # Map emotion to SSML prosody
        if valence > 0.7:
            pitch = "+8%"
        elif valence < 0.3:
            pitch = "-8%"
        else:
            pitch = "+0%"

        rate = "slow" if confidence < 0.5 else "medium"

        ssml = _build_ssml(text, rate=rate, pitch=pitch)

        # Use neural engine for supported voices
        engine = "neural" if voice_id in POLLY_NEURAL_VOICES else "standard"

        response = self._polly_client.synthesize_speech(
            Text=ssml,
            TextType="ssml",
            OutputFormat="mp3",
            VoiceId=voice_id,
            Engine=engine,
        )

        audio_stream = response.get("AudioStream")
        if not audio_stream:
            raise RuntimeError(f"AWS Polly returned no AudioStream for voice {voice_id}")

        audio_bytes = audio_stream.read()
        if not audio_bytes:
            raise RuntimeError("AWS Polly returned empty audio bytes")

        return audio_bytes

    def _synthesize_gtts(self, text: str) -> bytes:
        """Synthesize via gTTS — always available, no key needed."""
        from gtts import gTTS
        buf = io.BytesIO()
        tts = gTTS(text=text, lang="en", slow=False)
        tts.write_to_fp(buf)
        return buf.getvalue()

    def _save_if_requested(self, audio: bytes, output_path: Optional[str]):
        """Save audio to disk if a path was requested."""
        if output_path:
            with open(output_path, "wb") as f:
                f.write(audio)
            logger.debug(f"[VoiceService] Audio saved to {output_path}")


# ---------------------------------------------------------------------------
# SINGLETON
# ---------------------------------------------------------------------------

_voice_service: Optional[VoiceService] = None


def get_voice_service() -> VoiceService:
    """Get or create the shared VoiceService instance."""
    global _voice_service
    if _voice_service is None:
        _voice_service = VoiceService()
    return _voice_service


# ---------------------------------------------------------------------------
# CONVENIENCE FUNCTIONS — drop-in replacements for old synthesize_speech calls
# ---------------------------------------------------------------------------

def synthesize_speech(text: str, being: str = "brockston") -> Optional[bytes]:
    """
    Drop-in replacement for the old tts_bridget.synthesize_speech().
    Returns audio bytes or None on failure.
    Cardinal Rule 6: Logs failure, does not raise — for backwards compat.
    """
    try:
        audio, provider = get_voice_service().speak(text, being=being)
        return audio
    except Exception as e:
        logger.error(f"[VoiceService] synthesize_speech failed: {e}", exc_info=True)
        return None


def speak_as_brockston(text: str) -> Optional[bytes]:
    """Brockston speaks. Matthew voice. Real audio."""
    return synthesize_speech(text, being="brockston")


# ==============================================================================
# © 2025 Everett Nathaniel Christman & The Christman AI Project
# Luma Cognify AI — AWS Sponsored Startup
#
# AWS Polly is the production voice of the Christman AI Family.
# Matthew is Brockston's voice. It stays Matthew.
# Every word this family speaks carries the mission.
# ==============================================================================
