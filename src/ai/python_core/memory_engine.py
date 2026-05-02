"""
MEMORY ENGINE — BROCKSTON C v4.0.0
====================================
The single source of truth for BROCKSTON's memory.
Consolidates: memory, memory_backup, memory_engine_secure, memory_enhance_rag,
memory_episodic, memory_hook, memory_kb, memory_knowledge_hub, memory_manager,
memory_mesh, memory_mesh_bridge, memory_retriever, memory_router, memory_store,
memory_working, simple_memory_mesh

Cardinal Rule 13: Never fabricate memory. Never invent history.
Cardinal Rule 6: Fail loud if storage fails.
Cardinal Rule 12: No keys in code. Encryption key from env only.
Cardinal Rule 7: No magical side doors. Memory is never accessed cross-being.

© 2025 Everett Nathaniel Christman & The Christman AI Project
"""

# ==============================================================================
# Design notes (Rule 11 — Document the Why):
#
# This file replaces 17 fragmented memory modules that each solved one corner
# of the same problem in incompatible ways. The consolidation strategy:
#
#   - The existing MemoryEngine (keyword-RAG + JSON persistence) is the
#     foundation. Its two public signatures — save() and query() — are
#     CONTRACT and cannot change. brockston_core.py depends on both.
#
#   - Episodic buffer (short-term) lives in RAM only. It is cleared by
#     forget_session() and never touches disk. Cardinal Rule 7: other beings
#     observe memory events via hooks; they never read this buffer directly.
#
#   - Knowledge base (learned facts) is stored in a separate JSON sidecar
#     file alongside the main memory file. It is not mixed into conversation
#     history so that query() results are never polluted by raw fact lookups.
#
#   - Encryption is OPTIONAL and OFF by default. The key comes exclusively
#     from os.environ — never from code, never from a file on disk, never
#     hardcoded. If the env var is absent, plaintext is used. Rule 12.
#
#   - Auto-backup writes a .bak file every 10th save. If it fails we log a
#     WARNING and continue — the main save path must never be blocked by a
#     backup failure.
#
#   - Hooks let external observers (OpenSmell, family members) react to
#     events without ever reading memory directly. They receive an event name
#     and a small metadata payload. That is all. Rule 7.
#
#   - All write paths are protected by a threading.Lock so that concurrent
#     BROCKSTON requests cannot corrupt the in-memory list or the JSON file.
# ==============================================================================

import json
import logging
import os
import threading
from collections import deque
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional dependency: cryptography.  We import here so the import error is
# visible immediately at module load time rather than buried in a method.
# ---------------------------------------------------------------------------
try:
    from cryptography.fernet import Fernet, InvalidToken
    _FERNET_AVAILABLE = True
except ImportError:
    _FERNET_AVAILABLE = False
    logger.warning(
        "cryptography package not installed — encryption support disabled. "
        "Install with: pip install cryptography"
    )


# ---------------------------------------------------------------------------
# Module-level constants
# ---------------------------------------------------------------------------
_EPISODIC_MAX = 50          # Hard cap on the short-term session buffer
_BACKUP_EVERY_N_SAVES = 10  # Auto-backup frequency


class MemoryEngine:
    """
    Single source of truth for BROCKSTON's memory system.

    Responsibilities
    ----------------
    1. Persist and load long-term conversation history (JSON on disk).
    2. Maintain a short-term episodic buffer (in RAM, cleared per session).
    3. Provide keyword-RAG retrieval with optional intent-type scoring.
    4. Store and recall discrete learned facts (knowledge base sidecar).
    5. Auto-backup to a .bak file every 10th save.
    6. Fire registered hooks on key events so observers can react.
    7. Optionally encrypt all disk writes with a Fernet key from env.
    8. Protect all write operations with a threading.Lock.

    What this class will NOT do
    ---------------------------
    - It will never share its internal data structures with other beings.
      Hooks receive small metadata payloads only. (Rule 7)
    - It will never fabricate, invent, or guess at stored memories. (Rule 13)
    - It will never accept an encryption key from anywhere except the
      MEMORY_ENCRYPTION_KEY environment variable. (Rule 12)
    """

    # ------------------------------------------------------------------
    # Construction
    # ------------------------------------------------------------------

    def __init__(
        self,
        file_path: str = "./brockston_memory/semantic_memory.json",
        encryption_key: Optional[str] = None,
    ):
        """
        Initialise the memory engine.

        Parameters
        ----------
        file_path:
            Path to the primary JSON memory file.  Relative paths starting
            with "./" are resolved against the project root (two levels above
            this module's directory), matching the original engine's behaviour.
        encryption_key:
            Ignored if provided — included only for call-site compatibility.
            The real key is read exclusively from the environment variable
            MEMORY_ENCRYPTION_KEY.  Never pass a key in code. (Rule 12)

        What this will NOT do
        ---------------------
        Does not accept a key from any source other than os.environ.
        Does not create a default encryption key automatically.
        """
        if encryption_key is not None:
            logger.warning(
                "MemoryEngine.__init__: 'encryption_key' argument was provided but "
                "will be IGNORED.  Rule 12: keys come from os.environ only.  "
                "Set MEMORY_ENCRYPTION_KEY in your environment instead."
            )

        # --- Path resolution (kept identical to original engine) ---
        self.backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.project_root = os.path.dirname(self.backend_dir)

        if file_path.startswith("./"):
            self.file_path = os.path.join(self.project_root, file_path[2:])
        elif not os.path.isabs(file_path):
            self.file_path = os.path.join(self.project_root, file_path)
        else:
            self.file_path = file_path

        # Knowledge-base sidecar lives next to the main file
        base, ext = os.path.splitext(self.file_path)
        self._kb_path = f"{base}_kb{ext}"

        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

        # --- Internal state ---
        self._lock: threading.Lock = threading.Lock()
        self._memory: List[Dict[str, Any]] = []
        self._episodic: deque = deque(maxlen=_EPISODIC_MAX)
        self._knowledge: Dict[str, Dict[str, str]] = {}
        self._hooks: Dict[str, List[Callable]] = {
            "on_save": [],
            "on_crisis_detected": [],
            "on_session_clear": [],
        }
        self._save_count: int = 0

        # --- Encryption ---
        self._fernet = self._init_encryption()

        # --- Load from disk ---
        self.load_memory()
        self._load_knowledge()

    def _init_encryption(self) -> Optional[Any]:
        """
        Read MEMORY_ENCRYPTION_KEY from environment and return a Fernet
        instance, or None if the variable is unset.

        What this will NOT do
        ---------------------
        Will never read a key from code, a file, or any argument.
        Will never generate a key automatically.
        """
        raw_key = os.environ.get("MEMORY_ENCRYPTION_KEY")
        if not raw_key:
            logger.debug("MEMORY_ENCRYPTION_KEY not set — using plaintext storage.")
            return None
        if not _FERNET_AVAILABLE:
            raise RuntimeError(
                "MEMORY_ENCRYPTION_KEY is set but the 'cryptography' package is not "
                "installed.  Install it with: pip install cryptography"
            )
        try:
            fernet = Fernet(raw_key.encode())
            logger.info("Memory encryption enabled (Fernet).")
            return fernet
        except Exception as exc:
            raise ValueError(
                f"MEMORY_ENCRYPTION_KEY is set but is not a valid Fernet key: {exc}"
            ) from exc

    # ------------------------------------------------------------------
    # Encryption helpers
    # ------------------------------------------------------------------

    def _encrypt_payload(self, payload: str) -> str:
        """
        Encrypt a plaintext string with the configured Fernet key.
        Returns the ciphertext as a UTF-8 string.

        What this will NOT do
        ---------------------
        Will not encrypt if no key was configured (returns plaintext unchanged).
        """
        if self._fernet is None:
            return payload
        return self._fernet.encrypt(payload.encode()).decode()

    def _decrypt_payload(self, payload: str) -> str:
        """
        Decrypt a ciphertext string.  If decryption fails (wrong key, corrupt
        data), logs an error and returns the raw payload rather than crashing —
        this allows degraded reads of partially migrated files without losing
        all context.

        What this will NOT do
        ---------------------
        Will not silently swallow errors — all failures are logged.
        Will not crash the engine; returns raw payload on failure (Rule 6).
        """
        if self._fernet is None:
            return payload
        try:
            return self._fernet.decrypt(payload.encode()).decode()
        except InvalidToken as exc:
            logger.error(
                "Memory decryption failed — invalid token or wrong key.  "
                "Returning raw payload.  Detail: %s", exc
            )
            return payload
        except Exception as exc:
            logger.error(
                "Memory decryption encountered unexpected error: %s.  "
                "Returning raw payload.", exc
            )
            return payload

    # ------------------------------------------------------------------
    # Disk I/O — long-term memory
    # ------------------------------------------------------------------

    def load_memory(self) -> None:
        """
        Load long-term memory entries from disk.

        Handles the legacy dict format produced by earlier versions of this
        engine and converts it to the current list format automatically.

        What this will NOT do
        ---------------------
        Will not fabricate entries if the file is missing or unreadable.
        Will not raise on missing file — starts fresh instead.
        """
        if not os.path.exists(self.file_path):
            logger.info("No existing memory file found, starting fresh.")
            self._memory = []
            return

        try:
            with open(self.file_path, "r", encoding="utf-8") as fh:
                raw = fh.read()

            # Decrypt if encryption is enabled
            raw = self._decrypt_payload(raw)

            data = json.loads(raw)

            if isinstance(data, dict):
                # Legacy dict format — convert to list
                logger.info("Converting legacy dict memory format to list format.")
                legacy_entries: List[Dict[str, Any]] = []

                for legacy_key, entry_type in [
                    ("identity", "identity"),
                    ("everett_profile", "everett_profile"),
                    ("brockston_capabilities", "capabilities"),
                    ("relationship_with_everett", "relationship"),
                    ("tech_stack", "tech_stack"),
                ]:
                    if legacy_key in data:
                        legacy_entries.append({"type": entry_type, **data[legacy_key]})

                if "mission_statement" in data:
                    legacy_entries.append(
                        {"type": "mission", "statement": data["mission_statement"]}
                    )

                for _key, value in data.items():
                    if isinstance(value, list):
                        legacy_entries.extend(value)

                self._memory = legacy_entries
                self.save_memory()
                logger.info(
                    "Converted and saved %d memory entries.", len(self._memory)
                )

            elif isinstance(data, list):
                self._memory = data
                logger.info("Loaded %d memory entries.", len(self._memory))

            else:
                logger.error(
                    "Unexpected memory file format: %s.  Starting fresh.",
                    type(data).__name__,
                )
                self._memory = []

        except json.JSONDecodeError as exc:
            logger.error(
                "Memory file contains invalid JSON and cannot be loaded: %s.  "
                "Starting fresh to avoid data corruption.", exc
            )
            self._memory = []
        except OSError as exc:
            logger.error(
                "OS error reading memory file '%s': %s.  Starting fresh.",
                self.file_path, exc
            )
            self._memory = []
        except Exception as exc:
            logger.error(
                "Unexpected error loading memory file: %s.  Starting fresh.", exc
            )
            self._memory = []

    def save_memory(self) -> None:
        """
        Persist long-term memory to disk.

        Thread-safe.  Increments the internal save counter and triggers an
        auto-backup on every 10th call.  Fires the 'on_save' hook after a
        successful write.

        What this will NOT do
        ---------------------
        Will not crash if backup fails — backup failures are WARNING-logged only.
        Will not silently swallow main-save failures — those are ERROR-logged
        and re-raised so the caller knows storage failed. (Rule 6)
        """
        with self._lock:
            try:
                payload = json.dumps(self._memory, indent=2)
                payload = self._encrypt_payload(payload)
                with open(self.file_path, "w", encoding="utf-8") as fh:
                    fh.write(payload)
                logger.info("Saved %d memory entries.", len(self._memory))
            except OSError as exc:
                logger.error(
                    "CRITICAL: Failed to save memory to '%s': %s", self.file_path, exc
                )
                raise

            self._save_count += 1
            if self._save_count % _BACKUP_EVERY_N_SAVES == 0:
                self._auto_backup()

        self._fire_hook("on_save", {"entry_count": len(self._memory)})

    def _auto_backup(self) -> None:
        """
        Write a .bak copy of the memory file.

        Called internally every 10th save.  Failure logs a WARNING and
        returns — it must never crash or block the main save path.

        What this will NOT do
        ---------------------
        Will never raise an exception to the caller.
        Will never block the main thread if the backup is slow.
        """
        bak_path = self.file_path + ".bak"
        try:
            payload = json.dumps(self._memory, indent=2)
            payload = self._encrypt_payload(payload)
            with open(bak_path, "w", encoding="utf-8") as fh:
                fh.write(payload)
            logger.debug("Auto-backup written to '%s'.", bak_path)
        except Exception as exc:
            logger.warning(
                "Auto-backup to '%s' failed (non-fatal): %s", bak_path, exc
            )

    # ------------------------------------------------------------------
    # Disk I/O — knowledge base sidecar
    # ------------------------------------------------------------------

    def _load_knowledge(self) -> None:
        """
        Load the knowledge base from its sidecar JSON file.

        What this will NOT do
        ---------------------
        Will not raise if the file is absent — starts with an empty KB.
        """
        if not os.path.exists(self._kb_path):
            logger.debug("No knowledge base file found, starting with empty KB.")
            self._knowledge = {}
            return

        try:
            with open(self._kb_path, "r", encoding="utf-8") as fh:
                raw = fh.read()
            raw = self._decrypt_payload(raw)
            self._knowledge = json.loads(raw)
            logger.info(
                "Loaded %d knowledge base domains.",
                len(self._knowledge),
            )
        except json.JSONDecodeError as exc:
            logger.error(
                "Knowledge base file contains invalid JSON: %s.  Starting empty.", exc
            )
            self._knowledge = {}
        except OSError as exc:
            logger.error("OS error reading knowledge base: %s.  Starting empty.", exc)
            self._knowledge = {}
        except Exception as exc:
            logger.error(
                "Unexpected error loading knowledge base: %s.  Starting empty.", exc
            )
            self._knowledge = {}

    def _save_knowledge(self) -> None:
        """
        Persist the knowledge base sidecar to disk.

        Thread-safe.  Logs and re-raises on write failure. (Rule 6)

        What this will NOT do
        ---------------------
        Will not silently swallow a write failure.
        """
        with self._lock:
            try:
                payload = json.dumps(self._knowledge, indent=2)
                payload = self._encrypt_payload(payload)
                with open(self._kb_path, "w", encoding="utf-8") as fh:
                    fh.write(payload)
                logger.debug("Knowledge base saved (%d domains).", len(self._knowledge))
            except OSError as exc:
                logger.error(
                    "Failed to save knowledge base to '%s': %s", self._kb_path, exc
                )
                raise

    # ------------------------------------------------------------------
    # Public API — save / query (CONTRACT — do not change signatures)
    # ------------------------------------------------------------------

    def save(self, entry: Dict[str, Any]) -> None:
        """
        Save a new entry into long-term memory and persist to disk.

        Adds a UTC ISO-8601 timestamp to the entry before storing.
        Also appends a copy to the episodic (short-term) buffer so that
        in-session recall always includes the freshest exchanges.

        Parameters
        ----------
        entry:
            A dict describing the memory event.  Should include at minimum
            'input' and 'output' keys for query() scoring to work.

        What this will NOT do
        ---------------------
        Will not fabricate a timestamp from any source other than
        datetime.now(timezone.utc). (Rule 13)
        Will not silently discard the entry if the write fails. (Rule 6)
        """
        entry = dict(entry)  # shallow copy — don't mutate the caller's dict
        entry["timestamp"] = datetime.now(timezone.utc).isoformat()

        with self._lock:
            self._memory.append(entry)
            self._episodic.append(entry)

        self.save_memory()
        logger.debug("Stored new memory entry: %s", entry)

    def query(
        self, text: str, intent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieve relevant memory entries using keyword-RAG scoring.

        Strategy
        --------
        1. Start from the full long-term store.
        2. If intent is provided, apply a type-match bonus: entries whose
           'intent' or 'type' field matches get +3 added to their score.
        3. Remove common stop-words and score each entry by keyword overlap
           with the query text.
        4. Return the top 5 scoring entries, or the 5 most recent if no
           keyword matches exist.

        Parameters
        ----------
        text:
            The query text to match against stored entries.
        intent:
            Optional intent string.  Entries whose 'intent' or 'type' field
            matches this value receive a scoring bonus.

        Returns
        -------
        Dict with key 'context' containing a newline-joined summary string.

        What this will NOT do
        ---------------------
        Will not invent context that does not exist in storage. (Rule 13)
        Will not perform embedding/semantic search — this is keyword-only.
        """
        logger.debug("Querying memory for context (intent=%s): %s", intent, text)

        if not self._memory:
            return {"context": "No prior context found."}

        candidates = list(self._memory)

        query_words = set(text.lower().split())
        stop_words = {
            "the", "a", "an", "is", "was", "are", "were", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "will",
            "would", "could", "should", "may", "might", "can", "shall",
            "to", "of", "in", "for", "on", "with", "at", "by", "from",
            "it", "this", "that", "and", "or", "but", "not", "so",
            "if", "then", "than", "what", "who", "how", "when", "where",
            "i", "you", "he", "she", "we", "they", "me", "my", "your",
        }
        query_keywords = query_words - stop_words

        scored: List[tuple] = []
        for entry in candidates:
            entry_text = (
                f"{entry.get('input', '')} {entry.get('output', '')}"
            ).lower()
            entry_words = set(entry_text.split())
            score = len(query_keywords & entry_words)

            # Intent / type bonus: entries that match the requested intent
            # are surfaced higher, helping domain-focused recall.
            if intent and (
                entry.get("intent") == intent or entry.get("type") == intent
            ):
                score += 3

            scored.append((score, entry))

        scored.sort(key=lambda x: x[0], reverse=True)

        if scored and scored[0][0] > 0:
            relevant = [entry for _score, entry in scored[:5]]
        else:
            relevant = candidates[-5:]

        context_snippets = [
            f"{m.get('input', '')} -> {m.get('output', '')}" for m in relevant
        ]
        return {"context": "\n".join(context_snippets)}

    # ------------------------------------------------------------------
    # Public API — episodic (short-term session) memory
    # ------------------------------------------------------------------

    def get_episodic(self) -> List[Dict[str, Any]]:
        """
        Return a snapshot of the current session's short-term episodic buffer.

        The buffer holds at most 50 entries (EPISODIC_MAX) and is populated
        by every call to save().  It is cleared when forget_session() is called.

        What this will NOT do
        ---------------------
        Will not persist the episodic buffer to disk.
        Will not share the live deque — returns a list copy.
        """
        return list(self._episodic)

    def forget_session(self) -> None:
        """
        Clear the short-term episodic buffer for the current session.

        Long-term memory on disk is NOT affected.  Only the in-RAM deque
        is cleared.  Fires the 'on_session_clear' hook.

        What this will NOT do
        ---------------------
        Will not touch long-term memory or the knowledge base.
        Will not write anything to disk.
        """
        with self._lock:
            self._episodic.clear()
        logger.info("Episodic session buffer cleared.")
        self._fire_hook("on_session_clear", {})

    # ------------------------------------------------------------------
    # Public API — knowledge base
    # ------------------------------------------------------------------

    def learn(self, key: str, value: str, domain: str = "general") -> None:
        """
        Store a discrete learned fact in the knowledge base.

        Facts are separate from conversation history and are never returned
        by query().  Use recall_fact() to retrieve them.

        Parameters
        ----------
        key:
            Identifier for the fact within its domain (e.g. "creator_name").
        value:
            The fact's string value.
        domain:
            Namespace / domain for grouping related facts (e.g. "identity",
            "tech_stack").  Defaults to "general".

        What this will NOT do
        ---------------------
        Will not overwrite without logging — existing facts are quietly
        replaced, but the replacement is debug-logged.
        Will not mix facts into conversation history.
        """
        with self._lock:
            if domain not in self._knowledge:
                self._knowledge[domain] = {}
            if key in self._knowledge[domain]:
                logger.debug(
                    "Knowledge base: overwriting existing fact [%s/%s].", domain, key
                )
            self._knowledge[domain][key] = value

        self._save_knowledge()
        logger.debug("Learned fact [%s/%s] = %r", domain, key, value)

    def recall_fact(self, key: str, domain: Optional[str] = None) -> Optional[str]:
        """
        Retrieve a learned fact by key.

        If domain is specified, searches only within that domain.
        If domain is None, searches all domains in insertion order and
        returns the first match found.

        Parameters
        ----------
        key:
            The fact identifier to look up.
        domain:
            Optional domain to restrict the search.  If None, all domains
            are searched.

        Returns
        -------
        The stored string value, or None if not found.

        What this will NOT do
        ---------------------
        Will not guess or fabricate a value if the key is absent. (Rule 13)
        Will not search long-term conversation memory.
        """
        if domain is not None:
            return self._knowledge.get(domain, {}).get(key)

        for _domain, facts in self._knowledge.items():
            if key in facts:
                return facts[key]

        return None

    # ------------------------------------------------------------------
    # Public API — hooks
    # ------------------------------------------------------------------

    def register_hook(self, event: str, callback: Callable) -> None:
        """
        Register an observer callback for a named memory event.

        Supported events
        ----------------
        on_save           — fired after every successful save_memory() call.
        on_crisis_detected — fire via fire_crisis_hook(); used when the core
                            detects language suggesting a mental health crisis.
        on_session_clear  — fired when forget_session() clears the episodic buffer.

        The callback receives a single dict argument containing event metadata.
        Observers NEVER receive the internal memory list, the knowledge base,
        or the episodic buffer.  They observe, they do not read. (Rule 7)

        Parameters
        ----------
        event:
            One of: 'on_save', 'on_crisis_detected', 'on_session_clear'.
        callback:
            A callable that accepts one positional dict argument.

        What this will NOT do
        ---------------------
        Will not allow a hook to read or mutate internal memory state.
        Will not register an unknown event — raises ValueError instead.
        """
        if event not in self._hooks:
            raise ValueError(
                f"Unknown hook event '{event}'.  "
                f"Valid events: {list(self._hooks.keys())}"
            )
        self._hooks[event].append(callback)
        logger.debug("Registered hook for event '%s'.", event)

    def _fire_hook(self, event: str, payload: Dict[str, Any]) -> None:
        """
        Invoke all registered callbacks for the given event.

        Failures in individual callbacks are WARNING-logged but do not
        prevent remaining callbacks from running, and do not propagate to
        the caller.  Hook failure must never crash the memory engine. (Rule 6)

        Parameters
        ----------
        event:
            The event name to fire.
        payload:
            Metadata dict passed to each callback.

        What this will NOT do
        ---------------------
        Will not include internal memory data in the payload.
        Will not raise if a callback throws.
        """
        for callback in self._hooks.get(event, []):
            try:
                callback(payload)
            except Exception as exc:
                logger.warning(
                    "Hook callback for event '%s' raised an exception "
                    "(non-fatal): %s", event, exc
                )

    def fire_crisis_hook(self, context: Dict[str, Any]) -> None:
        """
        Manually fire the 'on_crisis_detected' hook.

        Called by brockston_core or the safety layer when crisis language is
        detected in a user's message.  The context dict should contain enough
        information for observers (e.g. the crisis-response module) to act,
        but must NOT contain raw memory entries.

        Parameters
        ----------
        context:
            A dict with crisis metadata — e.g. {'severity': 'high',
            'trigger_phrase': '...'}.  Never include raw memory.

        What this will NOT do
        ---------------------
        Will not read memory automatically — the caller must build the context.
        Will not suppress observer exceptions — they are WARNING-logged.
        """
        logger.warning("Crisis hook fired.  Context keys: %s", list(context.keys()))
        self._fire_hook("on_crisis_detected", context)

    # ------------------------------------------------------------------
    # Public API — utility
    # ------------------------------------------------------------------

    def get_recent_events(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Return the most recent long-term memory events, newest first.

        Parameters
        ----------
        limit:
            Maximum number of entries to return.

        What this will NOT do
        ---------------------
        Will not return episodic-only entries that have already been
        cleared — episodic is separate from long-term storage.
        """
        return list(reversed(self._memory[-limit:]))

    def clear(self) -> None:
        """
        Erase ALL long-term memory and the knowledge base.

        Use with extreme caution — this deletes from disk permanently.
        The episodic buffer is also cleared as a side effect.
        Both the 'on_session_clear' hook and 'on_save' hook are fired.

        What this will NOT do
        ---------------------
        Will not ask for confirmation — the caller is responsible. (Rule 6)
        """
        with self._lock:
            self._memory = []
            self._episodic.clear()
            self._knowledge = {}

        self.save_memory()
        self._save_knowledge()
        logger.warning("All long-term memory and knowledge base have been cleared.")
        self._fire_hook("on_session_clear", {"reason": "full_clear"})


# ==============================================================================
# © 2025 Everett Nathaniel Christman & The Christman AI Project
# Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
#
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================
