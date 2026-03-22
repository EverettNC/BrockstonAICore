"""Long-term episodic memory facilities."""

from __future__ import annotations

from typing import Dict, Any, Optional

from memory_engine import MemoryEngine

from events import EventBus


class EpisodicMemory:
    """Access to BROCKSTON's long-term memory store."""

    def __init__(self, engine: MemoryEngine, bus: EventBus) -> None:
        self.engine = engine
        self.bus = bus

    def query(self, text: str, intent: Optional[str] = None) -> Dict[str, Any]:
        """Proxy to the underlying memory engine for long-term recall."""

        result = self.engine.query(text, intent)
        self.bus.publish(
            "memory.episodic.recalled",
            {"query": text, "intent": intent, "result": result},
        )
        return {"episodic_context": result}
