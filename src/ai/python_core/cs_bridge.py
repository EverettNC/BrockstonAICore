"""
Carbon–Silicon Bridge

Thin wrapper around the tone engine + formatting law that gives
child systems a single object to talk to.

Goal: keep kids' code simple:

    bridge = CarbonSiliconBridge()
    tone = bridge.read_user_message(user_text)
    mode = tone.suggested_mode
"""

from dataclasses import dataclass

from tone_engine import ToneProfile, get_style_for_message


@dataclass
class BridgeResult:
    tone: ToneProfile


class CarbonSiliconBridge:
    """
    Entry point for derek, brockston, alphavox, alphawolf, etc.

    They don't care how the internals work; they just ask:
    "Given this message, how should I behave?"
    """

    def read_user_message(self, text: str) -> BridgeResult:
        tone = get_style_for_message(text)
        return BridgeResult(tone=tone)
