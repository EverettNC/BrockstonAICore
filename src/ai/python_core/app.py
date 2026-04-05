import os
from typing import List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

import anthropic

logger = logging.getLogger(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatBody(BaseModel):
    messages: List[Message]


@app.get("/")
def root():
    return {"ok": True}


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/api/chat")
async def chat(body: ChatBody):
    if not client:
        return {"text": "API Key not configured. Core Intelligence offline."}
        
    try:
        # Convert Pydantic models to dicts suitable for Anthropic
        # Note: Anthropic uses 'user' and 'assistant' roles, and handles system differently
        messages = []
        for m in body.messages:
            role = m.role if m.role in ["user", "assistant"] else "user" # Fallback mapping
            messages.append({"role": role, "content": m.content})
            
        r = client.messages.create(
            model="claude-3-5-sonnet-latest", 
            messages=messages,
            max_tokens=1024
        )
        text = r.content[0].text if r.content else "…"
        return {"text": text}
    except Exception as e:
        logger.error(f"Chat API error: {e}")
        return {"text": f"Error: {e}"}
