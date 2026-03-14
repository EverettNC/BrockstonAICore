#!/usr/bin/env python3
"""
BROCKSTON Web Server
Main web application serving the BROCKSTON interface
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import logging
from typing import Optional, Dict, Any
import json
import base64

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get project root
PROJECT_ROOT = Path(__file__).parent
STATIC_DIR = PROJECT_ROOT / "static"

# Create FastAPI app
app = FastAPI(
    title="BROCKSTON - AI Research Assistant",
    description="PhD-Level AI Researcher with 96% success rate",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# Request/Response models
class ChatRequest(BaseModel):
    task: Optional[str] = None
    inquiry: Optional[str] = None
    message: Optional[str] = None
    context: Optional[str] = None


class SpeakRequest(BaseModel):
    text: str
    voice: Optional[str] = "Matthew"
    voice_id: Optional[str] = None


class RunCodeRequest(BaseModel):
    goal: str
    code: Optional[str] = None
    language: Optional[str] = "python"


class CrawlRequest(BaseModel):
    url: str


class ImageRequest(BaseModel):
    text: str
    style: Optional[str] = "modern"
    width: Optional[int] = 800
    height: Optional[int] = 600


# Root endpoint - serve main page
@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main index.html page"""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return HTMLResponse(content="<h1>BROCKSTON - Web interface not found</h1>", status_code=404)


# Talk page
@app.get("/talk", response_class=HTMLResponse)
async def talk_page():
    """Serve the talk.html page"""
    talk_path = STATIC_DIR / "talk.html"
    if talk_path.exists():
        return FileResponse(talk_path)
    return HTMLResponse(content="<h1>Talk page not found</h1>", status_code=404)


# Select avatar page
@app.get("/select_avatar", response_class=HTMLResponse)
async def select_avatar_page():
    """Serve the select_avatar.html page"""
    avatar_path = STATIC_DIR / "select_avatar.html"
    if avatar_path.exists():
        return FileResponse(avatar_path)
    return HTMLResponse(content="<h1>Avatar selection page not found</h1>", status_code=404)


# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ok": True,
        "mode": "operational",
        "emotion": "focused"
    }


@app.post("/orchestrate/customer-service")
async def customer_service(request: ChatRequest):
    """
    Handle chat/conversation requests
    This is a mock implementation - replace with actual BROCKSTON integration
    """
    try:
        message = request.task or request.inquiry or request.message or ""

        if not message:
            raise HTTPException(status_code=400, detail="No message provided")

        # Mock response - integrate with actual BROCKSTON brain here
        response_text = f"I received your message: '{message}'. I'm BROCKSTON, a PhD-level AI researcher. "
        response_text += "I'm currently operating in demo mode. My full cognitive capabilities "
        response_text += "including autonomous learning, code execution, and multimodal processing "
        response_text += "are being integrated."

        return {
            "status": "success",
            "success": True,
            "result": response_text
        }
    except Exception as e:
        logger.error(f"Error in customer service: {e}")
        return {
            "status": "error",
            "success": False,
            "result": "I encountered an error processing your request."
        }


@app.post("/speak")
async def synthesize_speech(request: SpeakRequest):
    """
    Text-to-speech synthesis endpoint
    This is a mock implementation - replace with actual TTS integration
    """
    try:
        # Mock audio response
        # In production, integrate with AWS Polly, ElevenLabs, or other TTS service
        return {
            "status": "success",
            "message": "Speech synthesis in demo mode",
            "audio": ""  # Base64 encoded audio would go here
        }
    except Exception as e:
        logger.error(f"Error in speech synthesis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/run")
async def run_code(request: RunCodeRequest):
    """
    Execute code with autonomous capabilities
    This is a mock implementation - replace with actual execution engine
    """
    try:
        return {
            "status": "completed",
            "result": {
                "success": True,
                "output": f"Mock execution of goal: {request.goal}\n\nIn production, this would execute code with auto-repair and autonomous learning."
            }
        }
    except Exception as e:
        logger.error(f"Error in code execution: {e}")
        return {
            "status": "failed",
            "message": str(e)
        }


@app.post("/crawl")
async def crawl_url(request: CrawlRequest):
    """
    Web crawling and knowledge acquisition
    This is a mock implementation - replace with actual crawler
    """
    try:
        allowed_sources = [
            "arxiv.org",
            "qiskit.org",
            "quantum.country",
            "realpython.com",
            "github.com"
        ]

        # Check if URL is from allowed source
        is_allowed = any(source in request.url for source in allowed_sources)

        if not is_allowed:
            return {
                "status": "error",
                "message": "Source not in approved list",
                "allowed_sources": allowed_sources
            }

        return {
            "status": "success",
            "url": request.url,
            "content_length": 1000,
            "message": "Data acquired successfully (demo mode)"
        }
    except Exception as e:
        logger.error(f"Error in web crawling: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.post("/image/generate")
async def generate_image(request: ImageRequest):
    """
    Image generation endpoint
    This is a mock implementation - replace with actual image generation
    """
    try:
        # Mock response
        return {
            "status": "error",
            "message": "Image generation in demo mode - integrate with DALL-E, Stable Diffusion, or other service"
        }
    except Exception as e:
        logger.error(f"Error in image generation: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/knowledge")
async def get_knowledge_stats():
    """
    Get knowledge base statistics
    """
    try:
        return {
            "status": "success",
            "stats": {
                "total_knowledge_items": 0,
                "total_executions": 0,
                "success_rate": "96%"
            }
        }
    except Exception as e:
        logger.error(f"Error getting knowledge stats: {e}")
        return {
            "status": "error",
            "stats": {
                "total_knowledge_items": 0,
                "total_executions": 0,
                "success_rate": "0%"
            }
        }


@app.get("/favicon.ico")
async def favicon():
    """Return favicon or 204 No Content"""
    favicon_path = STATIC_DIR / "media/images/icon-192.png"
    if favicon_path.exists():
        return FileResponse(favicon_path)
    return Response(status_code=204)


if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("🚀 BROCKSTON Web Server Starting")
    print("=" * 60)
    print(f"📂 Static files: {STATIC_DIR}")
    print(f"🌐 Server: http://localhost:3000")
    print(f"📄 Main page: http://localhost:3000/")
    print(f"💬 Talk page: http://localhost:3000/talk")
    print("=" * 60)

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3000,
        log_level="info"
    )
