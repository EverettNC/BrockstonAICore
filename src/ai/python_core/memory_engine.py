# memory_engine.py
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class MemoryEngine:
    """Handles memory persistence, retrieval, and contextual queries."""

    def __init__(self, file_path: str = "./brockston_memory/semantic_memory.json"):
        # Resolve absolute path relative to project root (e.g., /Users/.../BROCKSTON)
        self.backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.project_root = os.path.dirname(self.backend_dir)
        
        if file_path.startswith("./"):
            # If it starts with ./, resolve relative to project root
            self.file_path = os.path.join(self.project_root, file_path[2:])
        elif not os.path.isabs(file_path):
            # If it's relative but doesn't start with ./, also resolve relative to project root
            self.file_path = os.path.join(self.project_root, file_path)
        else:
            self.file_path = file_path

        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        self._memory: List[Dict[str, Any]] = []
        self.load_memory()

    def load_memory(self):
        """Load stored memory entries from disk."""
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Handle legacy dict format - convert to list
                if isinstance(data, dict):
                    logger.info("Converting legacy dict memory format to list format")
                    legacy_entries = []

                    # Convert dict entries to list entries
                    if "identity" in data:
                        legacy_entries.append({"type": "identity", **data["identity"]})
                    if "everett_profile" in data:
                        legacy_entries.append(
                            {"type": "everett_profile", **data["everett_profile"]}
                        )
                    if "brockston_capabilities" in data:
                        legacy_entries.append(
                            {"type": "capabilities", **data["brockston_capabilities"]}
                        )
                    if "relationship_with_everett" in data:
                        legacy_entries.append(
                            {
                                "type": "relationship",
                                **data["relationship_with_everett"],
                            }
                        )
                    if "tech_stack" in data:
                        legacy_entries.append(
                            {"type": "tech_stack", **data["tech_stack"]}
                        )
                    if "mission_statement" in data:
                        legacy_entries.append(
                            {"type": "mission", "statement": data["mission_statement"]}
                        )

                    # Add any conversation entries that were already in list format
                    for key, value in data.items():
                        if isinstance(value, list):
                            legacy_entries.extend(value)

                    self._memory = legacy_entries

                    # Save in new format immediately
                    self.save_memory()
                    logger.info(
                        f"Converted and saved {len(self._memory)} memory entries"
                    )
                elif isinstance(data, list):
                    self._memory = data
                    logger.info(f"Loaded {len(self._memory)} memory entries.")
                else:
                    logger.error(f"Unexpected memory file format: {type(data)}")
                    self._memory = []
            except Exception as e:
                logger.error(f"Failed to load memory file: {e}")
                self._memory = []
        else:
            logger.info("No existing memory file found, starting fresh.")
            self._memory = []

    def save_memory(self):
        """Persist memory to disk."""
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._memory, f, indent=2)
            logger.info(f"Saved {len(self._memory)} memory entries.")
        except Exception as e:
            logger.error(f"Failed to save memory: {e}")

    def save(self, entry: Dict[str, Any]):
        """Save a new entry into memory."""
        entry["timestamp"] = datetime.utcnow().isoformat() + "Z"
        self._memory.append(entry)
        self.save_memory()
        logger.debug(f"Stored new memory entry: {entry}")

    def query(self, text: str, intent: Optional[str] = None) -> Dict[str, Any]:
        """
        Retrieve memory entries with basic keyword relevance.

        Strategy:
        1. If intent is provided, filter by intent match.
        2. Score remaining entries by keyword overlap with the query text.
        3. Return the top 5 most relevant entries (or last 5 if no keywords match).

        NOTE: This is keyword-based retrieval, not semantic/embedding search.
        For true semantic memory, integrate an embedding model in the future.
        """
        logger.debug(f"Querying memory for context (intent={intent}): {text}")

        if not self._memory:
            return {"context": "No prior context found."}

        # Step 1: Filter by intent if provided
        if intent:
            candidates = [m for m in self._memory if m.get("intent") == intent]
        else:
            candidates = list(self._memory)

        # Step 2: Score by keyword overlap with the query
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

        scored = []
        for entry in candidates:
            entry_text = f"{entry.get('input', '')} {entry.get('output', '')}".lower()
            entry_words = set(entry_text.split())
            overlap = len(query_keywords & entry_words)
            scored.append((overlap, entry))

        # Sort by score descending, then take top 5
        scored.sort(key=lambda x: x[0], reverse=True)

        # If no keyword matches, fall back to most recent
        if scored and scored[0][0] > 0:
            relevant = [entry for _score, entry in scored[:5]]
        else:
            relevant = candidates[-5:]

        # Build context string
        context_snippets = [
            f"{m.get('input', '')} -> {m.get('output', '')}" for m in relevant
        ]
        return {"context": "\n".join(context_snippets)}

    def get_recent_events(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Return the most recent memory events."""
        return list(reversed(self._memory[-limit:]))

    def clear(self):
        """Erase all memory (use with caution)."""
        self._memory = []
        self.save_memory()
        logger.warning("All memory has been cleared.")


# ==============================================================================
# © 2025 Everett Nathaniel Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
#
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================
