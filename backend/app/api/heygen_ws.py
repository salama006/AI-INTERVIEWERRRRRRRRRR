# backend/app/api/heygen_ws.py
import os
import json
import asyncio
import websockets
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
HEYGEN_WS_URL = f"wss://api.heygen.com/v1/realtime?api_key={HEYGEN_API_KEY}"

# store active connections if needed
active_connections = set()


@router.websocket("/ws-heygen")
async def heygen_ws(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)

    if not HEYGEN_API_KEY:
        await websocket.send_text(json.dumps({"error": "HEYGEN_API_KEY missing"}))
        await websocket.close()
        return

    heygen_socket = None

    try:
        # Connect to HeyGen realtime WebSocket
        heygen_socket = await websockets.connect(HEYGEN_WS_URL)

        async def forward_to_heygen():
            try:
                while True:
                    msg = await websocket.receive_text()
                    data = json.loads(msg)

                    # handle SDP offer
                    if data.get("type") == "sdpOffer":
                        payload = {
                            "sdp": data["sdp"],
                            "avatar_id": data["avatarId"],
                            "tts": {"text": data.get("greeting", ""), "voice": "en_us_001"},
                        }
                        await heygen_socket.send(json.dumps(payload))

                    # handle ICE candidate
                    elif data.get("type") == "iceCandidate":
                        await heygen_socket.send(json.dumps({"candidate": data["candidate"]}))

            except WebSocketDisconnect:
                pass

        async def forward_to_client():
            try:
                while True:
                    msg = await heygen_socket.recv()
                    res = json.loads(msg)

                    # If HeyGen sends SDP answer
                    if "sdp" in res or "sdpAnswer" in res:
                        await websocket.send_text(
                            json.dumps({"type": "sdpAnswer", "sdp": res.get("sdp") or res.get("sdpAnswer")})
                        )
                    # If HeyGen sends ICE candidate
                    if "candidate" in res:
                        await websocket.send_text(json.dumps({"type": "iceCandidate", "candidate": res["candidate"]}))

            except websockets.exceptions.ConnectionClosed:
                pass

        await asyncio.gather(forward_to_heygen(), forward_to_client())

    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))
        await websocket.close()

    finally:
        if heygen_socket:
            await heygen_socket.close()
        active_connections.discard(websocket)

