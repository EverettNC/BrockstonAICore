# ===============================
# file: brockston_cortex/types.py
# ===============================
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class Step:
    action: str
    args: Dict[str, Any] = field(default_factory=dict)
    result: Any = None
    note: Optional[str] = None


@dataclass
class NLU:
    kind: str
    confidence: float
    extras: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Outcome:
    final_answer: Any
    confidence: float
    used_tools: List[str]
    steps_summary: List[str]
    trace: Optional[List[Step]] = None
