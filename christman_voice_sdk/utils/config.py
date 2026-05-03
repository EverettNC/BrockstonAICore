# Christman AI Proprietary.
"""Configuration enums and constants for the Christman Voice SDK."""
from enum import Enum


class Tier(str, Enum):
    """Processing tier controlling model quality vs. speed tradeoff."""
    LITE = "lite"       # Fastest, lowest resource
    STANDARD = "standard"  # Balanced
    ULTRA = "ultra"     # Highest quality, full ToneScore pipeline
