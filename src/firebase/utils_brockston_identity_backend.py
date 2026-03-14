# brockston_identity.py
import os
import json
import logging
from conversation_engine import ConversationEngine
from memory_engine import MemoryEngine
import yaml
from pathlib import Path

# Resolve path relative to project root
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
manifest_path = Path(PROJECT_ROOT) / "config" / "brockston_manifest.yaml"

if not manifest_path.exists():
    raise FileNotFoundError(f"❌ BROCKSTON manifest not found at {manifest_path}")

with open(manifest_path, "r", encoding="utf-8") as file:
    brockston_manifest = yaml.safe_load(file)

logger = logging.getLogger(__name__)


class BROCKSTON:
    def __init__(self, identity_path="brockston_identity.json"):
        self.identity = self.load_identity(identity_path)

        # pull memory path from manifest
        # pull memory path from manifest and ensure it's absolute
        memory_path_rel = brockston_manifest.get("memory_path", "./brockston_memory")
        if memory_path_rel.startswith("./"):
            memory_path = os.path.join(PROJECT_ROOT, memory_path_rel[2:])
        elif not os.path.isabs(memory_path_rel):
            memory_path = os.path.join(PROJECT_ROOT, memory_path_rel)
        else:
            memory_path = memory_path_rel

        os.makedirs(memory_path, exist_ok=True)

        # initialize memory engine with absolute path
        self.memory_engine = MemoryEngine(
            file_path=os.path.join(memory_path, "semantic_memory.json")
        )
        self.conversation_engine = ConversationEngine()

        logger.info(f"✅ BROCKSTON initialized with memory engine at: {memory_path}")

        logger.info(
            "BROCKSTON initialized with identity: %s",
            self.identity.get("name", "Unknown"),
        )

    def load_identity(self, path):
        try:
            with open(path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Identity file {path} not found, using defaults")
            return {"name": "BROCKSTON", "role": "AI Assistant"}

    def think(self, input_text):
        return {"output": f"I heard: {input_text}"}


# ✅ Global instance for import
brockston = BROCKSTON()

# ==============================================================================
# © 2025 Everett Nathaniel Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
#
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================
