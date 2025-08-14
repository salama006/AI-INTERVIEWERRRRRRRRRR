from pydantic import BaseModel

class QuestionRequest(BaseModel):
    question: str

class HeyGenResponse(BaseModel):
    answer_text: str
    video_url: str
    audio_url: str
    duration: float
    transcript: str
    is_mock: bool  # True if this is a fallback/mock response
