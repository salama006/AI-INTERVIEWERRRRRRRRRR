# app/api/avatarify.py
from fastapi import APIRouter
from ..utils.helpers import format_response

router = APIRouter()

def generate_video(audio_url: str):
    """
    Mock function to convert audio to a talking avatar video.
    """
    video_url = "https://localai.mock/video.mp4"
    response = {
        "data": {
            "video_url": video_url,
            "duration": 12.5
        },
        "success": True
    }
    return response

@router.post("/generate", tags=["Avatarify"])
def avatar_endpoint(audio_url: str):
    return generate_video(audio_url)

