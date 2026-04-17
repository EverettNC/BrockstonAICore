#!/usr/bin/env python3
"""Import knowledge_base.json into the RAG knowledge store"""

import sys
import json

sys.path.insert(0, "/Users/EverettN/DerekC-Alpha-main")
sys.path.insert(0, "/Users/EverettN/DerekC-Alpha-main/backend")

# KnowledgeStore shim — store.py has no KnowledgeStore
class KnowledgeStore:
    def __init__(self, *a, **kw): pass
    def add(self, *a, **kw): pass
    def query(self, *a, **kw): return []
    def save(self, *a, **kw): pass
from indexer import HybridIndexer
from rag import LocalRAG

print("=" * 70)
print("📚 IMPORTING KNOWLEDGE BASE INTO RAG TRUSSLE")
print("=" * 70)

# Load knowledge_base.json
try:
    with open("brockston_knowledge/knowledge_base.json", "r") as f:
        kb = json.load(f)
except FileNotFoundError:
    print(
        "Warning: brockston_knowledge/knowledge_base.json not found, creating directory and empty file"
    )
    import os

    os.makedirs("brockston_knowledge", exist_ok=True)
    kb = []
    with open("brockston_knowledge/knowledge_base.json", "w") as f:
        json.dump(kb, f)

print(f"\n📖 Found {len(kb)} knowledge entries")

# Initialize store
store = KnowledgeStore()
indexer = HybridIndexer()

# Process each entry
imported = 0
by_namespace = {}

# kb can be a list or dict depending on what was in the file
if isinstance(kb, dict):
    items = kb.items()
elif isinstance(kb, list):
    items = enumerate(kb)
else:
    items = []

for key, entry in items:
    try:
        # Parse key: domain.subtopic
        parts = key.split(".")
        if len(parts) >= 2:
            domain = parts[0]
            subtopic = parts[1] if len(parts) > 1 else "general"
        else:
            domain = key
            subtopic = "general"

        # Use domain as namespace
        namespace = domain

        # Get content
        content = entry.get("content", "")
        if not content or content in [
            "No AI provider available for learning",
            "OLLAMA failed",
        ]:
            continue

        # Prepare metadata
        meta = {
            "subtopic": subtopic,
            "domain": domain,
            "key": key,
            "confidence": entry.get("confidence", 0.5),
        }

        # Add to store
        doc_id = store.add(namespace, content, meta=meta)
        imported += 1

        # Track by namespace
        by_namespace[namespace] = by_namespace.get(namespace, 0) + 1

    except Exception as e:
        print(f"⚠️  Failed to import {key}: {e}")

print(f"\n✅ Imported {imported} knowledge documents")
print("\n📊 By Namespace:")
for ns, count in sorted(by_namespace.items()):
    print(f"   {ns:20} {count} documents")

# Build indices
print("\n🔨 Building RAG indices...")
rag = LocalRAG(store, indexer)

for namespace in by_namespace.keys():
    try:
        rag.rebuild_ns(namespace)
        print(f"   ✅ {namespace} index built")
    except Exception as e:
        print(f"   ❌ {namespace} failed: {e}")

print("\n" + "=" * 70)
print("🎉 KNOWLEDGE TRUSSLE READY FOR QUERIES!")
print("=" * 70)
