"""
local_reasoning_engine.py — BROCKSTON C v4.0.0
=================================
Provides self-hosted AI reasoning via Ollama, reducing external API dependency
and giving BROCKSTON a sovereignty path for local inference.

Cleaned and hardened: May 2026
Cardinal Rule 1: It has to actually work.
Cardinal Rule 6: No silent failures.
Cardinal Rule 13: Honest about what this does and doesn't do.

© 2025 Everett Nathaniel Christman & The Christman AI Project
"How can we help you love yourself more?"
"""

# ==============================================================================
# © 2025 Everett Nathaniel Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
#
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================

import json
import logging
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger(__name__)

# Model name is environment-driven. Override OLLAMA_MODEL to swap models without
# touching source code. Default: qwen2.5-coder:32b
_DEFAULT_OLLAMA_MODEL = "qwen2.5-coder:32b"


def _get_ollama_model() -> str:
    """Return the active Ollama model name from the environment, or the default."""
    model = os.environ.get("OLLAMA_MODEL", _DEFAULT_OLLAMA_MODEL)
    if not model:
        logger.warning(
            "[LocalReasoningEngine] OLLAMA_MODEL is set but empty — "
            f"falling back to default: {_DEFAULT_OLLAMA_MODEL}"
        )
        return _DEFAULT_OLLAMA_MODEL
    return model


class LocalReasoningEngine:
    """
    BROCKSTON's local AI reasoning system.

    Uses Ollama to run self-hosted models. Provides a sovereignty path that
    reduces external API dependency. When Ollama is offline, methods fail
    loudly (logger.warning) and return safe empty values — they do not crash.

    Knowledge-base search (_search_knowledge_base) uses keyword overlap matching,
    NOT semantic or embedding-based retrieval.
    """

    def __init__(
        self, knowledge_dir: str = "brockston_knowledge", brockston_instance=None
    ):
        """
        Initialize the Local Reasoning Engine.

        Args:
            knowledge_dir: Directory containing BROCKSTON's learned knowledge JSON files.
            brockston_instance: Reference to the main BROCKSTON system (can be None).
        """
        self.knowledge_dir = Path(knowledge_dir)
        self.brockston = brockston_instance

        # Ollama runs locally — no credentials needed, but the process must be running
        self.ollama_url = os.environ.get("OLLAMA_URL", "http://localhost:11434")

        # Known model catalogue — used for install/recommend helpers only.
        # The *active* model for inference always comes from _get_ollama_model().
        self.available_models: Dict[str, Dict[str, Any]] = {
            "llama3.1": {
                "full_name": "llama3.1:8b",
                "strengths": ["reasoning", "conversation", "general_knowledge"],
                "speed": "fast",
                "size": "8B",
            },
            "llama3.1-70b": {
                "full_name": "llama3.1:70b",
                "strengths": ["advanced_reasoning", "complex_tasks", "deep_knowledge"],
                "speed": "slow",
                "size": "70B",
            },
            "mistral": {
                "full_name": "mistral:7b",
                "strengths": ["fast_reasoning", "coding", "efficiency"],
                "speed": "very_fast",
                "size": "7B",
            },
            "qwen2.5": {
                "full_name": "qwen2.5:14b",
                "strengths": ["advanced_reasoning", "mathematics", "analysis"],
                "speed": "medium",
                "size": "14B",
            },
            "qwen2.5-coder": {
                "full_name": "qwen2.5-coder:32b",
                "strengths": ["code_generation", "debugging", "technical", "reasoning"],
                "speed": "medium",
                "size": "32B",
            },
            "deepseek-coder": {
                "full_name": "deepseek-coder:6.7b",
                "strengths": ["code_generation", "debugging", "technical"],
                "speed": "fast",
                "size": "6.7B",
            },
        }

        self.ollama_available: bool = False
        self.installed_models: List[str] = []

        self.confidence_threshold: float = 0.7
        self.use_local_first: bool = True
        self.fallback_to_external: bool = True

        self._check_ollama_availability()
        self._detect_installed_models()

    # ------------------------------------------------------------------
    # Ollama health checks
    # ------------------------------------------------------------------

    def _check_ollama_availability(self) -> bool:
        """
        Check whether Ollama is installed and responding.
        Sets self.ollama_available and logs the result.
        """
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=2)
            self.ollama_available = response.status_code == 200
            if self.ollama_available:
                logger.info("[LocalReasoningEngine] Ollama is available — local AI ready")
            else:
                logger.warning(
                    f"[LocalReasoningEngine] Ollama running but returned status "
                    f"{response.status_code} — treating as unavailable"
                )
            return self.ollama_available
        except requests.exceptions.ConnectionError:
            logger.warning(
                "[LocalReasoningEngine] Ollama not reachable at "
                f"{self.ollama_url} — will rely on external APIs only. "
                "To enable local AI: install Ollama from https://ollama.ai "
                f"and pull {_get_ollama_model()}"
            )
            self.ollama_available = False
            return False
        except Exception as e:
            logger.error(
                f"[LocalReasoningEngine] _check_ollama_availability failed: {e}",
                exc_info=True,
            )
            self.ollama_available = False
            return False

    def _detect_installed_models(self) -> List[str]:
        """
        Detect which models are installed in Ollama.
        Returns an empty list (and logs a warning) if Ollama is unavailable.
        """
        if not self.ollama_available:
            return []

        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.installed_models = [
                    model["name"] for model in data.get("models", [])
                ]
                if self.installed_models:
                    logger.info(
                        f"[LocalReasoningEngine] Found {len(self.installed_models)} "
                        f"local models: {', '.join(self.installed_models[:3])}"
                    )
                else:
                    logger.warning(
                        f"[LocalReasoningEngine] No models installed yet. "
                        f"Run: ollama pull {_get_ollama_model()}"
                    )
                return self.installed_models
            else:
                logger.warning(
                    f"[LocalReasoningEngine] _detect_installed_models got status "
                    f"{response.status_code}"
                )
                return []
        except Exception as e:
            logger.error(
                f"[LocalReasoningEngine] _detect_installed_models failed: {e}",
                exc_info=True,
            )
            return []

    # ------------------------------------------------------------------
    # Model management
    # ------------------------------------------------------------------

    def install_model(self, model_name: str) -> bool:
        """
        Install a local AI model via `ollama pull`.

        Args:
            model_name: Key from self.available_models (e.g. 'qwen2.5-coder').

        Returns:
            bool: True if installation succeeded.
        """
        if not self.ollama_available:
            logger.error(
                "[LocalReasoningEngine] install_model failed: Ollama not available"
            )
            return False

        if model_name not in self.available_models:
            logger.error(
                f"[LocalReasoningEngine] install_model: unknown model '{model_name}'. "
                f"Available: {', '.join(self.available_models.keys())}"
            )
            return False

        full_name = self.available_models[model_name]["full_name"]
        logger.info(
            f"[LocalReasoningEngine] Installing {full_name} "
            f"({self.available_models[model_name]['size']}) — this may take several minutes"
        )

        try:
            result = subprocess.run(
                ["ollama", "pull", full_name],
                capture_output=True,
                text=True,
            )
            if result.returncode == 0:
                logger.info(f"[LocalReasoningEngine] {full_name} installed successfully")
                self._detect_installed_models()
                return True
            else:
                logger.error(
                    f"[LocalReasoningEngine] install_model failed for {full_name}: "
                    f"{result.stderr}"
                )
                return False
        except Exception as e:
            logger.error(
                f"[LocalReasoningEngine] install_model failed with exception: {e}",
                exc_info=True,
            )
            return False

    # ------------------------------------------------------------------
    # Core inference
    # ------------------------------------------------------------------

    def query_local_model(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Optional[str]:
        """
        Query a local AI model via the Ollama /api/generate endpoint.

        The active model is resolved from the environment (OLLAMA_MODEL) unless
        an explicit full model name is passed as the `model` argument.

        Args:
            prompt: User prompt text.
            model: Override model name (full Ollama name, e.g. 'llama3.1:8b').
                   If None, uses OLLAMA_MODEL env var (default: qwen2.5-coder:32b).
            system_prompt: Optional system prompt for context.
            temperature: Sampling temperature (0.0–1.0).
            max_tokens: Maximum tokens in the response.

        Returns:
            str: Model response text, or None if unavailable/failed.
        """
        if not self.ollama_available:
            logger.warning(
                "[LocalReasoningEngine] query_local_model: Ollama not available — skipping"
            )
            return None

        # Resolve the model to use: explicit arg > env > catalogue lookup
        if model is not None:
            full_name = model
        else:
            env_model = _get_ollama_model()
            # Check if env_model is a catalogue key or already a full name
            if env_model in self.available_models:
                full_name = self.available_models[env_model]["full_name"]
            else:
                full_name = env_model

        if self.installed_models and full_name not in self.installed_models:
            logger.warning(
                f"[LocalReasoningEngine] query_local_model: model '{full_name}' "
                "not in installed models list — attempting anyway"
            )

        try:
            request_data: Dict[str, Any] = {
                "model": full_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                },
            }
            if system_prompt:
                request_data["system"] = system_prompt

            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=request_data,
                timeout=120,
            )

            if response.status_code == 200:
                return response.json().get("response", "").strip()
            else:
                logger.warning(
                    f"[LocalReasoningEngine] query_local_model returned status "
                    f"{response.status_code} for model '{full_name}'"
                )
                return None

        except requests.exceptions.Timeout:
            logger.warning(
                f"[LocalReasoningEngine] query_local_model timed out for model '{full_name}'"
            )
            return None
        except Exception as e:
            logger.error(
                f"[LocalReasoningEngine] query_local_model failed: {e}",
                exc_info=True,
            )
            return None

    # ------------------------------------------------------------------
    # Public knowledge-augmented query — called by brockston_core.py
    # ------------------------------------------------------------------

    def query_with_knowledge(
        self, question: str, domain: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Answer a question using BROCKSTON's learned knowledge base and a local model.

        Knowledge search is keyword-overlap-based (NOT semantic/embedding search).
        If Ollama is offline, logs a warning and returns {"response": ""}.

        Args:
            question: User's question.
            domain: Optional knowledge domain to constrain the search.

        Returns:
            dict: At minimum {"response": str}.
                  Also includes "confidence", "source", "model", and optionally
                  "knowledge_used" when local knowledge contributed.
        """
        if not question or not question.strip():
            logger.warning(
                "[LocalReasoningEngine] query_with_knowledge called with empty question"
            )
            return {"response": ""}

        relevant_knowledge = self._search_knowledge_base(question, domain)

        if relevant_knowledge:
            knowledge_context = "\n".join(
                f"- {k['topic']}: {k['summary'][:200]}..."
                for k in relevant_knowledge[:5]
            )

            system_prompt = (
                "You are BROCKSTON C, an AI advocate and researcher supporting autistic "
                "individuals, AAC users, nonverbal communicators, and the broader "
                "neurodivergent community. Use the following knowledge to answer the question "
                "with care, precision, and respect.\n\n"
                f"{knowledge_context}"
            )

            local_response = self.query_local_model(
                prompt=question,
                system_prompt=system_prompt,
                temperature=0.6,
            )

            if local_response:
                return {
                    "response": local_response,
                    "confidence": 0.85,
                    "source": "local_knowledge",
                    "model": _get_ollama_model(),
                    "knowledge_used": [k["topic"] for k in relevant_knowledge],
                }

        # No relevant local knowledge — try general model inference
        if self.ollama_available:
            local_response = self.query_local_model(prompt=question, temperature=0.7)
            if local_response:
                return {
                    "response": local_response,
                    "confidence": 0.6,
                    "source": "local_model",
                    "model": _get_ollama_model(),
                }
            else:
                logger.warning(
                    "[LocalReasoningEngine] query_with_knowledge: local model returned "
                    "no response — caller should fall back to external API"
                )
                return {"response": ""}
        else:
            logger.warning(
                "[LocalReasoningEngine] query_with_knowledge: Ollama offline — "
                "no local response available. Caller should fall back to external API."
            )
            return {"response": ""}

    # ------------------------------------------------------------------
    # Knowledge base search
    # ------------------------------------------------------------------

    def _search_knowledge_base(
        self, query: str, domain: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search BROCKSTON's learned knowledge files for relevant entries.

        Note: Uses keyword overlap (word set intersection), NOT semantic search.
        A match requires at least 20% of query words to appear in the content.

        Args:
            query: Search query string.
            domain: Optional subdirectory name to restrict the search.

        Returns:
            list: Matching knowledge entries sorted by descending relevance score.
        """
        relevant: List[Dict[str, Any]] = []

        search_dirs: List[Path] = []
        if domain:
            domain_dir = self.knowledge_dir / domain
            if domain_dir.exists():
                search_dirs.append(domain_dir)
        elif self.knowledge_dir.exists():
            search_dirs = [d for d in self.knowledge_dir.iterdir() if d.is_dir()]

        query_words = set(query.lower().split())

        for search_dir in search_dirs:
            for json_file in search_dir.glob("*.json"):
                try:
                    with open(json_file, "r") as f:
                        data = json.load(f)

                    content = (
                        f"{data.get('topic', '')} {data.get('summary', '')}".lower()
                    )
                    content_words = set(content.split())
                    overlap = len(query_words & content_words)

                    if overlap > 0:
                        relevance = overlap / len(query_words)
                        if relevance > 0.2:
                            relevant.append({
                                "topic": data.get("topic", ""),
                                "summary": data.get("summary", ""),
                                "domain": data.get("domain", ""),
                                "relevance": relevance,
                                "learned_at": data.get("learned_at", ""),
                            })
                except Exception as e:
                    logger.error(
                        f"[LocalReasoningEngine] _search_knowledge_base failed to read "
                        f"{json_file}: {e}",
                        exc_info=True,
                    )
                    continue

        relevant.sort(key=lambda x: x["relevance"], reverse=True)
        return relevant

    # ------------------------------------------------------------------
    # Routing helper
    # ------------------------------------------------------------------

    def should_use_external_api(
        self, question: str, local_result: Dict[str, Any]
    ) -> bool:
        """
        Advise whether the caller should escalate to an external API.

        Returns True when:
        - External fallback is enabled AND local confidence is below threshold.
        - No local response was produced.
        - The question contains temporal keywords suggesting fresh data is needed.

        Args:
            question: The original user question.
            local_result: The dict returned by query_with_knowledge.

        Returns:
            bool: True if external API should be tried.
        """
        if not self.fallback_to_external:
            return False

        if local_result.get("confidence", 0.0) < self.confidence_threshold:
            return True

        if not local_result.get("response"):
            return True

        temporal_triggers = [
            "latest", "current", "recent", "today", "news",
            "what's new", "update", "2025", "2024",
        ]
        if any(trigger in question.lower() for trigger in temporal_triggers):
            return True

        return False

    # ------------------------------------------------------------------
    # Model recommendation helper
    # ------------------------------------------------------------------

    def get_recommended_model(self, task_type: str) -> str:
        """
        Recommend the best available local model for a given task type.

        Falls back to the first installed model if the recommendation isn't installed,
        and to the env-configured default if nothing is installed.

        Args:
            task_type: e.g. 'coding', 'mathematics', 'conversation', 'general'.

        Returns:
            str: Catalogue key for the recommended model.
        """
        recommendations = {
            "coding": "qwen2.5-coder",
            "code_generation": "qwen2.5-coder",
            "debugging": "qwen2.5-coder",
            "mathematics": "qwen2.5",
            "reasoning": "qwen2.5",
            "analysis": "qwen2.5",
            "conversation": "llama3.1",
            "general": "llama3.1",
            "fast": "mistral",
        }

        recommended_key = recommendations.get(task_type.lower(), "llama3.1")
        recommended_info = self.available_models.get(recommended_key)

        if recommended_info and recommended_info["full_name"] in self.installed_models:
            return recommended_key

        # Recommended model not installed — fall back to any installed model
        for model_key, model_info in self.available_models.items():
            if model_info["full_name"] in self.installed_models:
                return model_key

        # Nothing installed — return env default as a key if possible
        env_model = _get_ollama_model()
        for model_key, model_info in self.available_models.items():
            if model_info["full_name"] == env_model:
                return model_key

        return "qwen2.5-coder"

    # ------------------------------------------------------------------
    # Status / diagnostics
    # ------------------------------------------------------------------

    def get_system_status(self) -> Dict[str, Any]:
        """Return a status snapshot of the local reasoning system."""
        return {
            "ollama_available": self.ollama_available,
            "ollama_url": self.ollama_url,
            "installed_models": self.installed_models,
            "active_model": _get_ollama_model(),
            "knowledge_dir": str(self.knowledge_dir),
            "use_local_first": self.use_local_first,
            "confidence_threshold": self.confidence_threshold,
            "available_model_catalogue": list(self.available_models.keys()),
        }

    def log_status(self) -> None:
        """Log the current system status at INFO level."""
        status = self.get_system_status()
        logger.info("[LocalReasoningEngine] === System Status ===")
        logger.info(f"  Ollama available:  {status['ollama_available']}")
        logger.info(f"  Ollama URL:        {status['ollama_url']}")
        logger.info(f"  Active model:      {status['active_model']}")
        logger.info(f"  Installed models:  {len(status['installed_models'])}")
        if status["installed_models"]:
            for m in status["installed_models"][:5]:
                logger.info(f"    • {m}")
        logger.info(f"  Use local first:   {status['use_local_first']}")
        logger.info(f"  Confidence threshold: {status['confidence_threshold']}")
        if not status["ollama_available"]:
            logger.warning(
                "[LocalReasoningEngine] To enable local AI: "
                "install Ollama from https://ollama.ai, "
                f"then run: ollama pull {status['active_model']}"
            )
