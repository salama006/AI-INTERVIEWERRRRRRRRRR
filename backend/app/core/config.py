import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "AI Interviewer Backend"
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"
    
    HEYGEN_API_KEY: str = os.getenv("HEYGEN_API_KEY", "")
    HEYGEN_BASE_URL: str = os.getenv("HEYGEN_BASE_URL", "https://api.heygen.com/v1")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
