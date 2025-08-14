# backend/api/heygen.py
import requests
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

HEYGEN_API_KEY = "Zjk3N2RhYzgyMjY2NDNjYmIxZTgxZTA1YmUwYzhmYTUtMTc1NTE4NjI4NQ=="
HEYGEN_BASE_URL = "https://api.heygen.com/v1"  # base URL

# ---------- Request/Response Models ----------
class QuestionRequest(BaseModel):
    question: str

class HeyGenResponse(BaseModel):
    answer_text: str
    video_url: str
    audio_url: str
    duration: float
    transcript: str
    is_mock: bool = False

class StartAvatarRequest(BaseModel):
    sdp: str
    avatarId: str
    greeting: str

class StartAvatarResponse(BaseModel):
    sdpAnswer: str
    error: str | None = None  # optional field for errors

# ---------- Existing Ask Route ----------
@router.post("/ask", response_model=HeyGenResponse)
def ask_question(request: QuestionRequest):
    fallback = HeyGenResponse(
        answer_text=f"HeyGen mock answer for: '{request.question}'",
        video_url="https://heygen.mock/video.mp4",
        audio_url="https://heygen.mock/audio.mp3",
        duration=12.5,
        transcript=f"Transcript of your question: '{request.question}'",
        is_mock=True
    )

    if not HEYGEN_API_KEY or not HEYGEN_BASE_URL:
        return fallback

    headers = {
        "Authorization": f"Bearer {HEYGEN_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"question": request.question}

    try:
        response = requests.post(f"{HEYGEN_BASE_URL}/ask", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return HeyGenResponse(
            answer_text=data.get("answer_text", fallback.answer_text),
            video_url=data.get("video_url", fallback.video_url),
            audio_url=data.get("audio_url", fallback.audio_url),
            duration=data.get("duration", fallback.duration),
            transcript=data.get("transcript", fallback.transcript),
            is_mock=False
        )

    except requests.RequestException as e:
        print(f"❌ HeyGen API error: {e}")
        return fallback

# ---------- Mock Start Avatar Route ----------
@router.post("/start-avatar", response_model=StartAvatarResponse)
def start_avatar(data: StartAvatarRequest):
    """
    Returns a mock SDP so frontend WebRTC flow works for testing.
    """
    mock_sdp = (
        "v=0\r\n"
        "o=- 0 0 IN IP4 127.0.0.1\r\n"
        "s=Mock SDP\r\n"
        "t=0 0\r\n"
        "a=group:BUNDLE 0\r\n"
        "m=video 9 UDP/TLS/RTP/SAVPF 96\r\n"
        "c=IN IP4 0.0.0.0\r\n"
        "a=rtpmap:96 VP8/90000\r\n"
    )
    return StartAvatarResponse(sdpAnswer=mock_sdp)

