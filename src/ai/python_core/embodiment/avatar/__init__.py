"""
embodiment.avatar namespace package.

Provides AvatarEngine interface and NullAvatarEngine fallback
used by brain_core.py. These are lightweight interface contracts only —
the actual rendering implementation attaches at runtime.
"""


class AvatarEngine:
    """Base interface for BROCKSTON's avatar rendering layer."""

    def start(self): ...
    def speak(self, text: str): ...
    def stop(self): ...


class NullAvatarEngine(AvatarEngine):
    """No-op engine used when avatar is disabled or unavailable."""

    def start(self): pass
    def speak(self, text: str): pass
    def stop(self): pass
