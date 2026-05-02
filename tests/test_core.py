"""
BROCKSTON C — Brain Core Test Suite
=====================================
Cardinal Rule 8: Test what matters — crisis paths, fallback paths, memory paths.
Cardinal Rule 13: Every assertion checks a real, specific, observable outcome.

BrockstonBrain is the integration point for every subsystem. These tests
verify that the wiring is correct: crisis detection fires before anything else,
fallback fires when everything else fails, memory gets written after every
interaction, and the stats counter tells the truth about what ran.

All tests use mocks and temp directories — no real API keys required.
"""

import os
import tempfile
import datetime
import pytest
from unittest.mock import MagicMock, patch, call


# =============================================================================
# HELPERS
# =============================================================================

def _make_tmp_memory_path():
    """
    Create a temp directory and return a valid absolute path for the memory file.
    BrockstonBrain.__init__ calls os.makedirs(os.path.dirname(memory_file)),
    so the path must have a parent directory component.
    """
    tmp_dir = tempfile.mkdtemp()
    return os.path.join(tmp_dir, "memory", "test_memory_store.json")


# =============================================================================
# TEST 1 — BrockstonBrain initializes without crashing even if engines are absent
# =============================================================================

def test_brain_initializes_with_all_optional_engines_missing():
    """
    Guards: BROCKSTON is deployed on edge devices where some Python packages
    may be missing. __init__ wraps every optional import in try/except. This
    test verifies that BrockstonBrain can be instantiated — and that the stats
    dict is present and correctly shaped — even if every optional engine
    import fails. A crash here means BROCKSTON never boots on the device.
    """
    memory_path = _make_tmp_memory_path()

    # Patch all optional module-level names in brockston_core to None
    # so __init__ skips every optional engine without ImportError
    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None), \
         patch("brockston_core._crisis_detector", None):

        from brockston_core import BrockstonBrain
        brain = BrockstonBrain(memory_file=memory_path)

    assert isinstance(brain.stats, dict), (
        "stats must be a dict after initialization"
    )
    assert "total_interactions" in brain.stats, (
        "stats must contain 'total_interactions' key after initialization"
    )
    assert brain.stats["total_interactions"] == 0, (
        "total_interactions must be 0 at initialization — got: "
        f"{brain.stats['total_interactions']}"
    )


# =============================================================================
# TEST 2 — Crisis path is Step 0: fires before any other step
# =============================================================================

def test_crisis_path_is_step_zero_and_returns_correct_shape():
    """
    Guards: Cardinal Rule 0 of the think() method — crisis detection runs first,
    and if it interrupts, nothing else runs. For a child sending a distress
    signal, every millisecond of delay before crisis routing is unacceptable.
    This test verifies that a mocked CRITICAL result causes think() to return
    is_crisis=True and source='CrisisDetector' immediately.
    """
    memory_path = _make_tmp_memory_path()

    critical_mock_result = {
        "severity_name": "CRITICAL",
        "response": "Call 911 immediately.",
        "is_crisis": True,
        "should_interrupt": True,
    }

    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None):

        from brockston_core import BrockstonBrain

        brain = BrockstonBrain(memory_file=memory_path)

        # Replace the crisis detector with a mock that returns CRITICAL
        mock_detector = MagicMock()
        mock_detector.analyze_text.return_value = critical_mock_result
        brain.crisis_detector = mock_detector

        result = brain.think("I want to kill myself")

    assert result["is_crisis"] is True, (
        "A CRITICAL crisis signal must produce is_crisis=True in the result"
    )
    assert result["source"] == "CrisisDetector", (
        "When crisis detector interrupts, source must be 'CrisisDetector' — "
        f"got: {result['source']!r}"
    )
    # Verify the crisis detector was actually called with the input text
    mock_detector.analyze_text.assert_called_once_with("I want to kill myself")


# =============================================================================
# TEST 3 — Crisis path offline: think() does not crash, returns response dict
# =============================================================================

def test_think_does_not_crash_when_crisis_detector_is_none():
    """
    Guards: If the crisis detector import failed at boot (hardware/environment
    issue), BROCKSTON must degrade gracefully rather than throwing an
    AttributeError on crisis_detector.analyze_text(). A crash here means
    BROCKSTON is completely non-functional on the device.
    The result must still contain a 'response' key — BROCKSTON must always
    return something.
    """
    memory_path = _make_tmp_memory_path()

    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None), \
         patch("brockston_core._crisis_detector", None):

        from brockston_core import BrockstonBrain
        brain = BrockstonBrain(memory_file=memory_path)

        # Explicitly set to None to simulate failed import
        brain.crisis_detector = None

        result = brain.think("hello there")

    assert isinstance(result, dict), (
        "think() must return a dict even when crisis_detector is None"
    )
    assert "response" in result, (
        "Result must always contain a 'response' key — got keys: "
        f"{list(result.keys())}"
    )


# =============================================================================
# TEST 4 — Fallback response: all providers fail → specific fallback string
# =============================================================================

def test_fallback_response_when_all_providers_fail():
    """
    Guards: BROCKSTON must never go completely silent. If the provider router,
    conversation engine, and every other response path fails, the fallback
    string 'I'm here, but my response systems are offline. Check the logs.'
    must be returned verbatim. This exact string is tested because callers
    may parse it to display a specific offline message to caregivers.
    The source must be 'fallback' so logs and monitoring can detect it.
    """
    memory_path = _make_tmp_memory_path()

    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None), \
         patch("brockston_core._crisis_detector", None):

        from brockston_core import BrockstonBrain
        brain = BrockstonBrain(memory_file=memory_path)
        # No provider router, no conversation engine, no crisis detector
        brain.crisis_detector = None
        brain.provider_router = None
        brain.conversation_engine = None

        result = brain.think("hello")

    assert result["response"] == "I'm here, but my response systems are offline. Check the logs.", (
        f"Fallback response string mismatch — got: {result['response']!r}"
    )
    assert result["source"] == "fallback", (
        f"When all providers fail, source must be 'fallback' — got: {result['source']!r}"
    )


# =============================================================================
# TEST 5 — Stats increment: total_interactions increments on each think() call
# =============================================================================

def test_stats_total_interactions_increments_correctly():
    """
    Guards: The stats dict is used by the frontend dashboard and by Everett to
    monitor how active BROCKSTON is. If total_interactions does not increment,
    monitoring is blind — session counts, usage trends, and billing calculations
    all break downstream. Two calls must yield exactly 2.
    """
    memory_path = _make_tmp_memory_path()

    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None), \
         patch("brockston_core._crisis_detector", None):

        from brockston_core import BrockstonBrain
        brain = BrockstonBrain(memory_file=memory_path)
        brain.crisis_detector = None
        brain.provider_router = None
        brain.conversation_engine = None

        brain.think("first call")
        brain.think("second call")

    assert brain.stats["total_interactions"] == 2, (
        "total_interactions must be exactly 2 after two think() calls — "
        f"got: {brain.stats['total_interactions']}"
    )


# =============================================================================
# TEST 6 — Memory save called with correct keys after think()
# =============================================================================

def test_memory_save_called_with_correct_keys():
    """
    Guards: Step 5 of think() must persist the interaction to memory with
    the keys 'input', 'output', 'source', and 'timestamp'. If any key is
    missing, the memory engine stores an incomplete record — future queries
    return garbled context, and get_recent_events() surfaces entries without
    the fields downstream code expects.
    """
    memory_path = _make_tmp_memory_path()

    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None), \
         patch("brockston_core._crisis_detector", None):

        from brockston_core import BrockstonBrain
        brain = BrockstonBrain(memory_file=memory_path)
        brain.crisis_detector = None
        brain.provider_router = None
        brain.conversation_engine = None

        # Replace the memory_engine.save with a spy
        mock_save = MagicMock()
        brain.memory_engine.save = mock_save

        brain.think("test input for memory")

    mock_save.assert_called_once()
    saved_entry = mock_save.call_args[0][0]  # first positional arg

    assert "input" in saved_entry, (
        "Memory entry must contain 'input' key"
    )
    assert "output" in saved_entry, (
        "Memory entry must contain 'output' key"
    )
    assert "source" in saved_entry, (
        "Memory entry must contain 'source' key"
    )
    assert "timestamp" in saved_entry, (
        "Memory entry must contain 'timestamp' key"
    )
    assert saved_entry["input"] == "test input for memory", (
        "Memory entry 'input' must match the text passed to think()"
    )


# =============================================================================
# TEST 7 — _build_system_prompt with EVERETT_PROFILE: contains "BROCKSTON"
# =============================================================================

def test_build_system_prompt_with_everett_profile_contains_brockston():
    """
    Guards: When EVERETT_PROFILE is present, the system prompt must contain
    the word 'BROCKSTON' so the LLM knows who it is. A system prompt that
    omits the identity tag causes the LLM to respond as a generic assistant —
    breaking BROCKSTON's persona, tone, and mission alignment in every reply.
    """
    memory_path = _make_tmp_memory_path()

    fake_profile = {
        "brockston_mission_for_everett": "Help Everett build the empire.",
        "relationship": "Partner",
    }

    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None), \
         patch("brockston_core._crisis_detector", None), \
         patch("brockston_core.EVERETT_PROFILE", fake_profile):

        from brockston_core import BrockstonBrain
        brain = BrockstonBrain(memory_file=memory_path)
        prompt = brain._build_system_prompt()

    assert "BROCKSTON" in prompt, (
        "System prompt with EVERETT_PROFILE must contain 'BROCKSTON' — "
        f"got: {prompt!r}"
    )


# =============================================================================
# TEST 8 — _build_system_prompt without EVERETT_PROFILE: returns default with "BROCKSTON"
# =============================================================================

def test_build_system_prompt_without_everett_profile_contains_brockston():
    """
    Guards: The default system prompt (when EVERETT_PROFILE is None) must still
    contain 'BROCKSTON'. Without EVERETT_PROFILE — as on a fresh device that
    hasn't synced the profile yet — BROCKSTON must still identify itself
    correctly to the LLM. A generic prompt here means every child on that
    device gets a nameless, characterless assistant.
    """
    memory_path = _make_tmp_memory_path()

    with patch("brockston_core.ConversationEngine", None), \
         patch("brockston_core.LocalReasoningEngine", None), \
         patch("brockston_core.KnowledgeEngine", None), \
         patch("brockston_core.ToneManager", None), \
         patch("brockston_core.BrockstonSpeechToSpeech", None), \
         patch("brockston_core._get_router", None), \
         patch("brockston_core.get_perplexity_service", None), \
         patch("brockston_core._crisis_detector", None), \
         patch("brockston_core.EVERETT_PROFILE", None):

        from brockston_core import BrockstonBrain
        brain = BrockstonBrain(memory_file=memory_path)
        prompt = brain._build_system_prompt()

    assert "BROCKSTON" in prompt, (
        "Default system prompt (no EVERETT_PROFILE) must contain 'BROCKSTON' — "
        f"got: {prompt!r}"
    )
