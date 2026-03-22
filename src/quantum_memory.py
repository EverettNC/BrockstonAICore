import requests
from typing import Dict
import time


class QuantumMemory:
    def __init__(self, derek_api_url: str = "http://localhost:8010"):
        self.derek_api = derek_api_url

    async def log_quantum_interaction(self, user_id: str, trace: Dict):
        """Log quantum trace to Derek's RAG system"""
        payload = {
            "namespace": f"user_{user_id}_quantum",
            "path": None,  # In-memory data
            "data": {
                "top_state": trace["top_state"],
                "fusion_prob": trace["fusion_prob"],
                "valence_arc": trace["valence_arc"],
                "timestamp": time.time(),
            },
        }

        # Derek ingests this for pattern learning
        response = requests.post(f"{self.derek_api}/ingest", json=payload)

        return response.json()

    async def get_user_patterns(self, user_id: str, query: str):
        """Query Derek's RAG for user patterns"""
        response = requests.post(
            f"{self.derek_api}/ask",
            json={"namespace": f"user_{user_id}_quantum", "query": query, "k": 5},
        )

        return response.json()


# In quantum_fuse endpoint integration:
# Note: This is usually imported or decorated in the main app file
# @app.post("/quantum_fuse")
async def quantum_fuse_extended(payload, fusion_engine):
    try:
        phrase, trace = fusion_engine.forward(payload)

        # Log to Derek's memory
        await quantum_memory.log_quantum_interaction(payload.user_id, trace)

        # Optional: Query patterns for adaptive behavior
        patterns = await quantum_memory.get_user_patterns(
            payload.user_id,
            f"What are common patterns when valence > {payload.valence}?",
        )

        return {"output": phrase, "trace": trace, "patterns": patterns}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Quantum error: {str(e)}")
