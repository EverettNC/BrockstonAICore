"""
knowledge_engine.py — BROCKSTON C v4.0.0
=================================
Autonomously gathers, processes, and stores knowledge from curated web sources
relevant to BROCKSTON's population: autism, AAC, nonverbal communication,
neurodivergency, and special education.

Cleaned and hardened: May 2026
Cardinal Rule 1: It has to actually work.
Cardinal Rule 6: No silent failures.
Cardinal Rule 13: Honest about what this does and doesn't do.

© 2025 Everett Nathaniel Christman & The Christman AI Project
"How can we help you love yourself more?"
"""

# ==============================================================================
# © 2025 Everett Nathaniel Christman & Misty Gail Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================

import datetime
import json
import logging
import os
import random
import threading
import time
from collections import defaultdict
from typing import Any, Dict, List, Optional

import requests

# BeautifulSoup is required for web crawling. If unavailable, crawling is disabled
# gracefully — all other knowledge operations continue normally.
try:
    from bs4 import BeautifulSoup
    HAS_BEAUTIFULSOUP = True
except ImportError:
    BeautifulSoup = None
    HAS_BEAUTIFULSOUP = False
    # Logger is not yet initialized here; the KnowledgeEngine.__init__ will log this.

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Storage paths
# ------------------------------------------------------------------
KNOWLEDGE_DIR = "data/knowledge"
TOPICS_FILE = f"{KNOWLEDGE_DIR}/topics.json"
FACTS_FILE = f"{KNOWLEDGE_DIR}/facts.json"
CRAWLER_STATUS_FILE = f"{KNOWLEDGE_DIR}/crawler_status.json"

# Ensure the knowledge directory exists at import time
os.makedirs(KNOWLEDGE_DIR, exist_ok=True)

# ------------------------------------------------------------------
# BROCKSTON's core knowledge topics and their source URLs
#
# Topics are focused on BROCKSTON's population: autistic individuals, AAC users,
# nonverbal communicators, neurodivergent people, and special education communities.
# ------------------------------------------------------------------
CORE_TOPICS = [
    "autism and AAC",
    "augmentative and alternative communication",
    "nonverbal communication strategies",
    "neurodivergency and inclusion",
    "special education practice",
]

TOPIC_SOURCES: Dict[str, List[str]] = {
    "autism and AAC": [
        "https://en.wikipedia.org/wiki/Augmentative_and_alternative_communication",
        "https://www.autismspeaks.org/augmentative-and-alternative-communication",
    ],
    "augmentative and alternative communication": [
        "https://en.wikipedia.org/wiki/Augmentative_and_alternative_communication",
        "https://www.asha.org/public/speech/disorders/aac/",
    ],
    "nonverbal communication strategies": [
        "https://en.wikipedia.org/wiki/Nonverbal_communication",
        "https://www.understood.org/en/articles/nonverbal-learning-disabilities",
    ],
    "neurodivergency and inclusion": [
        "https://en.wikipedia.org/wiki/Neurodiversity",
        "https://www.autism.org.uk/advice-and-guidance/topics/education/neurodiversity",
    ],
    "special education practice": [
        "https://en.wikipedia.org/wiki/Special_education",
        "https://www.understood.org/en/articles/what-is-special-education",
    ],
}


# ------------------------------------------------------------------
# KnowledgeGraph
# ------------------------------------------------------------------

class KnowledgeGraph:
    """
    Stores knowledge as a flat graph of named concepts and typed relationships.
    Persisted to JSON at data/knowledge/knowledge_graph.json.
    """

    def __init__(self, load_existing: bool = True):
        self.concepts: Dict[str, Any] = {}
        self.relationships: List[Dict[str, Any]] = []
        self.topic_concepts: defaultdict = defaultdict(set)

        if load_existing:
            self._load()

    def add_concept(
        self,
        concept_id: str,
        name: str,
        data: Dict[str, Any],
        topics: Optional[List[str]] = None,
    ) -> str:
        """
        Add or update a concept in the graph.

        Args:
            concept_id: Unique identifier for the concept.
            name: Human-readable name.
            data: Arbitrary metadata dict.
            topics: Optional list of topic strings to associate.

        Returns:
            str: The concept_id.
        """
        if concept_id in self.concepts:
            self.concepts[concept_id].update(data)
        else:
            self.concepts[concept_id] = {
                "name": name,
                "last_updated": datetime.datetime.now().isoformat(),
                "confidence": 0.7,
                "data": data,
            }
        if topics:
            for topic in topics:
                self.topic_concepts[topic].add(concept_id)
        return concept_id

    def add_relationship(
        self,
        concept1_id: str,
        relationship: str,
        concept2_id: str,
        strength: float = 0.5,
    ) -> None:
        """
        Record a typed relationship between two existing concepts.
        Silently skips if either concept does not exist.
        """
        if concept1_id not in self.concepts or concept2_id not in self.concepts:
            return
        self.relationships.append({
            "from": concept1_id,
            "relationship": relationship,
            "to": concept2_id,
            "strength": strength,
            "last_updated": datetime.datetime.now().isoformat(),
        })

    def save(self) -> None:
        """Persist the knowledge graph to disk."""
        graph_file = f"{KNOWLEDGE_DIR}/knowledge_graph.json"
        topic_data = {topic: list(cids) for topic, cids in self.topic_concepts.items()}
        data = {
            "concepts": self.concepts,
            "relationships": self.relationships,
            "topic_concepts": topic_data,
            "last_updated": datetime.datetime.now().isoformat(),
        }
        try:
            with open(graph_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(
                f"[KnowledgeGraph] save failed: {e}",
                exc_info=True,
            )

    def _load(self) -> None:
        """Load a previously saved knowledge graph from disk. Logs and continues on error."""
        graph_file = f"{KNOWLEDGE_DIR}/knowledge_graph.json"
        if not os.path.exists(graph_file):
            return
        try:
            with open(graph_file, "r") as f:
                data = json.load(f)
            self.concepts = data.get("concepts", {})
            self.relationships = data.get("relationships", [])
            for topic, concept_ids in data.get("topic_concepts", {}).items():
                self.topic_concepts[topic] = set(concept_ids)
        except Exception as e:
            logger.error(
                f"[KnowledgeGraph] _load failed — starting with empty graph: {e}",
                exc_info=True,
            )


# ------------------------------------------------------------------
# FactManager
# ------------------------------------------------------------------

class FactManager:
    """
    Manages a flat list of learned facts with metadata.
    Facts are persisted to data/knowledge/facts.json.
    """

    def __init__(self):
        self.facts: List[Dict[str, Any]] = []
        self._load_facts()

    def _load_facts(self) -> None:
        """Load existing facts from disk. Logs and recovers on any error."""
        if not os.path.exists(FACTS_FILE):
            return
        try:
            with open(FACTS_FILE, "r") as f:
                self.facts = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(
                f"[FactManager] _load_facts failed to load {FACTS_FILE}: {e}",
                exc_info=True,
            )
            self.facts = []

    def save_facts(self) -> None:
        """Persist all facts to disk."""
        try:
            with open(FACTS_FILE, "w") as f:
                json.dump(self.facts, f, indent=2)
        except Exception as e:
            logger.error(
                f"[FactManager] save_facts failed: {e}",
                exc_info=True,
            )

    def add_fact(
        self,
        fact_text: str,
        source: str,
        topics: List[str],
        confidence: float = 0.7,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> int:
        """
        Append a new fact and persist immediately.

        Args:
            fact_text: The raw text of the fact.
            source: URL or identifier of the source.
            topics: List of topic strings.
            confidence: Confidence score (0.0–1.0).
            metadata: Optional additional metadata.

        Returns:
            int: Index of the newly added fact.
        """
        fact = {
            "text": fact_text,
            "source": source,
            "topics": topics,
            "confidence": confidence,
            "metadata": metadata or {},
            "learned_at": datetime.datetime.now().isoformat(),
        }
        self.facts.append(fact)
        self.save_facts()
        return len(self.facts) - 1


# ------------------------------------------------------------------
# WebCrawler
# ------------------------------------------------------------------

class WebCrawler:
    """
    Background web crawler that gathers knowledge from BROCKSTON's curated topic sources.

    Crawling is disabled at init time if BeautifulSoup is not installed.
    Every HTTP request uses timeout=10 and is wrapped in try/except so a single
    bad URL never kills the crawl loop.
    """

    def __init__(self, topics: Optional[List[str]] = None):
        self.running: bool = False
        self.crawler_thread: Optional[threading.Thread] = None
        self.topics = topics or CORE_TOPICS
        self.crawling_enabled: bool = HAS_BEAUTIFULSOUP
        self.status: Dict[str, Any] = {
            "running": False,
            "current_topic": None,
            "topics_processed": 0,
            "facts_discovered": 0,
            "last_update": None,
        }

        if not HAS_BEAUTIFULSOUP:
            logger.warning(
                "[WebCrawler] BeautifulSoup not installed — web crawling disabled. "
                "Install beautifulsoup4 to enable: pip install beautifulsoup4"
            )

        self._load_status()

    def _load_status(self) -> None:
        """Load persisted crawler status. Logs and continues on error."""
        if not os.path.exists(CRAWLER_STATUS_FILE):
            return
        try:
            with open(CRAWLER_STATUS_FILE, "r") as f:
                self.status = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.warning(
                f"[WebCrawler] _load_status failed — starting fresh: {e}"
            )

    def _save_status(self) -> None:
        """Persist crawler status to disk."""
        try:
            with open(CRAWLER_STATUS_FILE, "w") as f:
                json.dump(self.status, f, indent=2)
        except Exception as e:
            logger.error(
                f"[WebCrawler] _save_status failed: {e}",
                exc_info=True,
            )

    def start(self) -> None:
        """Start the background crawl loop. No-op if already running or crawling is disabled."""
        if not self.crawling_enabled:
            logger.warning(
                "[WebCrawler] start() called but crawling is disabled "
                "(BeautifulSoup not available)"
            )
            return

        if self.running:
            return

        self.running = True
        self.status["running"] = True
        self._save_status()
        self.crawler_thread = threading.Thread(target=self._crawl_loop, daemon=True)
        self.crawler_thread.start()
        logger.info("[WebCrawler] Background crawl loop started")

    def stop(self) -> None:
        """Signal the crawl loop to stop."""
        self.running = False
        self.status["running"] = False
        self._save_status()
        logger.info("[WebCrawler] Crawl loop stopped")

    def get_status(self) -> Dict[str, Any]:
        """Return the current crawler status snapshot."""
        return dict(self.status)

    def _crawl_loop(self) -> None:
        """
        Background thread: iterates through topics, fetches source URLs,
        extracts paragraph text, and stores facts.

        Each HTTP request uses timeout=10. Any exception for a single URL is
        logged and skipped — the loop continues.
        """
        fact_manager = FactManager()
        knowledge_graph = KnowledgeGraph()

        while self.running:
            topic = random.choice(self.topics)
            self.status["current_topic"] = topic
            self._save_status()

            for url in TOPIC_SOURCES.get(topic, []):
                try:
                    r = requests.get(
                        url,
                        headers={"User-Agent": "BrockstonBot/4.0 (+https://thechristmanaiproject.com)"},
                        timeout=10,
                    )
                    if r.status_code != 200:
                        logger.warning(
                            f"[WebCrawler] {url} returned status {r.status_code} — skipping"
                        )
                        continue

                    soup = BeautifulSoup(r.text, "html.parser")
                    for p in soup.find_all("p")[:5]:
                        text = p.get_text().strip()
                        if len(text.split()) < 6:
                            continue

                        fact_manager.add_fact(
                            text, source=url, topics=[topic], confidence=0.85
                        )
                        cid = f"{topic}_{int(time.time())}_{random.randint(1000, 9999)}"
                        knowledge_graph.add_concept(
                            cid, topic.title(), {"fact": text}, topics=[topic]
                        )
                        self.status["facts_discovered"] += 1
                        self._save_status()

                    knowledge_graph.save()

                except requests.exceptions.Timeout:
                    logger.warning(
                        f"[WebCrawler] _crawl_loop request to {url} timed out — skipping"
                    )
                except Exception as e:
                    logger.error(
                        f"[WebCrawler] _crawl_loop failed for {url}: {e}",
                        exc_info=True,
                    )

            self.status["topics_processed"] += 1
            self.status["last_update"] = datetime.datetime.now().isoformat()
            self._save_status()
            time.sleep(3)


# ------------------------------------------------------------------
# KnowledgeEngine — the public interface
# ------------------------------------------------------------------

class KnowledgeEngine:
    """
    Primary knowledge management interface for BROCKSTON.

    Composes KnowledgeGraph, FactManager, and WebCrawler.
    Accepts an optional brockston_instance reference from brockston_core.py.

    The reason() method performs keyword substring matching over stored facts —
    it is NOT semantic search or embedding-based retrieval.
    """

    def __init__(self, brockston_instance=None):
        """
        Initialize the KnowledgeEngine.

        Args:
            brockston_instance: Optional reference to the main BROCKSTON core.
        """
        self.brockston_instance = brockston_instance

        if not HAS_BEAUTIFULSOUP:
            logger.warning(
                "[KnowledgeEngine] BeautifulSoup not available — "
                "web crawling disabled. pip install beautifulsoup4 to enable."
            )

        self.graph = KnowledgeGraph()
        self.fact_manager = FactManager()
        self.crawler = WebCrawler()

        logger.info(
            f"[KnowledgeEngine] Initialized. "
            f"Facts loaded: {len(self.fact_manager.facts)}. "
            f"Concepts loaded: {len(self.graph.concepts)}. "
            f"Crawling enabled: {self.crawler.crawling_enabled}."
        )

    def start_learning(self) -> None:
        """Start the background web crawler to gather new knowledge."""
        logger.info("[KnowledgeEngine] start_learning called")
        self.crawler.start()

    def stop_learning(self) -> None:
        """Stop the background web crawler."""
        logger.info("[KnowledgeEngine] stop_learning called")
        self.crawler.stop()

    def get_learning_metrics(self) -> Dict[str, Any]:
        """
        Return a snapshot of current learning progress.

        Returns:
            dict: Counts of facts, topics explored, last update timestamp,
                  and crawler status.
        """
        return {
            "facts_learned": len(self.fact_manager.facts),
            "topics_explored": len(
                {t for f in self.fact_manager.facts for t in f.get("topics", [])}
            ),
            "last_updated": datetime.datetime.now().isoformat(),
            "crawler_status": self.crawler.get_status(),
        }

    def reason(self, query: str, context: Optional[str] = None) -> Dict[str, Any]:
        """
        Search stored facts for entries relevant to the query.

        Note: Matching is substring-based (query text in fact text, or topic overlap).
        This is NOT semantic search — it does not use embeddings or vector similarity.

        Args:
            query: The question or topic to reason about.
            context: Optional context string (currently unused; reserved for future use).

        Returns:
            dict: {
                "response": str or None,
                "confidence": float,
                "source": str,
                "knowledge_used": list[str],
                "needs_external": bool,
            }
        """
        if not query or not query.strip():
            logger.warning("[KnowledgeEngine] reason called with empty query")
            return {
                "response": None,
                "confidence": 0.0,
                "source": "knowledge_engine",
                "knowledge_used": [],
                "needs_external": True,
            }

        logger.info(f"[KnowledgeEngine] reason: {query[:80]!r}")

        results = []
        for fact in self.fact_manager.facts:
            text_match = query.lower() in fact.get("text", "").lower()
            topic_match = any(
                t.lower() in query.lower() for t in fact.get("topics", [])
            )
            if text_match or topic_match:
                results.append(fact)

        if results:
            results.sort(key=lambda x: x.get("confidence", 0), reverse=True)
            best = results[0]
            return {
                "response": best["text"],
                "confidence": best.get("confidence", 0.8),
                "source": best.get("source", "knowledge_engine"),
                "knowledge_used": [f["text"] for f in results[:3]],
                "needs_external": False,
            }

        return {
            "response": None,
            "confidence": 0.0,
            "source": "knowledge_engine",
            "knowledge_used": [],
            "needs_external": True,
        }


# ------------------------------------------------------------------
# Module-level singleton
# ------------------------------------------------------------------

_knowledge_engine: Optional[KnowledgeEngine] = None


def get_knowledge_engine(brockston_instance=None) -> KnowledgeEngine:
    """Return the module-level KnowledgeEngine singleton, creating it if needed."""
    global _knowledge_engine
    if _knowledge_engine is None:
        _knowledge_engine = KnowledgeEngine(brockston_instance=brockston_instance)
    return _knowledge_engine


__all__ = ["get_knowledge_engine", "KnowledgeEngine", "KnowledgeGraph", "FactManager", "WebCrawler"]


if __name__ == "__main__":
    engine = get_knowledge_engine()
    engine.start_learning()
    time.sleep(20)
    print(engine.get_learning_metrics())
    engine.stop_learning()
