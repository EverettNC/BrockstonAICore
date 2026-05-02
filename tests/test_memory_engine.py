"""
BROCKSTON C — Memory Engine Test Suite
=======================================
Cardinal Rule 8: Test what matters — memory paths are sacred.
Cardinal Rule 13: Every assertion checks a real, observable outcome.

Memory is how BROCKSTON knows who it is talking to and what was said before.
A broken memory engine means BROCKSTON starts fresh every interaction, losing
continuity with nonverbal children who depend on learned communication patterns.
These tests guard correctness, durability, and thread safety of all memory paths.
"""

import json
import os
import tempfile
import threading
import pytest

from memory_engine import MemoryEngine


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def tmp_memory_file():
    """
    Provide an absolute path to a temp memory file that does not yet exist.
    Using an absolute path bypasses MemoryEngine's relative-path resolution
    logic so tests run predictably regardless of working directory.
    """
    tmp_dir = tempfile.mkdtemp()
    return os.path.join(tmp_dir, "test_memory.json")


@pytest.fixture
def engine(tmp_memory_file):
    """A fresh MemoryEngine backed by a temp file for each test."""
    return MemoryEngine(file_path=tmp_memory_file)


# =============================================================================
# TEST 1 — save() and query(): saved entry appears in context
# =============================================================================

def test_save_and_query_returns_entry(engine):
    """
    Guards: The fundamental read-after-write contract. If save() and query()
    don't work together, BROCKSTON has no memory whatsoever — every conversation
    starts from zero, which is devastating for nonverbal children who rely on
    BROCKSTON knowing their established AAC vocabulary and patterns.
    """
    engine.save({"input": "photosynthesis explanation", "output": "plants make food from sunlight", "intent": "general"})

    result = engine.query("photosynthesis")

    assert "photosynthesis" in result["context"], (
        "A query with 'photosynthesis' must return the entry containing that word"
    )
    assert "plants make food from sunlight" in result["context"], (
        "The output side of the saved entry must appear in the retrieved context"
    )


# =============================================================================
# TEST 2 — Empty memory query: returns sentinel, does not crash
# =============================================================================

def test_empty_memory_returns_no_prior_context(engine):
    """
    Guards: A fresh instance with no saved entries must return the exact sentinel
    string 'No prior context found.' — not an empty string, not None, not a crash.
    This sentinel is used by callers to detect empty memory; any variation would
    break downstream logic that checks for it.
    """
    result = engine.query("anything at all")

    assert result["context"] == "No prior context found.", (
        f"Empty memory must return sentinel string — got: {repr(result['context'])}"
    )


# =============================================================================
# TEST 3 — Legacy dict format migration: loads without crash, converts to list
# =============================================================================

def test_legacy_dict_format_migration(tmp_memory_file):
    """
    Guards: Early BROCKSTON deployments saved memory as a dict. When those
    devices upgrade to this version, the engine must silently migrate the old
    format to the new list format rather than crashing or discarding data.
    A crash here would wipe Brockston's entire memory on first boot — losing
    months of learned patterns for a child's communication profile.
    """
    legacy_data = {
        "identity": {"name": "BROCKSTON", "version": "1.0"},
        "mission_statement": "Help every child communicate.",
    }
    # Pre-write the legacy file
    os.makedirs(os.path.dirname(tmp_memory_file), exist_ok=True)
    with open(tmp_memory_file, "w") as f:
        json.dump(legacy_data, f)

    # MemoryEngine must load without exception
    me = MemoryEngine(file_path=tmp_memory_file)

    # Internal memory must now be a list (not a dict)
    assert isinstance(me._memory, list), (
        "After migration, internal _memory must be a list — got: "
        f"{type(me._memory)}"
    )

    # The migrated file on disk must also be a list
    with open(tmp_memory_file) as f:
        on_disk = json.load(f)
    assert isinstance(on_disk, list), (
        "Migrated memory file must be saved as a list on disk"
    )


# =============================================================================
# TEST 4 — Intent bonus: intent-matched entry ranks first in results
# =============================================================================

def test_intent_bonus_ranks_matching_entry_first(engine):
    """
    Guards: BROCKSTON's query() applies a +3 score bonus to entries whose
    'intent' or 'type' field matches the requested intent. This ensures that
    AAC vocabulary entries surface before general-knowledge entries when
    querying with intent='aac_vocab'. The intent system is a scoring boost,
    not a hard filter — but the boost must be strong enough to guarantee the
    domain-correct entry ranks first in the result.

    For nonverbal children, the first line of context seen by the LLM shapes
    the entire response. A misfiring intent bonus would cause BROCKSTON to
    lead with irrelevant general knowledge rather than the child's AAC vocab.
    """
    engine.save({"input": "how do I say hello", "output": "tap the wave symbol", "intent": "aac_vocab"})
    engine.save({"input": "what is calculus", "output": "a branch of mathematics", "intent": "general_knowledge"})

    result = engine.query("hello", intent="aac_vocab")

    assert "wave symbol" in result["context"], (
        "Intent-boosted query for 'aac_vocab' must return the AAC entry"
    )

    context_lines = [l for l in result["context"].split("\n") if l.strip()]
    assert len(context_lines) >= 1, "Query must return at least one result line"
    assert "wave symbol" in context_lines[0], (
        "The intent-matched AAC entry must rank first (score boost of +3 ensures this) — "
        f"first line was: {context_lines[0]!r}"
    )


# =============================================================================
# TEST 5 — Top-5 cap: query returns no more than 5 results
# =============================================================================

def test_query_caps_results_at_five(engine):
    """
    Guards: The system prompt for LLM calls has a context window budget. If
    query() returns 20 entries instead of 5, the prompt may exceed token limits,
    causing truncation or API errors. For a device serving a nonverbal child in
    a real-time session, an API error means BROCKSTON goes silent mid-interaction.
    """
    for i in range(20):
        engine.save({
            "input": f"aac word number {i}",
            "output": f"symbol for item {i}",
            "intent": "aac_vocab",
        })

    result = engine.query("aac word symbol")

    # Count how many entries came back by splitting on newlines
    context_lines = [line for line in result["context"].split("\n") if line.strip()]
    assert len(context_lines) <= 5, (
        f"query() must return at most 5 results, but returned {len(context_lines)}"
    )


# =============================================================================
# TEST 6 — get_recent_events(limit=3): returns exactly 3 most recent
# =============================================================================

def test_get_recent_events_returns_correct_count(engine):
    """
    Guards: The session-log view in BROCKSTON's frontend calls get_recent_events()
    to show a caregiver the last few interactions. If the limit is not honoured,
    the view becomes unreadable. If the order is wrong, the caregiver sees
    old interactions instead of the most recent ones.
    """
    for i in range(15):
        engine.save({"input": f"input {i}", "output": f"output {i}"})

    recent = engine.get_recent_events(limit=3)

    assert len(recent) == 3, (
        f"get_recent_events(limit=3) must return exactly 3 entries — got {len(recent)}"
    )
    # Most recent entry was saved last (i=14), so it should appear first
    assert "input 14" in recent[0]["input"], (
        "get_recent_events must return entries in reverse-chronological order; "
        f"most recent entry expected first — got: {recent[0]}"
    )


# =============================================================================
# TEST 7 — clear(): post-clear query returns empty context sentinel
# =============================================================================

def test_clear_wipes_all_memory(engine):
    """
    Guards: clear() is a caregiver-initiated operation to reset BROCKSTON for
    a new user or a privacy wipe. After calling it, query() must behave as if
    the engine was just initialized. If entries survive a clear(), private
    communication data from one child could leak into another child's session.
    """
    engine.save({"input": "private communication pattern", "output": "custom symbol response"})

    # Confirm it's there first
    pre_clear = engine.query("private")
    assert "private" in pre_clear["context"], (
        "Pre-condition: saved entry must be retrievable before clear()"
    )

    engine.clear()

    post_clear = engine.query("private")
    assert post_clear["context"] == "No prior context found.", (
        "After clear(), query must return sentinel — found residual data: "
        f"{repr(post_clear['context'])}"
    )


# =============================================================================
# TEST 8 — File persistence: new instance loads previous entries
# =============================================================================

def test_file_persistence_across_instances(tmp_memory_file):
    """
    Guards: Memory must survive process restarts. BROCKSTON reboots nightly on
    deployed devices; all learned communication patterns for the child must
    persist. If they don't, the device is useless as a learning assistant.
    """
    engine_a = MemoryEngine(file_path=tmp_memory_file)
    engine_a.save({"input": "the child's favourite AAC phrase", "output": "tap the sun to say hello"})

    # Simulate a restart by creating a completely new instance from the same file
    engine_b = MemoryEngine(file_path=tmp_memory_file)

    result = engine_b.query("favourite AAC phrase")

    assert "sun" in result["context"], (
        "A second MemoryEngine instance must load entries saved by the first instance"
    )


# =============================================================================
# TEST 9 — Keyword relevance scoring: correct entry ranks first
# =============================================================================

def test_keyword_relevance_ranks_correct_entry_first(engine):
    """
    Guards: When BROCKSTON retrieves context for an LLM call, the most relevant
    prior conversation should rank first so it occupies the most prominent
    position in the prompt. Broken scoring would send the wrong context, causing
    BROCKSTON to give a response relevant to yesterday's topic, not today's.
    """
    engine.save({"input": "photosynthesis converts sunlight to energy", "output": "correct — chlorophyll does this"})
    engine.save({"input": "multiplication tables drill", "output": "7 times 8 is 56"})

    result = engine.query("photosynthesis sunlight")

    context_lines = result["context"].split("\n")
    assert len(context_lines) >= 1, "Must return at least one result"
    # The photosynthesis entry must be the first (highest-ranked) result
    assert "photosynthesis" in context_lines[0], (
        "Entry with matching keywords (photosynthesis, sunlight) must rank above "
        f"the unrelated maths entry — first line was: {context_lines[0]!r}"
    )


# =============================================================================
# TEST 10 — Thread safety: 10 concurrent saves, all 10 entries persist
# =============================================================================

def test_thread_safety_concurrent_saves(tmp_memory_file):
    """
    Guards: BROCKSTON processes input from multiple subsystems simultaneously —
    gesture recogniser, voice input, and AAC button presses can all call save()
    within milliseconds of each other. If save() is not thread-safe, entries
    get lost or the JSON file gets corrupted, potentially wiping session data
    mid-conversation.
    """
    engine = MemoryEngine(file_path=tmp_memory_file)
    errors = []

    def save_entry(index):
        try:
            engine.save({"input": f"concurrent input {index}", "output": f"concurrent output {index}"})
        except Exception as exc:
            errors.append(exc)

    threads = [threading.Thread(target=save_entry, args=(i,)) for i in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert not errors, (
        f"Thread-concurrent saves raised exceptions: {errors}"
    )

    # Reload from disk to verify all 10 entries were actually persisted
    reloaded = MemoryEngine(file_path=tmp_memory_file)
    saved_inputs = [entry.get("input", "") for entry in reloaded._memory]

    for i in range(10):
        expected_input = f"concurrent input {i}"
        assert any(expected_input in inp for inp in saved_inputs), (
            f"Entry 'concurrent input {i}' is missing after 10 concurrent saves — "
            "data corruption detected"
        )
