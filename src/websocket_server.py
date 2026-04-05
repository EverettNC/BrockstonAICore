"""BROCKSTON WebSocket Server — Real-time communication endpoint.

Provides WebSocket-based communication for the BROCKSTON dashboard,
including chat, TTS, and memory operations.

NOTE: This file was previously named crisis_hotline.py, which was
misleading — it contains no crisis logic. Crisis detection lives in
src/ai/python_core/core/crisis_detection.py (Cardinal Rule 13).
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional
import json
import logging

logger = logging.getLogger(__name__)


# Example in-memory store; replace with your actual implementation
class Memory:
    def __init__(self):
        self._data = {}

    def store(self, key, value):
        self._data[key] = value

    def retrieve(self, key):
        return self._data.get(key)


memory = Memory()

app = FastAPI(title="BROCKSTON Dashboard")


# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            f"✅ WebSocket connected. Total connections: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(
            f"❌ WebSocket disconnected. Total connections: {len(self.active_connections)}"
        )

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


# WebSocket endpoint for real-time communication
@app.websocket("/ws/brockston")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            logger.info(f"📨 Received: {data}")

            # Process the message
            try:
                request = json.loads(data)
                command = request.get("command")
                payload = request.get("payload", {})

                # Handle different commands
                if command == "tts":
                    # Generate speech immediately
                    text = payload.get("text", "")
                    response = await generate_tts_response(text)
                    await manager.send_personal_message(
                        json.dumps({"type": "tts_response", "data": response}),
                        websocket,
                    )

                elif command == "chat":
                    # BROCKSTON chat response
                    message = payload.get("message", "")
                    response = await brockston_chat_response(message)
                    await manager.send_personal_message(
                        json.dumps({"type": "chat_response", "data": response}),
                        websocket,
                    )

                elif command == "memory":
                    # Store or retrieve memory
                    action = payload.get("action")  # "store" or "retrieve"
                    if action == "store":
                        key = payload.get("key")
                        value = payload.get("value")
                        memory.store(key, value)
                        await manager.send_personal_message(
                            json.dumps({"type": "memory_stored", "key": key}), websocket
                        )
                    elif action == "retrieve":
                        key = payload.get("key")
                        value = memory.retrieve(key)
                        await manager.send_personal_message(
                            json.dumps(
                                {"type": "memory_retrieved", "key": key, "value": value}
                            ),
                            websocket,
                        )

                else:
                    await manager.send_personal_message(
                        json.dumps({"type": "error", "message": "Unknown command"}),
                        websocket,
                    )

            except json.JSONDecodeError:
                # Plain text message
                response = await brockston_chat_response(data)
                await manager.send_personal_message(response, websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket)


# =============================================================================
# BROCKSTON INSTANCE — Must be injected before the server starts
# =============================================================================

_brockston_instance = None


def set_brockston_instance(instance) -> None:
    """Inject the Brockston brain instance before starting the server.

    Must be called before any WebSocket connections are accepted.
    Cardinal Rule 1: It has to actually work.
    """
    global _brockston_instance
    _brockston_instance = instance
    logger.info("BROCKSTON instance injected into WebSocket server")


def _get_brockston():
    """Get the injected Brockston instance or raise loud.

    Cardinal Rule 6: Fail loud, fast, and honest.
    """
    if _brockston_instance is None:
        error_msg = (
            "BROCKSTON instance not initialized. "
            "Call set_brockston_instance() before starting the WebSocket server. "
            "Cardinal Rule 1: It has to actually work."
        )
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    return _brockston_instance


# Helper functions
async def generate_tts_response(text: str) -> Dict:
    """Generate TTS audio for the given text"""
    try:
        brockston = _get_brockston()
        audio_data = brockston.speak(text)
        return {"success": True, "audio": audio_data, "text": text}
    except RuntimeError:
        raise  # Re-raise initialization errors — don't swallow (Rule 6)
    except Exception as e:
        logger.error(f"TTS generation failed: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


async def brockston_chat_response(message: str) -> str:
    """Get BROCKSTON's chat response"""
    try:
        brockston = _get_brockston()
        response = brockston.process_input(message)
        return response
    except RuntimeError:
        raise  # Re-raise initialization errors — don't swallow (Rule 6)
    except Exception as e:
        logger.error(f"Chat response failed: {e}", exc_info=True)
        return f"Error: {str(e)}"
