"""Common utilities for the brain module."""

from __future__ import annotations

from typing import Dict, Any

from events import EventBus
from motor_safety import CapacityMonitor, score_output


def execute_task(text: str, intent: str, context: Dict[str, Any]) -> Any:
    """
    Execute a task based on text input, intent, and context.

    Args:
        text: The input text to process
        intent: The classified intent of the task
        context: Additional context for task execution

    Returns:
        The result of task execution
    """
    # Basic implementation - extend based on your needs
    return {
        "status": "success",
        "intent": intent,
        "processed": text,
        "context": context,
    }


SAFE_FALLBACK = "I'm staying right here with you, keeping everything safe while we figure out the next step together."


class MotorController:
    """Wraps task execution with capacity and safety monitoring."""

    def __init__(self, bus: EventBus, policy_engine=None) -> None:
        self.bus = bus
        self.monitor = CapacityMonitor()
        self.degradation = DegradationManager()
        self.policy_engine = policy_engine

    def execute(
        self, text: str, intent: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        status = self.degradation.status()
        degraded = self.monitor.degraded() or status["degraded"]
        mission_pause = SAFE_FALLBACK
        if degraded or not execute_task:
            response = (
                mission_pause
                if not status["degraded"]
                else (
                    "I'm holding steady to keep things safe. Give me a moment and we'll try again together."
                )
            )
            self.bus.publish(
                "motor.degraded",
                {
                    "intent": intent,
                    "response": response,
                    "status": self.monitor.status(),
                    "degradation": status,
                },
            )
            return {"response": response, "degraded": True, "status": status}

        try:
            result = execute_task(text, intent, context)
        except Exception as exc:  # pragma: no cover - defensive
            self.monitor.record_failure()
            self.degradation.trigger("executor_exception")
            payload = {
                "intent": intent,
                "error": str(exc),
                "status": self.monitor.status(),
                "degradation": self.degradation.status(),
            }
            self.bus.publish("motor.failure", payload)
            return {
                "response": mission_pause,
                "degraded": True,
                "error": str(exc),
            }

        evaluated = str(result) if result is not None else ""
        score = score_output(evaluated)
        logger = None
        try:  # optional lazy import to avoid top-level logging
            import logging

            logger = logging.getLogger("motor.controller")
        except Exception:
            logger = None
        if score < 0.5:
            if logger:
                logger.debug(
                    "Motor score %.2f below threshold; using mission pause", score
                )
            self.monitor.record_success()
            response = mission_pause
            self.bus.publish(
                "motor.soft_fallback",
                {"intent": intent, "original": result, "score": score},
            )
            return {"response": response, "degraded": False}

        self.monitor.record_success()
        status = self.degradation.status()
        if status["degraded"]:
            response = SAFE_FALLBACK
            self.bus.publish(
                "motor.degraded",
                {
                    "intent": intent,
                    "response": response,
                    "status": self.monitor.status(),
                    "degradation": status,
                },
            )
            return {"response": response, "degraded": True, "status": status}

        if self.policy_engine:
            policy = self.policy_engine.evaluate(text, str(result), channel="motor")
            result = policy.adjusted_text
        else:
            policy = None

        payload = {
            "intent": intent,
            "response": result,
            "score": score,
            "status": self.monitor.status(),
            "degradation": status,
        }
        self.bus.publish("motor.executed", payload)
        if policy:
            payload["policy"] = policy.metadata
        return {
            "response": result,
            "degraded": False,
            "score": score,
            "policy": payload.get("policy"),
        }


"""Degradation management for motor tier safety."""


class DegradationManager:
    """Manages degradation state and recovery for motor execution."""


def __init__(self) -> None:
    self._degraded = False
    self._triggers: Dict[str, Any] = {}


def trigger(self, reason: str) -> None:
    """Trigger degradation with a reason."""
    self._degraded = True
    self._triggers[reason] = True


def status(self) -> Dict[str, Any]:
    """Return current degradation status."""
    return {"degraded": self._degraded, "triggers": list(self._triggers.keys())}


def reset(self) -> None:
    """Reset degradation state."""
    self._degraded = False
    self._triggers.clear()
