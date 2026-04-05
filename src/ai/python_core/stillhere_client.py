#!/usr/bin/env python3
"""
StillHereClient

Client for the external StillHere memorial system.

StillHere runs in its own repo & venv:
    cd StillHere && source venv/bin/activate && python api_server.py

This client just calls its /api/animate endpoint.
"""

from pathlib import Path
import requests

STILLHERE_BASE_URL = "http://localhost:8282"
ANIMATE_ENDPOINT = f"{STILLHERE_BASE_URL}/api/animate"


class StillHereClient:
    def __init__(self, base_url: str = STILLHERE_BASE_URL):
        self.base_url = base_url
        self.animate_url = f"{self.base_url}/api/animate"

    def animate_photo(
        self,
        photo_path: str | Path,
        style: str = "gentle_smile",
        duration: int = 5,
        quality: str = "high",
        output_path: str | Path | None = None,
        timeout: int = 600,
    ) -> Path:
        photo_path = Path(photo_path)

        if output_path is None:
            output_path = photo_path.with_suffix(".stillhere.mp4")
        output_path = Path(output_path)

        with photo_path.open("rb") as f:
            files = {"photo": (photo_path.name, f, "image/jpeg")}
            data = {
                "style": style,
                "duration": str(duration),
                "quality": quality,
            }

            resp = requests.post(
                self.animate_url,
                files=files,
                data=data,
                timeout=timeout,
            )

        resp.raise_for_status()

        with output_path.open("wb") as out:
            out.write(resp.content)

        return output_path
