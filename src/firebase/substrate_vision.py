"""
Substrate Vision — Codebase Ingestion for Self-Awareness.
Allows BROCKSTON to "see" its own implementation.
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class SubstrateVision:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.target_dirs = ["backend", "ai", "config"]
        # Essential core files to prioritize for self-awareness
        self.core_files = [
            "backend/core/memory_engine.py",
            "backend/core/ai_orchestrator.py",
            "ai/christman_core_v5.py",
            "backend/api_server.py"
        ]

    def crawl_and_digest(self) -> List[Dict[str, Any]]:
        """
        Reads core files and returns a list of memory entries
        representing BROCKSTON's substrate.
        """
        digests = []
        for rel_path in self.core_files:
            abs_path = self.project_root / rel_path
            if abs_path.exists():
                try:
                    with open(abs_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                        content = "".join(lines)
                        
                        # Create a digest for the whole file
                        digests.append({
                            "type": "substrate_truth",
                            "file": rel_path,
                            "content": content,
                            "summary": f"Source code for {rel_path} (Substrate Version 5.0)",
                            "timestamp": os.path.getmtime(abs_path)
                        })
                        
                        # Chunking logic for specific functional blocks can be added here
                        logger.info(f"Ingested substrate: {rel_path}")
                except Exception as e:
                    logger.error(f"Failed to ingest substrate {rel_path}: {e}")
        return digests

    def get_substrate_context(self) -> str:
        """Returns a concise description of the system's own architecture."""
        context = [
            "CORE ARCHITECTURE (Substrate Awareness):",
            f"- Project Root: {self.project_root}",
            "- Core Language: Python 3.11+",
            "- Identity Engine: ai/christman_core_v5.py",
            "- Orchestrator: backend/core/ai_orchestrator.py",
            "- Memory Logic: backend/core/memory_engine.py",
            "- API Entry: backend/api_server.py"
        ]
        return "\n".join(context)
