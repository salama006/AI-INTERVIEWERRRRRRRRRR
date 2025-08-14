# app/api/tts.py
from fastapi import APIRouter
from ..utils.helpers import format_response

router = APIRouter()

def generate_audio(text: str):
    """
    Mock function to convert text to audio.
    """
    audio_url = "https://localai.mock/audio.mp3"
    response = {
        "data": {
            "audio_url": audio_url,
            "duration": 10.0
        },
        "success": True
    }
    return response

@router.post("/generate", tags=["TTS"])
def tts_endpoint(text: str):
    return generate_audio(text)

