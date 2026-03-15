"""Lightweight event bus utilities for the BROCKSTON brain package."""

from __future__ import annotations

from collections import defaultdict
from typing import Callable, Dict, List, Any

EventHandler = Callable[[str, Dict[str, Any]], None]


class EventBus:
    """Simple in-process pub/sub bus for tier coordination."""

    def __init__(self) -> None:
        self._listeners: Dict[str, List[EventHandler]] = defaultdict(list)

    def subscribe(self, topic: str, handler: EventHandler) -> None:
        if handler not in self._listeners[topic]:
            self._listeners[topic].append(handler)

    def publish(self, topic: str, payload: Dict[str, Any]) -> None:
        for handler in list(self._listeners.get(topic, [])):
            try:
                handler(topic, payload)
            except Exception:
                # Fail-safe: a single listener should not break the bus
                continue


def build_default_bus() -> EventBus:
    """Factory for a shared event bus instance."""

    return EventBus()
