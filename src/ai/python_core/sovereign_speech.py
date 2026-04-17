"""
BROCKSTON Sovereign Voice - LOCAL ONLY
Purged of OpenAI API and Vosk. 
Using Local Faster-Whisper on Silicon.
"""

import os
from faster_whisper import WhisperModel

class SovereignSpeech:
    def __init__(self):
        print("🧠 Loading Local Whisper Model (Sovereign Mode)...")
        # 'base' or 'small' is fast on a Mac. 'distil-large-v3' is the genius level.
        # This stays 100% on your machine. No data leaves the house.
        self.model_size = "base" 
        self.model = WhisperModel(self.model_size, device="cpu", compute_type="int8")
        print(f"✅ Local {self.model_size} model ready. No external dependencies.")

    def transcribe(self, audio_path):
        """Transcribe using only local CPU/GPU power."""
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        
        # Merge segments into a single thought
        text = " ".join([segment.text for segment in segments])
        return text.strip()

# ------------------------------------------------------------------------------
# Updated Brockston Listen Method
# ------------------------------------------------------------------------------
def listen(self):
    print("\n🎤 BROCKSTON Listening (Local)...")
    try:
        with self.microphone as source:
            audio = self.recognizer.listen(source, timeout=10, phrase_time_limit=30)
        
        # Save to temp wav for local processing
        temp_wav = os.path.join(tempfile.gettempdir(), f"input_{uuid.uuid4()}.wav")
        with open(temp_wav, "wb") as f:
            f.write(audio.get_wav_data())

        # Use the Sovereign local engine
        text = self.sovereign_engine.transcribe(temp_wav)
        
        # Cleanup
        os.remove(temp_wav)
        
        if text:
            print(f"✅ Local Recognition: {text}")
        return text

    except Exception as e:
        print(f"❌ Sovereign Listen Error: {e}")
        return None
