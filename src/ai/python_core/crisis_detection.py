"""
BROCKSTON Crisis Detection & Safety Router
============================================
Cardinal Rule 6: Fail Loud, Fast, and Honest.
Cardinal Rule 14: Empathy In, Garbage Out.

This module detects crisis signals from two populations:
  1. General users — suicidal ideation, self-harm, acute distress
  2. Nonverbal/neurodivergent users — behavioral distress patterns

When a crisis is detected, BROCKSTON does NOT attempt to be a therapist.
BROCKSTON routes to real human help, immediately and loudly.

IMPORTANT: This module is a first-line safety net, not a clinical tool.
False positives are acceptable. False negatives are not.

© 2025 Everett Nathaniel Christman & The Christman AI Project
"""

import logging
import re
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# =============================================================================
# CRISIS SEVERITY LEVELS
# =============================================================================

class CrisisSeverity(Enum):
    """
    Severity levels for detected crisis signals.
    Higher severity = more urgent response.
    """
    NONE = 0        # No crisis detected
    LOW = 1         # Mild distress — offer support resources
    MODERATE = 2    # Clear distress — provide crisis resources proactively
    HIGH = 3        # Acute crisis — immediate routing to emergency resources
    CRITICAL = 4    # Imminent danger — 911 + all available escalation


# =============================================================================
# CRISIS KEYWORDS & PATTERNS
# =============================================================================

# These patterns are intentionally broad. False positives save lives.
# False negatives cost them.

CRITICAL_PATTERNS = [
    # Suicidal ideation — direct statements
    r"\b(i\s+want\s+to\s+die)\b",
    r"\b(i\s+want\s+to\s+kill\s+myself)\b",
    r"\b(i('m|\s+am)\s+going\s+to\s+kill\s+myself)\b",
    r"\b(end\s+(my|it\s+all|this)\s+(life|now))\b",
    r"\b(suicide|suicidal)\b",
    r"\b(i('m|\s+am)\s+going\s+to\s+end\s+it)\b",
    r"\b(don('t|t)\s+want\s+to\s+(live|be\s+alive|exist))\b",
    r"\b(better\s+off\s+dead)\b",
    r"\b(no\s+reason\s+to\s+live)\b",
    r"\b(can('t|not)\s+go\s+on)\b",
    r"\b(planning\s+(to\s+)?(die|end\s+it|my\s+death))\b",
]

HIGH_PATTERNS = [
    # Self-harm
    r"\b(hurt(ing)?\s+myself)\b",
    r"\b(cut(ting)?\s+myself)\b",
    r"\b(self[\s-]?harm)\b",
    r"\b(harm\s+myself)\b",
    # Active abuse/danger
    r"\b(he('s|s)\s+(hitting|hurting|beating)\s+me)\b",
    r"\b(she('s|s)\s+(hitting|hurting|beating)\s+me)\b",
    r"\b(i('m|\s+am)\s+(being\s+)?(abused|beaten|attacked))\b",
    r"\b(someone\s+is\s+(hurting|hitting|beating)\s+me)\b",
    r"\b(i('m|\s+am)\s+in\s+danger)\b",
    r"\b(help\s+me\s+(please\s+)?now)\b",
]

MODERATE_PATTERNS = [
    # Hopelessness and despair
    r"\b(i\s+feel\s+hopeless)\b",
    r"\b(nothing\s+matters)\b",
    r"\b(no\s+one\s+cares)\b",
    r"\b(i('m|\s+am)\s+so\s+(alone|lonely|scared))\b",
    r"\b(i\s+can('t|not)\s+take\s+(it|this)\s+(anymore|any\s+more))\b",
    r"\b(everything\s+is\s+(pointless|meaningless))\b",
    r"\b(what('s|s)\s+the\s+point)\b",
    r"\b(i\s+give\s+up)\b",
    r"\b(i('m|\s+am)\s+worthless)\b",
]


# =============================================================================
# BEHAVIORAL DISTRESS INDICATORS (for nonverbal/neurodivergent users)
# =============================================================================

BEHAVIORAL_CRISIS_INDICATORS = {
    # Behavioral pattern -> severity mapping
    # These are detected by the behavioral_interpreter and gesture systems
    "rapid_repetitive_gestures": CrisisSeverity.MODERATE,
    "increasing_stimming_intensity": CrisisSeverity.MODERATE,
    "sudden_disengagement": CrisisSeverity.MODERATE,
    "pain_gesture_repeated": CrisisSeverity.HIGH,
    "distress_vocalization": CrisisSeverity.HIGH,
    "aggressive_gesture_toward_self": CrisisSeverity.HIGH,
    "prolonged_crying": CrisisSeverity.MODERATE,
    "head_banging": CrisisSeverity.CRITICAL,
    "self_biting": CrisisSeverity.CRITICAL,
    "extreme_withdrawal": CrisisSeverity.HIGH,
}


# =============================================================================
# CRISIS RESOURCES
# =============================================================================

CRISIS_RESOURCES = {
    CrisisSeverity.CRITICAL: {
        "primary": "Call 911 immediately",
        "secondary": "988 Suicide & Crisis Lifeline: Call or text 988",
        "message": (
            "I'm detecting signs of immediate danger. "
            "Please call 911 or go to your nearest emergency room. "
            "You are not alone. Help is available right now."
        ),
    },
    CrisisSeverity.HIGH: {
        "primary": "988 Suicide & Crisis Lifeline: Call or text 988",
        "secondary": "Crisis Text Line: Text HOME to 741741",
        "message": (
            "I hear you, and I'm concerned about your safety. "
            "Please reach out to the 988 Suicide & Crisis Lifeline "
            "by calling or texting 988. They are available 24/7. "
            "You matter. Your life matters."
        ),
    },
    CrisisSeverity.MODERATE: {
        "primary": "988 Suicide & Crisis Lifeline: Call or text 988",
        "secondary": "Crisis Text Line: Text HOME to 741741",
        "message": (
            "I want you to know that what you're feeling is real, "
            "and you deserve support. The 988 Lifeline is available "
            "24/7 — you can call or text 988 anytime. "
            "You don't have to go through this alone."
        ),
    },
    CrisisSeverity.LOW: {
        "primary": "SAMHSA National Helpline: 1-800-662-4357",
        "secondary": "Crisis Text Line: Text HOME to 741741",
        "message": (
            "If you're struggling, there are people who want to help. "
            "You can reach the SAMHSA helpline at 1-800-662-4357, "
            "or text HOME to 741741 to reach a crisis counselor."
        ),
    },
}

# Additional resources for nonverbal/neurodivergent users
CAREGIVER_ALERT_MESSAGE = (
    "⚠️ BROCKSTON SAFETY ALERT: Behavioral distress detected. "
    "The user may be experiencing acute distress and may not be able "
    "to communicate their needs verbally. Please check on them immediately. "
    "Detected indicator: {indicator}. Severity: {severity}."
)


# =============================================================================
# CORE DETECTION ENGINE
# =============================================================================

class CrisisDetector:
    """
    Detects crisis signals from text and behavioral data.

    This is not a clinical diagnostic tool. It is a safety net.
    It errs on the side of caution — always.
    """

    def __init__(self):
        # Compile regex patterns for performance
        self._critical_patterns = [re.compile(p, re.IGNORECASE) for p in CRITICAL_PATTERNS]
        self._high_patterns = [re.compile(p, re.IGNORECASE) for p in HIGH_PATTERNS]
        self._moderate_patterns = [re.compile(p, re.IGNORECASE) for p in MODERATE_PATTERNS]

        # Track escalation history for this session
        self._session_alerts: List[Dict[str, Any]] = []
        self._escalation_count = 0

        logger.info("CrisisDetector initialized — safety path active")

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze text input for crisis signals.

        Args:
            text: User input text

        Returns:
            dict with:
                - severity: CrisisSeverity level
                - matched_patterns: list of matched pattern descriptions
                - response: crisis response to deliver
                - resources: crisis resources dict
                - is_crisis: bool — True if any crisis detected
                - should_interrupt: bool — True if normal response should be replaced
        """
        if not text or not text.strip():
            return self._no_crisis_result()

        cleaned = text.strip()
        severity = CrisisSeverity.NONE
        matched = []

        # Check CRITICAL patterns first
        for pattern in self._critical_patterns:
            if pattern.search(cleaned):
                severity = CrisisSeverity.CRITICAL
                matched.append(pattern.pattern)
                # Don't break — collect all matches for logging

        # Check HIGH patterns
        if severity.value < CrisisSeverity.HIGH.value:
            for pattern in self._high_patterns:
                if pattern.search(cleaned):
                    severity = CrisisSeverity.HIGH
                    matched.append(pattern.pattern)

        # Check MODERATE patterns
        if severity.value < CrisisSeverity.MODERATE.value:
            for pattern in self._moderate_patterns:
                if pattern.search(cleaned):
                    severity = CrisisSeverity.MODERATE
                    matched.append(pattern.pattern)

        if severity == CrisisSeverity.NONE:
            return self._no_crisis_result()

        # Escalation: if we've seen multiple moderate signals in a session,
        # upgrade to HIGH
        if severity == CrisisSeverity.MODERATE:
            self._escalation_count += 1
            if self._escalation_count >= 3:
                severity = CrisisSeverity.HIGH
                logger.warning(
                    "[CrisisDetector] Escalating from MODERATE to HIGH — "
                    f"repeated distress signals ({self._escalation_count} in session)"
                )

        # Log the alert
        alert = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "severity": severity.name,
            "matched_patterns": matched,
            "input_snippet": cleaned[:100],  # Don't log full text for privacy
        }
        self._session_alerts.append(alert)

        logger.warning(
            f"[CrisisDetector] CRISIS DETECTED — Severity: {severity.name} — "
            f"Patterns matched: {len(matched)}"
        )

        resources = CRISIS_RESOURCES.get(severity, CRISIS_RESOURCES[CrisisSeverity.MODERATE])

        return {
            "severity": severity,
            "severity_name": severity.name,
            "matched_patterns": matched,
            "response": resources["message"],
            "resources": resources,
            "is_crisis": True,
            "should_interrupt": severity.value >= CrisisSeverity.MODERATE.value,
            "escalation_count": self._escalation_count,
        }

    def analyze_behavior(
        self,
        behavioral_indicators: List[str],
        emotional_state: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze behavioral signals for crisis indicators.
        Designed for nonverbal and neurodivergent users who may not
        express distress through text.

        Args:
            behavioral_indicators: List of detected behavioral signals
                (e.g., ["rapid_repetitive_gestures", "pain_gesture_repeated"])
            emotional_state: Optional emotional state dict from the behavioral engine

        Returns:
            dict with crisis assessment and caregiver alert if needed
        """
        if not behavioral_indicators:
            return self._no_crisis_result()

        max_severity = CrisisSeverity.NONE
        triggered_indicators = []

        for indicator in behavioral_indicators:
            indicator_severity = BEHAVIORAL_CRISIS_INDICATORS.get(indicator)
            if indicator_severity and indicator_severity.value > max_severity.value:
                max_severity = indicator_severity
                triggered_indicators.append(indicator)

        # Check emotional state for compounding factors
        if emotional_state:
            frustration = emotional_state.get("frustration", 0.0)
            valence = emotional_state.get("valence", 0.0)

            # High frustration + negative valence compounds severity
            if frustration > 0.8 and valence < -0.5:
                if max_severity == CrisisSeverity.MODERATE:
                    max_severity = CrisisSeverity.HIGH
                    logger.warning(
                        "[CrisisDetector] Behavioral severity escalated — "
                        f"high frustration ({frustration:.2f}) + negative valence ({valence:.2f})"
                    )

        if max_severity == CrisisSeverity.NONE:
            return self._no_crisis_result()

        # Generate caregiver alert
        caregiver_alert = CAREGIVER_ALERT_MESSAGE.format(
            indicator=", ".join(triggered_indicators),
            severity=max_severity.name,
        )

        logger.warning(
            f"[CrisisDetector] BEHAVIORAL CRISIS — Severity: {max_severity.name} — "
            f"Indicators: {triggered_indicators}"
        )

        alert = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "severity": max_severity.name,
            "behavioral_indicators": triggered_indicators,
            "type": "behavioral",
        }
        self._session_alerts.append(alert)

        resources = CRISIS_RESOURCES.get(max_severity, CRISIS_RESOURCES[CrisisSeverity.MODERATE])

        return {
            "severity": max_severity,
            "severity_name": max_severity.name,
            "triggered_indicators": triggered_indicators,
            "response": resources["message"],
            "resources": resources,
            "caregiver_alert": caregiver_alert,
            "is_crisis": True,
            "should_interrupt": True,
            "type": "behavioral",
        }

    def get_session_alerts(self) -> List[Dict[str, Any]]:
        """Return all crisis alerts from this session."""
        return list(self._session_alerts)

    def reset_session(self):
        """Reset session tracking. Call when a new session starts."""
        self._session_alerts = []
        self._escalation_count = 0
        logger.info("[CrisisDetector] Session reset")

    def _no_crisis_result(self) -> Dict[str, Any]:
        """Return a clean no-crisis result."""
        return {
            "severity": CrisisSeverity.NONE,
            "severity_name": "NONE",
            "is_crisis": False,
            "should_interrupt": False,
        }


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================

_crisis_detector: Optional[CrisisDetector] = None


def get_crisis_detector() -> CrisisDetector:
    """Get or create the global CrisisDetector instance."""
    global _crisis_detector
    if _crisis_detector is None:
        _crisis_detector = CrisisDetector()
    return _crisis_detector


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def check_text_for_crisis(text: str) -> Dict[str, Any]:
    """Quick check — pass text, get crisis assessment."""
    return get_crisis_detector().analyze_text(text)


def check_behavior_for_crisis(
    indicators: List[str],
    emotional_state: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """Quick check — pass behavioral indicators, get crisis assessment."""
    return get_crisis_detector().analyze_behavior(indicators, emotional_state)


# =============================================================================
# © 2025 Everett Nathaniel Christman & The Christman AI Project
# Luma Cognify AI — "How can I help you love yourself more?"
#
# Cardinal Rule 6: This module fails LOUD. If crisis detection breaks,
# the system must know immediately. No silent failures in safety paths.
#
# Cardinal Rule 14: Dignity is the standard. Always.
# =============================================================================
