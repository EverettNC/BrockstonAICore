"""Working-memory utilities built on top of the legacy MemoryEngine."""

from __future__ import annotations

from collections import deque
from typing import Dict, Any, Optional

from memory_engine import MemoryEngine

from events import EventBus


class WorkingMemory:
    """Maintains the short-term conversational context.

    This wraps the existing MemoryEngine so we can keep BROCKSTON's stored
    conversations while exposing a bounded working set that aligns with
    clinical neurology models (working memory ≈ last few salient events).
    """

    def __init__(self, engine: MemoryEngine, bus: EventBus, span: int = 6) -> None:
        self.engine = engine
        self.bus = bus
        self.span = span
        self._window: Deque[Dict[str, Any]] = deque(maxlen=span)

    def prime_from_store(self) -> None:
        """Seed the working window from the underlying store."""

        recent = self.engine.get_recent_events(limit=self.span)
        for item in reversed(recent):
            self._window.append(item)

    def push(self, entry: Dict[str, Any]) -> None:
        """Append a new event to working memory and emit a trigger."""

        self._window.append(entry)
        self.engine.save(entry)
        self.bus.publish(
            "memory.working.updated",
            {"entry": entry, "size": len(self._window)},
        )

    def snapshot(self) -> Dict[str, Any]:
        """Return a structured representation of the working window."""

        return {
            "size": len(self._window),
            "entries": list(self._window),
        }

    def recall(self, intent: Optional[str] = None) -> Dict[str, Any]:
        """Retrieve context for cortex queries."""

        if intent:
            filtered = [item for item in self._window if item.get("intent") == intent]
        else:
            filtered = list(self._window)
        return {"working_context": filtered}
