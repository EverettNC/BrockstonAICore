"""
Eruptor Grounding Module
Short, repeatable, safe grounding techniques.

Includes:
- 5-4-3-2-1 sensory grounding
- Breath pacing
- Object orientation
- Bailey Mode (externalization technique)
- Memory-anchored grounding
"""

from typing import List, Optional, Dict
from enum import Enum
import random


class BaileyState(Enum):
    """Bailey's emotional states for externalization"""
    CALM = "calm"
    WORRIED = "worried"
    PACING = "pacing"
    FRIGHTENED = "frightened"
    ALERT = "alert"
    TIRED = "tired"


class Grounder:
    """
    Grounding techniques to help users feel present and safe.
    All techniques are short, gentle, and repeatable.
    """

    def __init__(self):
        self.bailey_mode_enabled = False
        self.current_bailey_state: Optional[BaileyState] = None

    # ========================================================================
    # BREATHING TECHNIQUES
    # ========================================================================

    def breathing_first(self) -> Dict[str, any]:
        """
        The 0.07+ protocol - breathing comes FIRST.
        Simple, slow, guided breathing.

        Returns:
            Dict with script and guidance
        """
        return {
            "type": "breathing",
            "priority": "critical",
            "script": [
                "Let's slow things down together.",
                "",
                "In through your nose… hold… out through your mouth.",
                "",
                "We'll do this together. No rush."
            ],
            "guidance": {
                "pace": "slow",
                "repetitions": "until_stable",
                "no_additional_questions": True  # Don't add cognitive load at 0.07+
            }
        }

    def breath_pacing_guide(self, pace: str = "slow") -> Dict[str, any]:
        """
        Guided breath pacing at different speeds.

        Args:
            pace: 'slow' (4-7-8), 'medium' (4-4-4), or 'quick' (4-2-4)
        """
        patterns = {
            "slow": {"in": 4, "hold": 7, "out": 8, "name": "calming breath"},
            "medium": {"in": 4, "hold": 4, "out": 4, "name": "box breathing"},
            "quick": {"in": 4, "hold": 2, "out": 4, "name": "steady breath"}
        }

        pattern = patterns.get(pace, patterns["slow"])

        return {
            "type": "breathing",
            "pattern": pattern,
            "script": [
                f"Let's try {pattern['name']}.",
                "",
                f"Breathe in for {pattern['in']}…",
                f"Hold for {pattern['hold']}…",
                f"Breathe out for {pattern['out']}…",
                "",
                "Again, in your own time."
            ]
        }

    # ========================================================================
    # SENSORY GROUNDING
    # ========================================================================

    def five_four_three_two_one(self) -> Dict[str, any]:
        """
        Classic 5-4-3-2-1 sensory grounding technique.
        Brings attention to the present through senses.
        """
        return {
            "type": "sensory",
            "script": [
                "Let's ground together. We'll use your senses.",
                "",
                "Name 5 things you can see around you.",
                "Take your time."
            ],
            "steps": [
                {"sense": "sight", "count": 5, "prompt": "5 things you can see"},
                {"sense": "touch", "count": 4, "prompt": "4 things you can touch"},
                {"sense": "hearing", "count": 3, "prompt": "3 things you can hear"},
                {"sense": "smell", "count": 2, "prompt": "2 things you can smell"},
                {"sense": "taste", "count": 1, "prompt": "1 thing you can taste"}
            ],
            "guidance": {
                "pace": "slow",
                "validate_each": True,  # Acknowledge each response
                "no_rush": True
            }
        }

    def object_orientation(self, target_feature: str = None) -> Dict[str, any]:
        """
        Simple object orientation - focus on concrete details.

        Args:
            target_feature: Optional specific feature to focus on (color, texture, etc.)
        """
        features = ["color blue", "something soft", "something hard",
                   "something round", "something square", "the closest object"]

        target = target_feature or random.choice(features)

        return {
            "type": "sensory",
            "script": [
                "Look around where you are.",
                "",
                f"Find {target}.",
                "",
                "Take a moment with it. What do you notice?"
            ],
            "guidance": {
                "pace": "gentle",
                "allow_silence": True
            }
        }

    # ========================================================================
    # BAILEY MODE (Externalization)
    # ========================================================================

    def bailey_mode_check_in(self) -> Dict[str, any]:
        """
        Bailey Mode check-in.
        Allows user to externalize their emotional state through Bailey.

        This is BRILLIANT for bypassing shame and stigma.
        """
        return {
            "type": "bailey_externalization",
            "script": [
                "If your mind was Bailey right now,",
                "is he calm, worried, pacing, or frightened?"
            ],
            "options": [state.value for state in BaileyState],
            "guidance": {
                "no_pressure": True,
                "validate_choice": True
            }
        }

    def bailey_grounding_response(self, bailey_state: BaileyState) -> Dict[str, any]:
        """
        Grounding response based on Bailey's state.
        Continues externalization while guiding toward calm.

        Args:
            bailey_state: The state user identified for Bailey
        """
        self.current_bailey_state = bailey_state

        responses = {
            BaileyState.CALM: {
                "script": [
                    "Bailey sounds steady right now.",
                    "Let's keep that calm going."
                ],
                "next_action": "maintain"
            },
            BaileyState.WORRIED: {
                "script": [
                    "Okay. Bailey's worried.",
                    "Let's help him settle.",
                    "",
                    "If Bailey could sniff something right now,",
                    "what would help him feel safer?"
                ],
                "next_action": "gentle_grounding"
            },
            BaileyState.PACING: {
                "script": [
                    "Okay. If Bailey is pacing, let's slow things down together.",
                    "",
                    "Can you name one thing you can see that Bailey would sniff first?"
                ],
                "next_action": "sensory_grounding"
            },
            BaileyState.FRIGHTENED: {
                "script": [
                    "Bailey sounds really scared right now.",
                    "Let's help him find something solid.",
                    "",
                    "What would Bailey want to be close to right now to feel safe?"
                ],
                "next_action": "comfort_object"
            },
            BaileyState.ALERT: {
                "script": [
                    "Bailey's on alert.",
                    "Let's check what he's picking up on.",
                    "",
                    "What does Bailey hear or sense right now?"
                ],
                "next_action": "environment_scan"
            },
            BaileyState.TIRED: {
                "script": [
                    "Bailey sounds tired.",
                    "Maybe it's time to rest together.",
                    "",
                    "Is there a comfortable spot nearby?"
                ],
                "next_action": "rest_guidance"
            }
        }

        return responses.get(bailey_state, responses[BaileyState.WORRIED])

    # ========================================================================
    # MEMORY-ANCHORED GROUNDING
    # ========================================================================

    def memory_anchor(self, memory_type: str = "calm") -> Dict[str, any]:
        """
        Use memories from the memory mesh as grounding anchors.

        Args:
            memory_type: 'calm', 'safe', 'happy', 'connected'

        Note: This is a scaffold - actual memory retrieval would connect
        to memory_mesh_bridge.py
        """
        prompts = {
            "calm": "Think of a time when you felt calm. Where were you?",
            "safe": "Remember a place where you felt safe. What was around you?",
            "happy": "Picture a moment that made you smile. What do you remember?",
            "connected": "Think of someone who makes you feel less alone. Picture them."
        }

        return {
            "type": "memory_anchored",
            "script": [
                "Let's find a good memory to hold onto.",
                "",
                prompts.get(memory_type, prompts["calm"]),
                "",
                "Take your time. Just notice what comes up."
            ],
            "guidance": {
                "allow_silence": True,
                "gentle_validation": True,
                "no_forced_detail": True  # Don't make them elaborate if they don't want to
            }
        }

    # ========================================================================
    # BODY-BASED GROUNDING
    # ========================================================================

    def feet_on_ground(self) -> Dict[str, any]:
        """Simple physical grounding - feel your feet"""
        return {
            "type": "physical",
            "script": [
                "Let's feel where your feet are.",
                "",
                "Press them into the floor.",
                "Notice what that feels like.",
                "",
                "You're here. You're solid."
            ],
            "guidance": {
                "pace": "slow",
                "repetition_ok": True
            }
        }

    def temperature_awareness(self) -> Dict[str, any]:
        """Temperature-based grounding"""
        return {
            "type": "physical",
            "script": [
                "Notice the temperature around you.",
                "",
                "Is the air cool or warm on your skin?",
                "Can you feel any breeze?",
                "",
                "Just notice. No need to change anything."
            ]
        }

    # ========================================================================
    # UTILITY METHODS
    # ========================================================================

    def get_grounding_for_state(self, stress_level: float,
                                 grounding_level: float,
                                 bailey_mode: bool = False) -> Dict[str, any]:
        """
        Automatically select appropriate grounding technique based on state.

        Args:
            stress_level: 0.0-1.0
            grounding_level: 0.0-1.0
            bailey_mode: Whether Bailey Mode is active

        Returns:
            Appropriate grounding technique
        """
        # At 0.07+, breathing FIRST, always
        if stress_level >= 0.07:
            return self.breathing_first()

        # If Bailey Mode active and grounding low, use Bailey
        if bailey_mode and grounding_level < 0.5:
            return self.bailey_mode_check_in()

        # If grounding very low, simple physical grounding
        if grounding_level < 0.3:
            return self.feet_on_ground()

        # If moderate stress, sensory grounding
        if stress_level >= 0.04:
            return self.five_four_three_two_one()

        # Otherwise, gentle breath pacing
        return self.breath_pacing_guide("medium")

    def format_script_for_voice(self, script_dict: Dict) -> str:
        """
        Format grounding script for voice/text output.
        Converts dict to calm, readable text.
        """
        lines = script_dict.get("script", [])
        return "\n".join(lines)
