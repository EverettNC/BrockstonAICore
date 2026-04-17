# =============================================
# file: brockston_knowledge/indexer.py
# =============================================
from __future__ import annotations
from typing import Any, Dict, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

try:
    from sentence_transformers import SentenceTransformer

    _HAS_ST = True
except Exception:
    _HAS_ST = False


class HybridIndexer:
    """Build TF-IDF and optional embedding indices per namespace."""

    def __init__(self) -> None:
        self.tfidf: Dict[str, TfidfVectorizer] = {}
        self.tfidf_mat: Dict[str, np.ndarray] = {}
        self.emb_model = SentenceTransformer("all-MiniLM-L6-v2") if _HAS_ST else None
        self.embeddings: Dict[str, np.ndarray] = {}
        self.payloads: Dict[str, List[Dict[str, Any]]] = {}

    def build(
        self, namespace: str, texts: List[str], metas: List[Dict[str, Any]]
    ) -> None:
        # TF-IDF
        vec = TfidfVectorizer(ngram_range=(1, 2), max_features=100000)
        X = vec.fit_transform(texts)
        self.tfidf[namespace] = vec
        self.tfidf_mat[namespace] = X
        # Embeddings (optional)
        if self.emb_model:
            embs = self.emb_model.encode(
                texts, show_progress_bar=False, normalize_embeddings=True
            )
            self.embeddings[namespace] = np.asarray(embs, dtype=np.float32)
        else:
            self.embeddings[namespace] = np.zeros((len(texts), 1), dtype=np.float32)
        # Payloads
        self.payloads[namespace] = [{"text": t, **m} for t, m in zip(texts, metas)]

    def has_ns(self, ns: str) -> bool:
        return ns in self.payloads
