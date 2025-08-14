# backend/app/main.py
import os
import json
import asyncio
import websockets
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import heygen_ws

# ✅ Load env vars first
load_dotenv()

# ✅ Import routers after env load
from backend.app.api import heygen, local_ai, tts, avatarify, pipeline

# ✅ Create FastAPI app
app = FastAPI(
    title="AI Interviewer Backend",
    description="Backend service for AI Interviewer project",
    version="1.0.0"
)

# ✅ Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routers
app.include_router(heygen.router, prefix="/heygen", tags=["HeyGen"])
app.include_router(local_ai.router, prefix="/local", tags=["Local AI"])
app.include_router(tts.router, prefix="/tts", tags=["TTS"])
app.include_router(avatarify.router, prefix="/avatarify", tags=["Avatarify"])
app.include_router(pipeline.router, prefix="/pipeline", tags=["Pipeline"])
app.include_router(heygen_ws.router)


@app.get("/")
def root():
    return {"message": "AI Interviewer backend is running!"}


@app.get("/get-heygen-token")
def get_heygen_token():
    """Return HeyGen API token from environment variables."""
    token = os.getenv("HEYGEN_API_KEY")
    if not token:
        return {"error": "HEYGEN_API_KEY not found in environment variables"}
    return {"token": token}


# ✅ WebSocket proxy to HeyGen
@app.websocket("/ws/heygen")
async def heygen_ws(websocket: WebSocket):
    await websocket.accept()
    heygen_api_key = os.getenv("HEYGEN_API_KEY")

    if not heygen_api_key:
        await websocket.send_text(json.dumps({"error": "HEYGEN_API_KEY missing"}))
        await websocket.close()
        return

    heygen_ws_url = f"wss://api.heygen.com/v1/realtime?api_key={heygen_api_key}"

    try:
        async with websockets.connect(heygen_ws_url) as heygen_socket:

            async def forward_to_heygen():
                try:
                    while True:
                        msg = await websocket.receive_text()
                        await heygen_socket.send(msg)
                except WebSocketDisconnect:
                    pass

            async def forward_to_client():
                try:
                    while True:
                        msg = await heygen_socket.recv()
                        await websocket.send_text(msg)
                except websockets.exceptions.ConnectionClosed:
                    pass

            await asyncio.gather(forward_to_heygen(), forward_to_client())

    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
        await websocket.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",      # Module path to your FastAPI app
        host="0.0.0.0",              # Accept connections from all interfaces
        port=int(os.getenv("PORT", 8000)),  # Use PORT from .env or default 8000
        reload=True                   # Auto-reload on code changes
    )

