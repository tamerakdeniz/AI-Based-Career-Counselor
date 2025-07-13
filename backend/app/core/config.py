from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./mentor.db"
    
    # JWT Settings
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS Settings
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]
    
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"

    class Config:
        env_file = ".env"

settings = Settings()
