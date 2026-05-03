"""
embodiment.avatar package — BROCKSTON's visual avatar subsystem.

Provides the AvatarEngine interface and NullAvatarEngine fallback
used by brain_core.py when full avatar rendering is unavailable.
"""


class AvatarEngine:
    """Base avatar engine interface"""

    def start(self):
        pass

    def speak(self, text: str):
        pass

    def stop(self):
        pass


class NullAvatarEngine(AvatarEngine):
    """No-op avatar engine — used when avatar is disabled or unavailable"""

    def start(self):
        pass

    def speak(self, text: str):
        pass

    def stop(self):
        pass


# Expose interface at package level so brain_core.py import works:
# from embodiment.avatar.interface import AvatarEngine, NullAvatarEngine
