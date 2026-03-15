# ===============================
# file: brockston_cortex/kb.py
# ===============================
from __future__ import annotations
from typing import Any, Dict, Optional


class LocalKB:
    """Tiny on-box knowledge base with namespaces."""

    def __init__(self) -> None:
        self._store: Dict[str, Dict[str, Any]] = {}

    def write(self, ns: str, key: str, value: Any) -> None:
        self._store.setdefault(ns, {})[key] = value

    def read(self, ns: str, key: str, default: Optional[Any] = None) -> Any:
        return self._store.get(ns, {}).get(key, default)
