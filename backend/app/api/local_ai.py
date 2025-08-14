# app/api/local_ai.py
import os
from fastapi import APIRouter
from pydantic import BaseModel
from ..models import HeyGenResponse, QuestionRequest   # ✅ relative import

import time

router = APIRouter()

# GET route for browser testing (won't break POST)
@router.get("/ask")
def test_get():
    return {"message": "Use POST to ask questions at this endpoint!"}

# POST route (actual AI endpoint)
@router.post("/ask", response_model=HeyGenResponse)
def ask_local_ai(request: QuestionRequest):
    answer_text = f"[Local AI mock] Answer to: '{request.question}'"
    audio_url = "https://localai.mock/audio.mp3"
    video_url = "https://localai.mock/video.mp4"
    duration = 10.0
    transcript = answer_text

    return HeyGenResponse(
        answer_text=answer_text,
        audio_url=audio_url,
        video_url=video_url,
        duration=duration,
        transcript=transcript,
        is_mock=True
    )
