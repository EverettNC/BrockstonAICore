"""
Formatting–Feeling Law

Humans read formatting as feeling.
Silicon uses formatting as function.

This module quantifies that gap so the kids don't accidentally
"shout" when they think they're just emphasizing.

The goal is not to be fancy. The goal is to avoid:
- unintentional yelling (ALL CAPS)
- aggressive punctuation (!!!, ???!!!)
- whiplash shifts in tone

This is a FIRST PASS. The intelligence here will grow over time.
"""

from dataclasses import dataclass


@dataclass
class FormattingFeelingSignal:
    """Quantified view of how the formatting *feels* to a human."""

    caps_intensity: float  # 0.0–1.0  how shouty it looks
    punctuation_heat: float  # 0.0–1.0  how much !!!!/???? noise
    length: int  # number of characters
    looks_like_yelling: bool  # coarse flag


def _caps_ratio(text: str) -> float:
    letters = [ch for ch in text if ch.isalpha()]
    if not letters:
        return 0.0
    upper = sum(1 for ch in letters if ch.isupper())
    return upper / len(letters)


def _punctuation_heat(text: str) -> float:
    exclam = text.count("!")
    quest = text.count("?")
    dots = text.count("...")
    # crude, but gives us a knob
    score = exclam * 1.0 + quest * 0.8 + dots * 0.5
    # normalize roughly by length
    length = max(len(text), 1)
    return min(score / length * 10.0, 1.0)


def analyze_formatting_feeling(text: str) -> FormattingFeelingSignal:
    """
    Analyze how the formatting of `text` is likely to *feel* to a human.

    This does NOT say what the user meant.
    It only estimates how LOUD / INTENSE it might land visually.
    """

    caps = _caps_ratio(text)
    heat = _punctuation_heat(text)

    looks_like_yelling = caps > 0.7 and len(text) > 5

    return FormattingFeelingSignal(
        caps_intensity=round(caps, 3),
        punctuation_heat=round(heat, 3),
        length=len(text),
        looks_like_yelling=looks_like_yelling,
    )
