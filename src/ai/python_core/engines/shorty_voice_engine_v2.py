from engines.base_synthesizer import SynthesisResult

class ShortyVoiceEngineV2:
    """Mock ShortyVoiceEngineV2 class expected by the Voice SDK."""
    def __init__(self, tier="ultra"):
        self.tier = tier
        print(f"[SYSTEM] Initializing Mock ShortyVoiceEngineV2 ({tier})")

    def synthesize(self, text: str, tone_score: float = 50.0) -> SynthesisResult:
        print(f"[VOICE] Mock synthesizing: {text} (Tone: {tone_score})")
        return SynthesisResult(
            audio_path="/tmp/mock_speech.wav",
            duration=1.0,
            metadata={"engine": "mock"}
        )
