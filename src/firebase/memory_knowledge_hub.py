"""Knowledge hub aligning BROCKSTON's RAG stack with the brain tiers."""

from __future__ import annotations

from importlib import import_module
from typing import Dict, Any, Optional

from events import EventBus


def _load_knowledge_engine() -> Optional[type]:
    try:
        module = import_module("knowledge_engine")
    except ImportError:  # pragma: no cover - defensive
        return None
    return getattr(module, "KnowledgeEngine", None)


class KnowledgeHub:
    """Provides domain knowledge retrieval with confidence reporting."""

    def __init__(self, bus: EventBus) -> None:
        self.bus = bus
        self._engine_cls = _load_knowledge_engine()
        self.available = bool(self._engine_cls)
        self._engine = None
        self._memory_mesh = None
        self._local_reasoning = None

    def ask(self, namespace: str, query: str, k: int = 5) -> Dict[str, Any]:
        """Return knowledge answer + metadata."""

        if not self.available:
            return {
                "answer": None,
                "confidence": 0.0,
                "source": "knowledge_hub_unavailable",
            }

        engine = self._ensure_engine()
        if not engine:
            return {
                "answer": None,
                "confidence": 0.0,
                "source": "knowledge_hub_unavailable",
            }

        try:
            response = engine.reason(
                query,
                context=f"namespace:{namespace}",
            )
        except Exception:
            self.available = False
            return {
                "answer": None,
                "confidence": 0.0,
                "source": "knowledge_hub_unavailable",
            }

        self.bus.publish(
            "memory.knowledge.queried",
            {
                "namespace": namespace,
                "query": query,
                "raw": response,
            },
        )
        answer = response.get("response")
        confidence = response.get("confidence", 0.0)
        knowledge_used = response.get("knowledge_used", [])
        return {
            "answer": answer,
            "confidence": confidence,
            "source": response.get("source", "knowledge_engine"),
            "documents": knowledge_used,
            "needs_external": response.get("needs_external", False),
        }

    def query(self, query: str, namespace: Optional[str] = None) -> Optional[str]:
        """Compatibility helper mirroring legacy KnowledgeEngine.query."""

        if not self.available:
            return None
        ns = namespace or "neurodivergency"
        result = self.ask(ns, query)
        return result.get("answer")

    def bind(
        self,
        *,
        memory_mesh: Optional[Any] = None,
        local_reasoning: Optional[Any] = None,
    ) -> None:
        if memory_mesh:
            self._memory_mesh = memory_mesh
        if local_reasoning:
            self._local_reasoning = local_reasoning
        if self._engine:
            # Re-initialise engine so bindings take effect
            self._engine = None

    def _ensure_engine(self):
        if not self._engine_cls:
            return None
        if self._engine is None:
            try:
                self._engine = self._engine_cls(
                    memory_mesh=self._memory_mesh,
                    local_reasoning=self._local_reasoning,
                )
            except Exception:
                self.available = False
                self._engine = None
        return self._engine
