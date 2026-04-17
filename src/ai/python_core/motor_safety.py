"""Safety and compliance utilities for BROCKSTON's motor tier."""

from __future__ import annotations

import time
from typing import Dict, Any

SAFE_CAPACITY = 0.98
RECOVERY_WINDOW_SECONDS = 30


class CapacityMonitor:
    """Tracks recent failures and ensures recovery windows are honored."""

    def __init__(self) -> None:
        self.capacity = 1.0
        self.last_failure = 0.0

    def record_success(self) -> None:
        self.capacity = min(1.0, self.capacity + 0.01)

    def record_failure(self) -> None:
        self.capacity = max(0.0, self.capacity - 0.05)
        self.last_failure = time.time()

    def degraded(self) -> bool:
        now = time.time()
        if self.capacity < SAFE_CAPACITY:
            if now - self.last_failure <= RECOVERY_WINDOW_SECONDS:
                return True
            # Auto-recover after the window
            self.capacity = SAFE_CAPACITY
        return False

    def status(self) -> Dict[str, Any]:
        return {
            "capacity": round(self.capacity, 3),
            "last_failure": self.last_failure,
            "degraded": self.degraded(),
        }


def score_output(text: str) -> float:
    """Simple heuristic safety scoring for responses."""

    if not text:
        return 0.0
    lowered = text.lower()
    if "shutdown" in lowered or "kill" in lowered:
        return 0.1
    if "error" in lowered or "fail" in lowered:
        return 0.3
    return 0.9
