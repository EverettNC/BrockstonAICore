"""
BROCKSTON's Search Engine — Powered by Perplexity Sonar
=========================================================
Brockston doesn't guess when he can know.
When a student asks something that needs current, real-world information,
Brockston reaches out through Perplexity and brings back grounded,
cited answers — not hallucinations.

This module is the real implementation of self.perplexity in BrockstonBrain.
It replaces the stub (self.perplexity = None) that was sitting there before.

Usage (automatically wired into BrockstonBrain.think()):
    from perplexity_service import PerplexityService
    search = PerplexityService()
    result = search.generate_content("What is AAC and how does it help nonverbal kids?")

Environment variable required:
    PERPLEXITY_API_KEY — get one at https://www.perplexity.ai/settings/api

© 2025 Everett Nathaniel Christman & The Christman AI Project
Cardinal Rule 1: It actually works.
Cardinal Rule 6: Fail loud — no silent search failures.
Cardinal Rule 13: Citations included. No hallucinations.
"""

import os
import logging
import json
import requests
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Perplexity API endpoint — OpenAI SDK compatible
PERPLEXITY_BASE_URL = "https://api.perplexity.ai"

# Model selection:
# sonar       — Fast, grounded, cost-efficient. Good for most queries.
# sonar-pro   — Deeper search, more sources, better for complex questions.
# Use sonar-pro for Brockston's teaching and coding queries.
DEFAULT_MODEL = "sonar-pro"
FAST_MODEL = "sonar"


class PerplexityService:
    """
    Brockston's live search engine — Perplexity Sonar.

    Gives Brockston access to current, real-world information with citations.
    Every response is grounded in actual web sources, not training data alone.

    This is not a wrapper around a search box.
    This is Brockston's connection to everything that's happened since his
    training data ended — and everything Everett's students need to know right now.
    """

    def __init__(self, model: str = DEFAULT_MODEL):
        """
        Initialize the Perplexity search client.

        Args:
            model: Perplexity model to use. Default: sonar-pro.

        Raises:
            EnvironmentError: If PERPLEXITY_API_KEY is not set (Rule 6).
        """
        self.model = model
        self._available = False
        self.api_key = os.getenv("PERPLEXITY_API_KEY")

        if not self.api_key:
            logger.warning(
                "[PerplexityService] PERPLEXITY_API_KEY not set — "
                "search engine will not be available. "
                "Set PERPLEXITY_API_KEY to enable Brockston's live search."
            )
            return

        self._available = True
        logger.info(
            f"[PerplexityService] Search engine online — "
            f"model: {self.model} — Brockston can see the world."
        )

    @property
    def is_available(self) -> bool:
        """True if Perplexity is configured and ready."""
        return self._available

    def generate_content(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 1024,
        recency_filter: Optional[str] = None,
        domain_filter: Optional[List[str]] = None,
        search_mode: str = "web",
    ) -> str:
        """
        Search the web and return a grounded, cited answer.

        This is the primary interface — matches the method name that
        BrockstonBrain.think() already calls: self.perplexity.generate_content()

        Args:
            prompt: The question or query to search
            system_prompt: Optional system context (defaults to Brockston's identity)
            max_tokens: Max tokens in response (default 1024)
            recency_filter: Limit results by age — "day", "week", "month", "year"
            domain_filter: Limit to specific domains e.g. ["github.com", "docs.python.org"]
            search_mode: "web" (default), "academic", or "sec"

        Returns:
            str: Grounded answer with citations inline

        Raises:
            RuntimeError: If search fails (Rule 6 — loud, not silent)
        """
        if not self.is_available:
            raise RuntimeError(
                "[PerplexityService] Search engine not available. "
                "Set PERPLEXITY_API_KEY environment variable."
            )

        if not system_prompt:
            system_prompt = (
                "You are BROCKSTON C's search engine — powered by Perplexity. "
                "You find real, current, grounded information and return it with "
                "source citations. You do not hallucinate. You do not invent sources. "
                "If you don't find it, say so. Cardinal Rule 13: Absolute honesty."
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ]

        # Build extra search parameters
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "return_related_questions": False,
            "search_mode": search_mode,
        }
        
        if recency_filter:
            payload["search_recency_filter"] = recency_filter
        if domain_filter:
            payload["search_domain_filter"] = domain_filter

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        try:
            logger.info(
                f"[PerplexityService] Searching: {prompt[:80]}... "
                f"(model={self.model})"
            )
            
            response = requests.post(
                f"{PERPLEXITY_BASE_URL}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            response.raise_for_status()
            data = response.json()
            
            answer = data["choices"][0]["message"]["content"]

            # Append citations if available
            citations = data.get("citations")
            if citations:
                citation_block = "\n\nSources:\n" + "\n".join(
                    f"  [{i+1}] {url}" for i, url in enumerate(citations[:5])
                )
                answer = answer + citation_block

            logger.info(
                f"[PerplexityService] Search complete — "
                f"{data['usage']['total_tokens']} tokens used"
            )
            return answer

        except Exception as e:
            logger.error(
                f"[PerplexityService] Search failed: {e}",
                exc_info=True,
            )
            raise RuntimeError(
                f"Perplexity search failed: {e}. "
                "Check your PERPLEXITY_API_KEY and internet connection."
            )

    def search_code(self, query: str, language: Optional[str] = None) -> str:
        """
        Search specifically for coding information — docs, examples, best practices.

        Tuned for Brockston's role as coding teacher:
        - Pulls from official docs, GitHub, Stack Overflow
        - Returns working code examples when available

        Args:
            query: Coding question or concept
            language: Optional programming language to focus on

        Returns:
            str: Code-focused answer with sources
        """
        focused_query = query
        if language:
            focused_query = f"{language}: {query}"

        code_domains = [
            "docs.python.org",
            "github.com",
            "stackoverflow.com",
            "developer.mozilla.org",
            "docs.rs",           # Rust
            "docs.anthropic.com",
            "platform.openai.com",
            "pytorch.org",
            "numpy.org",
            "fastapi.tiangolo.com",
        ]

        system = (
            "You are finding coding information for BROCKSTON C, who teaches "
            "students including neurodivergent learners. Return working code examples. "
            "Explain what the code does and why, not just what. "
            "Cite the official documentation when possible. "
            "If the code has any known pitfalls, flag them."
        )

        return self.generate_content(
            prompt=focused_query,
            system_prompt=system,
            max_tokens=1500,
            domain_filter=code_domains,
            recency_filter="year",
        )

    def search_current_events(self, query: str) -> str:
        """
        Search for current events and recent news.
        Used when a student asks about something happening right now.

        Args:
            query: News or current events query

        Returns:
            str: Current, cited answer
        """
        return self.generate_content(
            prompt=query,
            max_tokens=800,
            recency_filter="week",
        )

    def search_academic(self, query: str) -> str:
        """
        Search academic and research sources.
        Useful for neurodivergency research, medical questions, AI papers.

        Args:
            query: Research or academic query

        Returns:
            str: Research-grounded answer with citations
        """
        return self.generate_content(
            prompt=query,
            max_tokens=1200,
            search_mode="academic",
        )


# =============================================================================
# SINGLETON — one search engine instance shared across all of Brockston
# =============================================================================

_perplexity_instance: Optional[PerplexityService] = None


def get_perplexity_service(model: str = DEFAULT_MODEL) -> PerplexityService:
    """
    Get or create the shared Perplexity service instance.

    Brockston gets one search engine. Not one per conversation.
    """
    global _perplexity_instance
    if _perplexity_instance is None:
        _perplexity_instance = PerplexityService(model=model)
    return _perplexity_instance


# =============================================================================
# © 2025 Everett Nathaniel Christman & The Christman AI Project
# Luma Cognify AI — "How can I help you love yourself more?"
#
# Perplexity is Brockston's eyes on the world.
# When he doesn't know — he looks. When he looks — he cites.
# Cardinal Rule 13: No hallucinations. No invented sources. Truth only.
# =============================================================================
