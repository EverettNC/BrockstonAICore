# =============================================
# file: brockston_knowledge/retriever.py
# =============================================
from __future__ import annotations
from typing import Any, Dict, List
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class HybridRetriever:
    def __init__(self, indexer: "HybridIndexer") -> None:
        self.idx = indexer

    def _tfidf_scores(self, ns: str, q: str) -> np.ndarray:
        vec = self.idx.tfidf[ns]
        X = self.idx.tfidf_mat[ns]
        qv = vec.transform([q])
        return cosine_similarity(qv, X)[0]

    def _embed_scores(self, ns: str, q: str) -> np.ndarray:
        if self.idx.emb_model is None:
            return np.zeros(len(self.idx.payloads[ns]))
        qv = self.idx.emb_model.encode(
            [q], show_progress_bar=False, normalize_embeddings=True
        )
        embs = self.idx.embeddings[ns]
        return (qv @ embs.T)[0]

    def _recency_scores(self, ns: str) -> np.ndarray:
        payloads = self.idx.payloads[ns]
        # naive recency: newer lines get slight boost
        scores = np.linspace(0.9, 1.0, num=len(payloads))
        return scores

    def search(
        self,
        ns: str,
        query: str,
        k: int = 8,
        w_tfidf: float = 0.6,
        w_embed: float = 0.35,
        w_recency: float = 0.05,
    ) -> List[Dict[str, Any]]:
        assert self.idx.has_ns(ns), f"Namespace not indexed: {ns}"
        s1 = self._tfidf_scores(ns, query)
        s2 = self._embed_scores(ns, query)
        s3 = self._recency_scores(ns)
        combo = w_tfidf * s1 + w_embed * s2 + w_recency * s3
        order = np.argsort(-combo)[:k]
        results = []
        for i in order:
            p = dict(self.idx.payloads[ns][i])
            p["score_tfidf"] = float(s1[i])
            p["score_embed"] = float(s2[i])
            p["score_recency"] = float(s3[i])
            p["score_total"] = float(combo[i])
            p["rank"] = int(len(results) + 1)
            results.append(p)
        return results
