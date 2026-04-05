# © 2025 The Christman AI Project. All rights reserved.
#
# This code is released as part of a trauma-informed, dignity-first AI ecosystem
# designed to protect, empower, and elevate vulnerable populations.
#
# By using, modifying, or distributing this software, you agree to uphold the following:
# 1. Truth — No deception, no manipulation.
# 2. Dignity — Respect the autonomy and humanity of all users.
# 3. Protection — Never use this to exploit or harm vulnerable individuals.
# 4. Transparency — Disclose all modifications and contributions clearly.
# 5. No Erasure — Preserve the mission and ethical origin of this work.
#
# This is not just code. This is redemption in code.
# Contact: lumacognify@thechristmanaiproject.com
# https://thechristmanaiproject.com

import os

from flask import Flask, jsonify, request

app = Flask(__name__)


class MockSpeechEngine:
    """Mock speech recognition engine for when real engine isn't available"""

    def recognize_from_bytes(self, audio_bytes):
        return "Speech recognition not available", 0.0, {"mock": True}


try:
    from speech_recognition_engine import get_speech_recognition_engine

    engine = get_speech_recognition_engine(simulate=False)
except ImportError:
    engine = MockSpeechEngine()


@app.route("/upload", methods=["POST"])
def upload_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    audio_bytes = audio_file.read()

    # Feed directly to recognizer
    try:
        text, confidence, meta = engine.recognize_from_bytes(audio_bytes)
        return jsonify({"text": text, "confidence": confidence, "meta": meta})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(
        host=os.getenv("BROCKSTON_HOST", "127.0.0.1"),
        port=int(os.getenv("BROCKSTON_PORT", "5000")),
        debug=False,
    )

# ==============================================================================
# © 2025 Everett Nathaniel Christman & Misty Gail Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================

__all__ = ["upload_audio", "MockSpeechEngine"]
