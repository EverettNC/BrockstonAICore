"""Multi-path reasoning dispatcher coordinating Derek's cortex tools."""

from __future__ import annotations

from typing import Dict, Any, List, Optional

from importlib import import_module

try:
    from brain_common_events import EventBus
except ImportError:
    from events import EventBus


def _load_cortex_bundle() -> Optional[Dict[str, Any]]:
    try:
        module = import_module("derek_cortex")
    except ImportError:  # pragma: no cover - defensive
        return None
    return {
        "DerekCortex": getattr(module, "DerekCortex", None),
        "ReasonerConfig": getattr(module, "ReasonerConfig", None),
    }


def _load_advanced_local() -> Optional[type]:
    try:
        module = import_module("backend.reasoning.derek_local_reasoning")
    except ImportError:  # pragma: no cover - defensive
        return None
    return getattr(module, "LocalReasoningEngine", None)


def _load_simple_local() -> Optional[type]:
    try:
        module = import_module("backend.reasoning.local_reasoning_engine")
    except ImportError:  # pragma: no cover - defensive
        return None
    return getattr(module, "LocalReasoningEngine", None)


class ReasoningDispatcher:
    """Coordinates multiple reasoning strategies and arbitrates the result."""

    def __init__(
        self,
        bus: EventBus,
        derek_instance: Optional[Any] = None,
    ) -> None:
        self.bus = bus
        self.derek = derek_instance

        cortex_bundle = _load_cortex_bundle()
        self.cortex = None
        if (
            cortex_bundle
            and cortex_bundle.get("DerekCortex")
            and cortex_bundle.get("ReasonerConfig")
        ):
            try:
                self.cortex = cortex_bundle["DerekCortex"](
                    cfg=cortex_bundle["ReasonerConfig"]()
                )
            except Exception:
                self.cortex = None

        advanced_cls = _load_advanced_local()
        self.advanced_local = None
        if advanced_cls:
            try:
                self.advanced_local = advanced_cls(derek_instance=derek_instance)
            except Exception:
                self.advanced_local = None

        simple_cls = _load_simple_local()
        self.simple_local = None
        if simple_cls:
            try:
                self.simple_local = simple_cls()
            except Exception:
                self.simple_local = None

    def solve(self, question: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute available strategies and return the highest-confidence answer."""

        candidates: List[Dict[str, Any]] = []

        if self.cortex:
            cortex_result = self._run_cortex(question)
            if cortex_result:
                candidates.append(cortex_result)

        if self.advanced_local:
            candidates.extend(self._run_advanced_local(question, context))

        if self.simple_local and not candidates:
            simple = self._run_simple_local(question, context)
            if simple:
                candidates.append(simple)

        if not candidates:
            result = {
                "answer": "I'm still learning how to reason through that.",
                "confidence": 0.0,
                "source": "reasoning_unavailable",
                "strategies": [],
            }
        else:
            best = max(candidates, key=lambda item: item.get("confidence", 0.0))
            result = {
                "answer": best.get("answer"),
                "confidence": round(float(best.get("confidence", 0.0)), 3),
                "source": best.get("source"),
                "strategies": candidates,
            }

        self.bus.publish(
            "reasoning.completed",
            {"question": question, "result": result},
        )
        return result

    def _run_cortex(self, question: str) -> Optional[Dict[str, Any]]:
        try:
            outcome = self.cortex.analyze(question)  # type: ignore[operator]
        except Exception:
            return None
        return {
            "answer": outcome.final_answer,
            "confidence": float(outcome.confidence or 0.0),
            "source": "cortex_ensemble",
            "used_tools": outcome.used_tools,
            "steps": outcome.steps_summary,
        }

    def _run_advanced_local(
        self, question: str, context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        results: List[Dict[str, Any]] = []
        try:
            response = self.advanced_local.query_with_knowledge(question)
            if response.get("response"):
                results.append(
                    {
                        "answer": response["response"],
                        "confidence": float(response.get("confidence", 0.6)),
                        "source": response.get("source", "advanced_local"),
                        "model": response.get("model"),
                        "knowledge_used": response.get("knowledge_used", []),
                    }
                )
            if self.advanced_local.should_use_external_api(question, response):
                results.append(
                    {
                        "answer": "External lookup recommended",
                        "confidence": 0.2,
                        "source": "advanced_local_external_needed",
                    }
                )
        except Exception:
            pass
        return results

    def _run_simple_local(
        self, question: str, context: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        try:
            working_summary = context.get("working_memory", "")
            mood = context.get("mood", "")
            vision = context.get("vision", "")
            output = self.simple_local.analyze(  # type: ignore[call-arg]
                user_input=question,
                memory=working_summary,
                emotion=mood,
                vision=vision,
            )
            return {
                "answer": output,
                "confidence": 0.3,
                "source": "simple_local_reasoning",
            }
        except Exception:
            return None
