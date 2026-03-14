# © 2025 The Christman AI Project. All rights reserved.
#
# This code is released as part of a trauma-informed, dignity-first AI ecosystem
# designed to protect, empower, and elevate vulnerable populations.
#
# By using, modifying, or distributing this software, you agree to uphold the following:
# 1. Truth — No deception, no manipulation.
# 2. Dignity — Respect the autonomy and humanity of all users.
# 3. Protection — Never use this to exploit or harm vulnerable individuals.
# 4. Transparency — Disclose all modifications and contributions clearly.
# 5. No Erasure — Preserve the mission and ethical origin of this work.
#
# This is not just code. This is redemption in code.
# Contact: lumacognify@thechristmanaiproject.com
# https://thechristmanaiproject.com

import json
import time
from pathlib import Path
from typing import Any, Dict, List

MEMORY_FILE = Path("memory/session_memory.json")
MAX_CONTEXT = 10  # how many exchanges to keep


def _load() -> List[Dict[str, Any]]:
    if MEMORY_FILE.exists():
        try:
            return json.loads(MEMORY_FILE.read_text())
        except Exception:
            return []
    return []


def _save(data: List[Dict[str, Any]]):
    MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    MEMORY_FILE.write_text(json.dumps(data, indent=2))


def remember(role: str, content: str):
    """Append one line of dialogue or event."""
    data = _load()
    data.append({"time": time.time(), "role": role, "content": content})
    _save(data[-MAX_CONTEXT:])  # keep it short


def recall() -> str:
    """Return formatted short-term memory context."""
    data = _load()
    lines = [f"{d['role'].upper()}: {d['content']}" for d in data[-MAX_CONTEXT:]]
    return "\n".join(lines)


# ==============================================================================
# © 2025 Everett Nathaniel Christman & Misty Gail Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================

__all__ = ["_load", "_save", "remember", "recall"]
