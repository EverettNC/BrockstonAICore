"""Vision context helpers that annotate perception for the cortex."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from typing import Deque, Dict, Any


@dataclass
class VisionEvent:
    description: str
    intent: str
    confidence: float


class VisionContext:
    """Maintains a rolling window of interpreted vision events."""

    def __init__(self, span: int = 5) -> None:
        self._events: Deque[VisionEvent] = deque(maxlen=span)

    def push(self, description: str, intent: str, confidence: float) -> None:
        self._events.append(VisionEvent(description, intent, confidence))

    def snapshot(self) -> Dict[str, Any]:
        return {
            "events": [event.__dict__ for event in list(self._events)],
            "count": len(self._events),
        }


_context: VisionContext | None = None


def get_context() -> VisionContext:
    global _context
    if _context is None:
        _context = VisionContext()
    return _context
