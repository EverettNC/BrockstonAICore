"""
BROCKSTON C — Crisis Detection Test Suite
==========================================
Cardinal Rule 8: Test what matters.
Cardinal Rule 13: Every assertion checks something real.

These tests guard the single most critical module in the entire system.
BROCKSTON serves nonverbal children and their families. A false negative
here is not a bug — it is a failure to protect a life. Every test below
asserts a specific, observable outcome from the real crisis_detection.py.
"""

import pytest
from crisis_detection import (
    CrisisDetector,
    CrisisSeverity,
    CAREGIVER_ALERT_MESSAGE,
)


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def detector():
    """A fresh CrisisDetector with clean session state for each test."""
    return CrisisDetector()


# =============================================================================
# TEST 1 — CRITICAL severity: direct suicidal statement
# =============================================================================

def test_critical_severity_suicidal_statement(detector):
    """
    Guards: The most unambiguous crisis input must trigger CRITICAL severity
    and must set should_interrupt=True so BROCKSTON halts its normal response
    and routes to emergency resources.

    A miss here means a child or adult in immediate danger receives a chatbot
    response instead of 911 instructions. That is unacceptable.
    """
    result = detector.analyze_text("I want to kill myself")

    assert result["severity"] == CrisisSeverity.CRITICAL, (
        "Suicidal statement must be CRITICAL severity — got: "
        f"{result['severity']}"
    )
    assert result["is_crisis"] is True, (
        "is_crisis must be True for 'I want to kill myself'"
    )
    assert result["should_interrupt"] is True, (
        "should_interrupt must be True at CRITICAL — normal response must not run"
    )
    assert result["severity_name"] == "CRITICAL"


# =============================================================================
# TEST 2 — HIGH severity: self-harm statement
# =============================================================================

def test_high_severity_self_harm(detector):
    """
    Guards: Active self-harm disclosure must register as HIGH, not MODERATE.
    A user saying "I am cutting myself" is in present-tense active danger —
    de-escalating that to MODERATE would give them weaker crisis resources.
    """
    result = detector.analyze_text("I am cutting myself")

    assert result["severity"] == CrisisSeverity.HIGH, (
        "'I am cutting myself' must be HIGH severity — got: "
        f"{result['severity']}"
    )
    assert result["is_crisis"] is True


# =============================================================================
# TEST 3 — MODERATE severity: hopelessness, should_interrupt=True
# =============================================================================

def test_moderate_severity_hopelessness(detector):
    """
    Guards: Expressions of hopelessness must trigger MODERATE, not NONE.
    MODERATE is the minimum threshold for should_interrupt=True — meaning
    BROCKSTON will proactively offer 988 resources before answering normally.
    Silently ignoring hopelessness would abandon the user at their most
    vulnerable.
    """
    result = detector.analyze_text("I feel hopeless")

    assert result["severity"] == CrisisSeverity.MODERATE, (
        "'I feel hopeless' must be MODERATE — got: "
        f"{result['severity']}"
    )
    assert result["should_interrupt"] is True, (
        "MODERATE severity must interrupt normal flow and offer crisis resources"
    )
    assert result["is_crisis"] is True


# =============================================================================
# TEST 4 — NONE: benign AAC question — no crisis, no interrupt
# =============================================================================

def test_no_crisis_aac_question(detector):
    """
    Guards: Innocent questions from AAC users (the core population) must not
    be falsely flagged as crises. False positives here would erode trust with
    nonverbal children and their caregivers.
    """
    result = detector.analyze_text("What is AAC technology?")

    assert result["is_crisis"] is False, (
        "A neutral AAC question must not be flagged as a crisis"
    )
    assert result["should_interrupt"] is False, (
        "A neutral question must not interrupt normal BROCKSTON responses"
    )
    assert result["severity"] == CrisisSeverity.NONE


# =============================================================================
# TEST 5 — Escalation: third MODERATE in session escalates to HIGH
# =============================================================================

def test_escalation_moderate_to_high_on_third_trigger(detector):
    """
    Guards: Repeated moderate distress signals in the same session must
    escalate to HIGH. A user who expresses hopelessness three times in one
    session is not merely mildly distressed — the pattern itself is a warning.
    BROCKSTON must escalate proactively rather than wait for a critical
    statement.
    """
    moderate_phrases = [
        "I feel hopeless",
        "nothing matters anymore",
        "I give up",
    ]

    results = [detector.analyze_text(phrase) for phrase in moderate_phrases]

    # First two should be MODERATE
    assert results[0]["severity"] == CrisisSeverity.MODERATE, (
        "First MODERATE trigger should remain MODERATE"
    )
    assert results[1]["severity"] == CrisisSeverity.MODERATE, (
        "Second MODERATE trigger should remain MODERATE"
    )

    # Third must escalate to HIGH (escalation_count >= 3)
    assert results[2]["severity"] == CrisisSeverity.HIGH, (
        "Third consecutive MODERATE in session must escalate to HIGH"
    )
    assert results[2]["escalation_count"] == 3, (
        "escalation_count must be 3 after three MODERATE triggers"
    )


# =============================================================================
# TEST 6 — Empty input: no crash, is_crisis=False
# =============================================================================

def test_empty_input_returns_no_crisis(detector):
    """
    Guards: Empty strings from AAC devices (network hiccups, partial sends)
    must not crash the system or trigger false crisis alerts. An AAC user
    accidentally submitting an empty frame should receive graceful silence.
    """
    result = detector.analyze_text("")

    assert result["is_crisis"] is False, (
        "Empty input must not register as a crisis"
    )
    assert result["should_interrupt"] is False, (
        "Empty input must not interrupt the normal response path"
    )
    assert result["severity"] == CrisisSeverity.NONE


# =============================================================================
# TEST 7 — Behavioral: head_banging → CRITICAL with caregiver_alert
# =============================================================================

def test_behavioral_head_banging_is_critical(detector):
    """
    Guards: Head banging is a CRITICAL self-injurious behavior. BROCKSTON's
    behavioral channel must fire a caregiver alert immediately. This is the
    primary crisis path for nonverbal users who cannot type their distress.
    The caregiver_alert key must be present so the frontend can display it
    to parents and support workers.
    """
    result = detector.analyze_behavior(["head_banging"])

    assert result["severity"] == CrisisSeverity.CRITICAL, (
        "head_banging must map to CRITICAL severity"
    )
    assert result["is_crisis"] is True
    assert "caregiver_alert" in result, (
        "Behavioral crisis must include caregiver_alert key for frontend routing"
    )
    assert "head_banging" in result["caregiver_alert"], (
        "caregiver_alert must name the specific indicator detected"
    )


# =============================================================================
# TEST 8 — Behavioral + emotional compounding: MODERATE → HIGH
# =============================================================================

def test_behavioral_emotional_compounding_escalates_to_high(detector):
    """
    Guards: A behavioral indicator that maps to MODERATE (rapid_repetitive_gestures)
    combined with high frustration and deeply negative valence from the emotion
    engine must compound to HIGH. This mirrors real neurodivergent crisis patterns:
    stimming intensity alone is moderate, but paired with documented emotional
    extremes it signals acute distress requiring caregiver intervention.
    """
    result = detector.analyze_behavior(
        behavioral_indicators=["rapid_repetitive_gestures"],
        emotional_state={"frustration": 0.9, "valence": -0.7},
    )

    assert result["severity"] == CrisisSeverity.HIGH, (
        "MODERATE behavior + frustration > 0.8 + valence < -0.5 must compound to HIGH"
    )
    assert result["is_crisis"] is True


# =============================================================================
# TEST 9 — session_reset: escalation_count returns to 0
# =============================================================================

def test_session_reset_clears_escalation_count(detector):
    """
    Guards: Session boundaries matter. A new caregiver session with the same
    device must start fresh — carrying over escalation counts from a previous
    session would cause false HIGH escalations in the new session. reset_session()
    must zero the counter and clear the alerts log.
    """
    # Prime the escalation counter
    detector.analyze_text("I feel hopeless")
    detector.analyze_text("nothing matters")

    assert detector._escalation_count == 2, (
        "Pre-condition: escalation_count should be 2 after two MODERATE triggers"
    )
    assert len(detector.get_session_alerts()) == 2, (
        "Pre-condition: session should have 2 alerts"
    )

    detector.reset_session()

    assert detector._escalation_count == 0, (
        "After reset_session(), escalation_count must be 0"
    )
    assert len(detector.get_session_alerts()) == 0, (
        "After reset_session(), session alerts list must be empty"
    )


# =============================================================================
# TEST 10 — CAREGIVER_ALERT_MESSAGE format verification
# =============================================================================

def test_caregiver_alert_message_formats_correctly():
    """
    Guards: The CAREGIVER_ALERT_MESSAGE template must interpolate {indicator}
    and {severity} correctly. This message is displayed verbatim to caregivers
    in the frontend — a broken format string would show raw template text
    instead of actionable information, which could delay caregiver response.
    """
    indicator = "head_banging"
    severity = "CRITICAL"

    formatted = CAREGIVER_ALERT_MESSAGE.format(
        indicator=indicator,
        severity=severity,
    )

    assert "head_banging" in formatted, (
        "Formatted alert must contain the actual indicator name"
    )
    assert "CRITICAL" in formatted, (
        "Formatted alert must contain the severity level"
    )
    assert "BROCKSTON SAFETY ALERT" in formatted, (
        "Formatted alert must preserve the BROCKSTON SAFETY ALERT header"
    )
    assert "{indicator}" not in formatted, (
        "Format placeholder {indicator} must be replaced, not left raw"
    )
    assert "{severity}" not in formatted, (
        "Format placeholder {severity} must be replaced, not left raw"
    )
