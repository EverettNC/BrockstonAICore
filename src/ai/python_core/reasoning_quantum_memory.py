import requests
from typing import Dict
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class QuantumPayload(BaseModel):
    user_id: str
    valence: float


class QuantumMemory:
    def __init__(self, brockston_api_url: str = "http://localhost:8010"):
        self.brockston_api = brockston_api_url

    async def log_quantum_interaction(self, user_id: str, trace: Dict):
        """Log quantum trace to BROCKSTON's RAG system"""
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

        # BROCKSTON ingests this for pattern learning
        response = requests.post(f"{self.brockston_api}/ingest", json=payload)

        return response.json()

    async def get_user_patterns(self, user_id: str, query: str):
        """Query BROCKSTON's RAG for user patterns"""
        response = requests.post(
            f"{self.brockston_api}/ask",
            json={"namespace": f"user_{user_id}_quantum", "query": query, "k": 5},
        )

        return response.json()


# In quantum_fuse endpoint:
quantum_memory = QuantumMemory()
fusion_engine = None  # TODO: Initialize QuantumFusion engine


@app.post("/quantum_fuse")
async def quantum_fuse(payload: QuantumPayload):
    try:
        phrase, trace = fusion_engine.forward(payload)

        # Log to BROCKSTON's memory
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
