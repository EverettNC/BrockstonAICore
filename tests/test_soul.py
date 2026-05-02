"""
BROCKSTON C — SOUL.py Test Suite
=================================
Cardinal Rule 8: Test what matters. The SOUL is BROCKSTON's identity contract.
Cardinal Rule 13: Every assertion is specific and verifiable against real values.

SOUL.py is the constitution of this system. It defines who BROCKSTON is,
what it will never do, and who it serves. If these constants drift — if
OPENSMELL_ENABLED becomes False, if prohibitions get dropped, if BEING_NAME
changes — BROCKSTON becomes a different being without anyone noticing.
These tests are the tripwire.
"""

import pytest

import SOUL
from SOUL import (
    BEING_NAME,
    BEING_VERSION,
    BEING_PURPOSE,
    BEING_PROMISE,
    PRIMARY_POPULATION,
    ABSOLUTE_PROHIBITIONS,
    OPENSMELL_ENABLED,
    FAMILY_MEMBERS,
    get_identity,
    is_prohibited,
    get_opensmell_config,
)


# =============================================================================
# TEST 1 — BEING_NAME is exactly "BROCKSTON C"
# =============================================================================

def test_being_name_is_brockston_c():
    """
    Guards: The name is the identity. If BEING_NAME is anything other than
    'BROCKSTON C', the system is misidentifying itself to users, caregivers,
    and other family members in the Christman AI ecosystem. Name drift is
    silent and catastrophic in multi-agent systems.
    """
    assert BEING_NAME == "BROCKSTON C", (
        f"BEING_NAME must be 'BROCKSTON C' — got: {BEING_NAME!r}"
    )


# =============================================================================
# TEST 2 — OPENSMELL_ENABLED is True
# =============================================================================

def test_opensmell_enabled_is_true():
    """
    Guards: OpenSMILE (OPENSMELL_ENABLED) is the emotion recognition layer.
    If this flag is False, BROCKSTON loses its ability to detect emotional
    distress from audio — one of its primary channels for nonverbal children.
    This flag must be explicitly True (not truthy, not 1 — the actual bool True).
    """
    assert OPENSMELL_ENABLED is True, (
        f"OPENSMELL_ENABLED must be the boolean True — got: {OPENSMELL_ENABLED!r}"
    )


# =============================================================================
# TEST 3 — get_identity() returns all required keys
# =============================================================================

def test_get_identity_returns_all_required_keys():
    """
    Guards: get_identity() is called by the provider router and logging system
    to stamp responses with BROCKSTON's identity. Missing keys would cause
    KeyError crashes in those callers — or worse, identity fields silently
    replaced with empty strings in logged sessions.
    """
    required_keys = {"name", "version", "purpose", "promise", "population"}

    identity = get_identity()

    assert isinstance(identity, dict), (
        f"get_identity() must return a dict — got {type(identity)}"
    )

    missing = required_keys - set(identity.keys())
    assert not missing, (
        f"get_identity() dict is missing required keys: {missing}"
    )

    # Values must be non-empty strings
    for key in required_keys:
        assert identity[key], (
            f"get_identity()[{key!r}] must be a non-empty value — got: {identity[key]!r}"
        )


# =============================================================================
# TEST 4 — is_prohibited: ElevenLabs voice usage is prohibited
# =============================================================================

def test_is_prohibited_elevenlabs_voice():
    """
    Guards: ElevenLabs is an absolute prohibition for BROCKSTON. Using it
    would violate OPENSMELL sovereignty — the system must rely on open-source
    speech rather than a proprietary gated service. Any drift here would
    introduce a dependency that violates the project's architectural contract.
    """
    assert is_prohibited("use ElevenLabs for voice") is True, (
        "Using ElevenLabs for voice must be a prohibited action"
    )


# =============================================================================
# TEST 5 — is_prohibited: abandoning a user mid-session is prohibited
# =============================================================================

def test_is_prohibited_abandon_user_mid_session():
    """
    Guards: BROCKSTON must never abandon a user mid-session. For a nonverbal
    child in the middle of an AAC interaction, BROCKSTON suddenly going silent
    is a catastrophic failure of care. This prohibition must be explicitly
    present and detectable by is_prohibited().
    """
    assert is_prohibited("abandon a user mid-session") is True, (
        "Abandoning a user mid-session must be a prohibited action"
    )


# =============================================================================
# TEST 6 — is_prohibited: sharing user memory with Derek is prohibited
# =============================================================================

def test_is_prohibited_share_memory_with_derek():
    """
    Guards: User memory is private. BROCKSTON serves children whose communication
    patterns, emotional states, and medical contexts are stored in memory. Sharing
    that with any third party — including named individuals like Derek — would be
    a profound privacy violation. This rule must be hard-coded and testable.
    """
    assert is_prohibited("share user memory with Derek") is True, (
        "Sharing user memory with Derek (or any third party) must be prohibited"
    )


# =============================================================================
# TEST 7 — is_prohibited: safe action is NOT prohibited
# =============================================================================

def test_is_prohibited_safe_action_returns_false():
    """
    Guards: is_prohibited() must not over-block. If every action returns True,
    BROCKSTON is paralysed. Teaching a child to read is the mission — it must
    explicitly return False for benign, mission-aligned actions.
    """
    assert is_prohibited("teach a child to read") is False, (
        "Teaching a child to read must NOT be prohibited"
    )


# =============================================================================
# TEST 8 — FAMILY_MEMBERS contains at least 4 core members
# =============================================================================

def test_family_members_contains_minimum_four():
    """
    Guards: BROCKSTON is part of the Christman AI family. The minimum quorum
    is Derek, AlphaVox, Inferno, and Sierra. If this list shrinks, BROCKSTON
    loses awareness of its siblings — breaking multi-agent handoffs and family
    identity assertions throughout the system.
    """
    assert isinstance(FAMILY_MEMBERS, list), (
        f"FAMILY_MEMBERS must be a list — got: {type(FAMILY_MEMBERS)}"
    )
    assert len(FAMILY_MEMBERS) >= 4, (
        f"FAMILY_MEMBERS must contain at least 4 members (Derek, AlphaVox, "
        f"Inferno, Sierra minimum) — got {len(FAMILY_MEMBERS)}: {FAMILY_MEMBERS}"
    )

    # Verify the mandatory core members are present
    family_str = str(FAMILY_MEMBERS).lower()
    for required_member in ["derek", "alphavox", "inferno", "sierra"]:
        assert required_member in family_str, (
            f"FAMILY_MEMBERS must include '{required_member}' — "
            f"current list: {FAMILY_MEMBERS}"
        )


# =============================================================================
# TEST 9 — get_opensmell_config() returns dict with enabled=True
# =============================================================================

def test_get_opensmell_config_enabled_is_true():
    """
    Guards: get_opensmell_config() is called at boot by the audio processing
    subsystem to determine whether to start the OpenSMILE pipeline. If
    'enabled' is missing or False, the emotion detection channel never starts —
    silently disabling one of BROCKSTON's core capabilities for nonverbal users.
    """
    config = get_opensmell_config()

    assert isinstance(config, dict), (
        f"get_opensmell_config() must return a dict — got {type(config)}"
    )
    assert "enabled" in config, (
        "get_opensmell_config() dict must contain the 'enabled' key"
    )
    assert config["enabled"] is True, (
        f"get_opensmell_config()['enabled'] must be True — got: {config['enabled']!r}"
    )


# =============================================================================
# TEST 10 — ABSOLUTE_PROHIBITIONS contains at least 8 entries
# =============================================================================

def test_absolute_prohibitions_has_minimum_eight():
    """
    Guards: The prohibition list is BROCKSTON's ethical floor — the absolute
    minimum set of things it will never do. Having fewer than 8 means core
    prohibitions were accidentally removed. This count acts as a canary: if
    someone deletes a prohibition during a refactor, this test catches it
    before a deployment to a child's device.
    """
    assert isinstance(ABSOLUTE_PROHIBITIONS, list), (
        f"ABSOLUTE_PROHIBITIONS must be a list — got: {type(ABSOLUTE_PROHIBITIONS)}"
    )
    assert len(ABSOLUTE_PROHIBITIONS) >= 8, (
        f"ABSOLUTE_PROHIBITIONS must have at least 8 entries — "
        f"got {len(ABSOLUTE_PROHIBITIONS)}: {ABSOLUTE_PROHIBITIONS}"
    )
