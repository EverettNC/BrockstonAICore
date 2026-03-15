# christman_emotion.py
import hashlib
import logging
import os

import numpy as np

# Set up logging for Rule 6 compliance
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class TetherBlindnessError(Exception):
    """Raised when the emotion mapping models cannot be loaded."""
    pass


EMOTION_LABELS = [
    "neutral", "happy", "proud", "teasing", "annoyed", "sarcastic",
    "sweetheart", "laugh", "tremble", "emphasis", "last_breath"
]

# Lazy-loaded globals — populated on first call to embed_shorty_audio()
_processor = None
_model = None
_device = None
_shorty_pca = None
_shorty_scaler = None
_tether_ready = False


def _load_tether():
    """Load Wav2Vec2 + PCA models. Fails loud (Rule 6) if PCA missing."""
    global _processor, _model, _device, _shorty_pca, _shorty_scaler, _tether_ready

    if _tether_ready:
        return

    import torch
    import torchaudio  # noqa: F401 — imported for side-effects / version check
    from transformers import Wav2Vec2Model, Wav2Vec2Processor

    _device = torch.device(
        "mps" if torch.backends.mps.is_available()
        else "cuda" if torch.cuda.is_available()
        else "cpu"
    )

    logger.info("Loading Wav2Vec2 processor + model (first call)…")
    _processor = Wav2Vec2Processor.from_pretrained(
        "jonatasgrosman/wav2vec2-large-xlsr-53-english"
    )
    _model = Wav2Vec2Model.from_pretrained(
        "jonatasgrosman/wav2vec2-large-xlsr-53-english"
    )
    _model.eval()
    _model.to(_device)
    logger.info(f"Wav2Vec2 loaded on {_device}")

    # RULE 6 FIX: Fail loud if PCA model missing
    pca_path = os.environ.get("TETHER_PCA_PATH", "shorty_emotion_pca.pt")
    if not os.path.exists(pca_path):
        raise TetherBlindnessError(
            f"PCA model not found at '{pca_path}'. "
            "The Tether cannot map emotions. Train + place shorty_emotion_pca.pt."
        )
    _shorty_pca = torch.load(pca_path)
    logger.info("PCA Mapping loaded successfully.")

    scaler_path = os.environ.get("TETHER_SCALER_PATH", "shorty_emotion_scaler.pt")
    if os.path.exists(scaler_path):
        _shorty_scaler = torch.load(scaler_path)
        logger.info("Scaler loaded successfully.")
    else:
        _shorty_scaler = None
        logger.warning("Scaler not found. Proceeding with unscaled PCA vectors.")

    _tether_ready = True


def embed_shorty_audio(wav_path: str) -> dict:
    """Extracts emotional cadence and fingerprints the audio."""
    import torch
    import torchaudio

    _load_tether()  # lazy-load everything on first call

    try:
        speech, sr = torchaudio.load(wav_path)
    except Exception as e:
        logger.critical(f"FATAL: Cannot load audio file {wav_path}. {e}")
        raise TetherBlindnessError(f"Audio read failure: {e}")

    # Mix stereo to mono
    if speech.ndim == 2:
        speech = speech.mean(dim=0, keepdim=True)

    # Force 16 kHz
    if sr != 16000:
        speech = torchaudio.transforms.Resample(sr, 16000)(speech)

    input_values = _processor(
        speech.numpy(), return_tensors="pt", sampling_rate=16000
    ).input_values.to(_device)

    with torch.no_grad():
        hidden = _model(input_values).last_hidden_state
        embeddings = hidden.mean(dim=1).cpu().numpy()

    emotion_vec = _shorty_pca.transform(embeddings)[0]

    if _shorty_scaler is not None:
        emotion_vec = _shorty_scaler.transform([emotion_vec])[0]

    scores = {}
    for i, label in enumerate(EMOTION_LABELS):
        val = float(emotion_vec[i])
        val = max(0.0, min(1.0, val))
        scores[label] = round(val, 4)

    # Deterministic cadence fingerprint
    fingerprint = hashlib.sha1(emotion_vec.tobytes()).hexdigest()[:16]
    scores["cadence_fingerprint"] = fingerprint

    return scores


if __name__ == "__main__":
    try:
        results = embed_shorty_audio("shorty_last_laugh.wav")
        print("\n=== THE TETHER: CADENCE PRESERVED ===")
        for k, v in results.items():
            print(f"{k.ljust(20)}: {v}")
    except Exception as e:
        print(f"\nExecution Halted: {e}")

# ==============================================================================
# © 2025 Everett Nathaniel Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved.
# ==============================================================================
