"""
Simplified MemoryMesh - WORKING VERSION
Removes problematic encryption and threading issues
"""

import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import defaultdict


class SimpleMemoryMesh:
    """Simplified memory system that ACTUALLY WORKS"""

    def __init__(self, memory_dir: str = "derek_memory"):
        self.memory_dir = Path(memory_dir)
        self.memory_dir.mkdir(exist_ok=True, parents=True)

        self.working_memory = []
        self.working_memory_limit = 7
        self.episodic_memory = []
        self.semantic_memory: Dict[str, List[Dict]] = {
            "conversation": [],
            "learning": [],
            "preferences": [],
            "relationships": [],
            "context": [],
            "events": [],
        }
        self.memory_importance = {}
        self.memory_access_count = defaultdict(int)

        self.load_memories()

    def store(
        self,
        content: str,
        category: str = "auto",
        importance: float = 0.5,
        metadata: Dict = None,
    ):
        """Store a new memory"""
        memory_id = self._generate_id(content)
        timestamp = datetime.now().isoformat()

        if category == "auto":
            category = self._auto_categorize(content, metadata)

        memory = {
            "id": memory_id,
            "content": content.strip(),
            "timestamp": timestamp,
            "importance": importance,
            "metadata": metadata or {},
            "category": category,
        }

        self.working_memory.append(memory)
        self.memory_importance[memory_id] = importance

        if len(self.working_memory) > self.working_memory_limit:
            self._consolidate()

        return memory_id

    def _consolidate(self):
        """Move working memory to long-term storage"""
        for memory in self.working_memory:
            self.episodic_memory.append(memory)
            category = memory.get("category", "context")
            if category in self.semantic_memory:
                self.semantic_memory[category].append(memory)
        self.working_memory.clear()
        self.save_memories()

    def retrieve(self, query: str, limit: int = 5) -> List[Dict]:
        """Retrieve relevant memories"""
        query_lower = query.lower()
        results = []

        for memory in self.working_memory + self.episodic_memory:
            if query_lower in memory["content"].lower():
                score = memory.get("importance", 0.5)
                results.append((score, memory))
                self.memory_access_count[memory["id"]] += 1

        results.sort(key=lambda x: x[0], reverse=True)
        return [mem for score, mem in results[:limit]]

    def save_memories(self):
        """Save to disk WITHOUT encryption"""
        episodic_file = self.memory_dir / "episodic_memory.json"
        with open(episodic_file, "w") as f:
            json.dump(self.episodic_memory, f, indent=2)

        semantic_file = self.memory_dir / "semantic_memory.json"
        with open(semantic_file, "w") as f:
            json.dump(self.semantic_memory, f, indent=2)

        metadata = {
            "importance": self.memory_importance,
            "access_count": dict(self.memory_access_count),
        }
        metadata_file = self.memory_dir / "memory_metadata.json"
        with open(metadata_file, "w") as f:
            json.dump(metadata, f, indent=2)

    def load_memories(self):
        """Load from disk"""
        episodic_file = self.memory_dir / "episodic_memory.json"
        if episodic_file.exists():
            with open(episodic_file) as f:
                self.episodic_memory = json.load(f)

        semantic_file = self.memory_dir / "semantic_memory.json"
        if semantic_file.exists():
            with open(semantic_file) as f:
                self.semantic_memory = json.load(f)

        metadata_file = self.memory_dir / "memory_metadata.json"
        if metadata_file.exists():
            with open(metadata_file) as f:
                metadata = json.load(f)
                self.memory_importance = metadata.get("importance", {})
                self.memory_access_count = defaultdict(
                    int, metadata.get("access_count", {})
                )

    def get_stats(self) -> Dict:
        """Get memory statistics"""
        return {
            "working_memory_count": len(self.working_memory),
            "episodic_memory_count": len(self.episodic_memory),
            "semantic_memory_count": sum(len(v) for v in self.semantic_memory.values()),
            "categories": {k: len(v) for k, v in self.semantic_memory.items()},
        }

    def _auto_categorize(self, content: str, metadata: Dict = None) -> str:
        """Auto-categorize content"""
        content_lower = content.lower()
        if any(w in content_lower for w in ["learn", "understand", "knowledge"]):
            return "learning"
        if any(w in content_lower for w in ["like", "prefer", "favorite"]):
            return "preferences"
        if any(w in content_lower for w in ["person", "friend", "creator"]):
            return "relationships"
        return "conversation"

    def _generate_id(self, content: str) -> str:
        """Generate unique ID"""
        raw = f"{content}{datetime.now().isoformat()}"
        return hashlib.md5(raw.encode()).hexdigest()[:12]
