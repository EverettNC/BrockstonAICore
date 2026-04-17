from dataclasses import dataclass
from typing import Optional

@dataclass
class SynthesisResult:
    """Mock SynthesisResult class expected by the Voice SDK."""
    audio_path: str
    duration: float
    metadata: Optional[dict] = None
