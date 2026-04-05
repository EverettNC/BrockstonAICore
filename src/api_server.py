"""
FastAPI bridge between Next.js and Wav2Lip.
Run: cd /Users/EverettN/BrockstonAICore/src && python api_server.py
"""

import base64
import subprocess
import tempfile
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SRC_DIR = Path(__file__).parent
WAV2LIP_DIR = SRC_DIR / "brockston_research" / "Wav2Lip"
CHECKPOINT = WAV2LIP_DIR / "checkpoints" / "wav2lip_gan.pth"
FACE_IMAGE = SRC_DIR.parent / "public" / "images" / "brockston-hq.jpg"
FFMPEG = "/usr/local/bin/ffmpeg"


class LipSyncRequest(BaseModel):
    audio_b64: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "checkpoint": CHECKPOINT.exists(),
        "face_image": FACE_IMAGE.exists(),
    }


@app.post("/lipsync")
async def lipsync(req: LipSyncRequest):
    if not CHECKPOINT.exists():
        raise HTTPException(status_code=503, detail="Wav2Lip checkpoint not found")

    # Pick best available face image
    face_candidates = [
        FACE_IMAGE,
        SRC_DIR.parent / "public" / "images" / "brockston-blue.jpg",
        SRC_DIR.parent / "public" / "images" / "brockston-neutral.png",
    ]
    face_path = next((p for p in face_candidates if p.exists()), None)
    if face_path is None:
        raise HTTPException(status_code=503, detail="No face image found")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)

        # Decode audio
        audio_bytes = base64.b64decode(req.audio_b64)
        mp3_path = tmpdir / "input.mp3"
        wav_path = tmpdir / "input.wav"
        mp3_path.write_bytes(audio_bytes)

        # Convert to WAV
        result = subprocess.run(
            [FFMPEG, "-y", "-i", str(mp3_path), "-ar", "16000", "-ac", "1", str(wav_path)],
            capture_output=True, timeout=30
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"ffmpeg failed: {result.stderr.decode()}")

        out_path = tmpdir / "result.mp4"

        # Run Wav2Lip
        cmd = [
            "python", "inference.py",
            "--checkpoint_path", str(CHECKPOINT),
            "--face", str(face_path),
            "--audio", str(wav_path),
            "--outfile", str(out_path),
            "--static", "True",
            "--nosmooth",
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=300, cwd=str(WAV2LIP_DIR))
        if result.returncode != 0 or not out_path.exists():
            raise HTTPException(status_code=500, detail=f"Wav2Lip failed: {result.stderr.decode()}")

        video_bytes = out_path.read_bytes()
        video_b64 = base64.b64encode(video_bytes).decode()
        return {"video": f"data:video/mp4;base64,{video_b64}"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
