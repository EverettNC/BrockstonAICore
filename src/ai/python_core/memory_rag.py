# =============================================
# file: brockston_knowledge/rag.py
# =============================================
from __future__ import annotations
from typing import Any, Dict, List
import re

# KnowledgeStore shim — store.py has no KnowledgeStore
class KnowledgeStore:
    def __init__(self, *a, **kw): pass
    def add(self, *a, **kw): pass
    def query(self, *a, **kw): return []
    def save(self, *a, **kw): pass
from indexer import HybridIndexer
from retriever import HybridRetriever


class LocalRAG:
    """Simple offline RAG: retrieve + synthesize + verify-lite.
    Synthesis is templated and deterministic — suitable for BROCKSTON to pass to his voice/UX layer.
    """

    def __init__(self, store: KnowledgeStore, indexer: HybridIndexer) -> None:
        self.store = store
        self.indexer = indexer
        self.retriever = HybridRetriever(indexer)

    def rebuild_ns(self, namespace: str) -> None:
        docs = self.store.read_all(namespace)
        texts = [d.text for d in docs]
        metas = [d.meta | {"id": d.id} for d in docs]
        if texts:
            self.indexer.build(namespace, texts, metas)

    def ask(self, namespace: str, query: str, k: int = 6) -> Dict[str, Any]:
        if not self.indexer.has_ns(namespace):
            self.rebuild_ns(namespace)
        if not self.indexer.has_ns(namespace):
            return {"answer": None, "confidence": 0.0, "chunks": []}
        hits = self.retriever.search(namespace, query, k=k)
        answer, conf = self._synthesize(query, hits)
        return {"answer": answer, "confidence": conf, "chunks": hits}

    def _synthesize(self, query: str, hits: List[Dict[str, Any]]) -> tuple[str, float]:
        if not hits:
            return ("I have no local knowledge on that yet.", 0.1)
        # Merge the top few chunks into a deterministic answer
        top = hits[:3]
        facts = []
        for h in top:
            snippet = h["text"].strip()
            snippet = re.sub(r"\s+", " ", snippet)
            if len(snippet) > 400:
                snippet = snippet[:400].rstrip() + "…"
            facts.append(f"• {snippet}")
        answer = f"From local knowledge (top {len(top)}):\n" + "\n".join(facts)
        # crude confidence: average of normalized total scores
        conf = sum(h["score_total"] for h in top) / max(1.0, len(top))
        return answer, float(min(1.0, max(0.0, conf)))
