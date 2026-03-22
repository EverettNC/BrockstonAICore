"""Vision tier translating raw perception into contextual cues."""

from __future__ import annotations

from importlib import import_module
from typing import Dict, Any, Optional

from events import EventBus
from vision_context import get_context


def _load_vision_engine() -> Optional[type]:
    try:
        module = import_module("simple_vision_engine")
    except ImportError:  # pragma: no cover - defensive
        return None
    return getattr(module, "VisionEngine", None)


GESTURE_SYMBOLS = {
    "thumbs_up": {
        "description": "Affirmation",
        "intent": "positive_feedback",
    },
    "hand_wave": {
        "description": "Greeting",
        "intent": "greeting",
    },
}


class VisionPerception:
    """Wraps the legacy VisionEngine with higher-level interpretation."""

    def __init__(self, bus: EventBus) -> None:
        self.bus = bus
        self.engine = None
        self._vision_cls = _load_vision_engine()

    def describe(self) -> Dict[str, Any]:
        self.ensure_engine()
        if not self.engine:
            summary = {"available": False, "description": "Vision offline."}
            self.bus.publish("vision.status", summary)
            return summary

        description = self.engine.describe_last_seen()
        cues = self._infer_symbols(description)
        context = get_context()
        context.push(
            description=cues.get("description", description),
            intent=cues.get("intent", ""),
            confidence=0.8 if cues.get("intent") else 0.4,
        )
        payload = {
            "available": True,
            "description": description,
            "cues": cues,
            "context": context.snapshot(),
        }
        self.bus.publish("vision.perceived", payload)
        return payload

    def stats(self) -> Dict[str, Any]:
        self.ensure_engine()
        if not self.engine:
            return {"available": False}
        try:
            stats = self.engine.get_vision_stats()
        except Exception:
            stats = {"available": False}
        return stats

    def ensure_engine(self) -> None:
        if self.engine or not self._vision_cls:
            return
        try:
            self.engine = self._vision_cls()
        except Exception:
            self.engine = None

    def _infer_symbols(self, description: str) -> Dict[str, Any]:
        description_lower = description.lower()
        for key, value in GESTURE_SYMBOLS.items():
            if key.replace("_", " ") in description_lower:
                return value
        return {"description": "", "intent": ""}
