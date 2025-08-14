# app/api/pipeline.py
from fastapi import APIRouter
from ..models import HeyGenResponse, QuestionRequest
from ..utils.helpers import format_response

router = APIRouter()

@router.post("/ask", response_model=HeyGenResponse)
def full_pipeline(request: QuestionRequest):
    """
    Mock full AI pipeline:
    1️⃣ Generate text answer (local AI)
    2️⃣ Generate TTS audio (mocked)
    3️⃣ Generate avatar/video (mocked)
    """
    # Step 1: Local AI text
    answer_text = f"[Local AI mock] Answer to: '{request.question}'"

    # Step 2: TTS (mock)
    audio_url = "https://localai.mock/audio.mp3"

    # Step 3: Avatar/video (mock)
    video_url = "https://localai.mock/video.mp4"

    duration = 12.5
    transcript = answer_text

    response = HeyGenResponse(
        answer_text=answer_text,
        audio_url=audio_url,
        video_url=video_url,
        duration=duration,
        transcript=transcript,
        is_mock=True
    )

    return format_response(response.dict())
