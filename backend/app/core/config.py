from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="forbid"
    )
    
    # Database
    database_url: str = "sqlite:///./mentor.db"
    
    # JWT Settings
    secret_key: str = Field(
        default="your-secret-key-here-change-in-production-NEVER-USE-DEFAULT",
        description="JWT secret key - MUST be changed in production",
        min_length=32
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Security validation
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Warn if using default secret key
        if self.secret_key == "your-secret-key-here-change-in-production-NEVER-USE-DEFAULT":
            import warnings
            warnings.warn(
                "WARNING: Using default JWT secret key! This is extremely insecure. "
                "Set the SECRET_KEY environment variable in production.",
                UserWarning,
                stacklevel=2
            )
    
    # CORS Settings - Store as string and parse later
    cors_origins_str: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="CORS origins as comma-separated string"
    )
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as a list"""
        return [origin.strip() for origin in self.cors_origins_str.split(",")]
    
    # AI/LLM Settings - Primary Provider: Google Gemini
    google_ai_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.0-flash"
    gemini_max_tokens: int = 10000
    gemini_temperature: float = 0.7
    
    # Alternative AI providers (for fallback)
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-3.5-turbo"
    openai_max_tokens: int = 500
    openai_temperature: float = 0.7
    
    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-3-haiku-20240307"
    
    # AI Provider Priority (gemini, openai, anthropic)
    ai_provider_priority_str: str = Field(
        default="gemini,openai,anthropic",
        description="AI provider priority as comma-separated string"
    )
    
    @property
    def ai_provider_priority(self) -> List[str]:
        """Get AI provider priority as a list"""
        return [provider.strip() for provider in self.ai_provider_priority_str.split(",")]
    
    # Rate limiting
    ai_requests_per_minute: int = 10
    ai_requests_per_hour: int = 100
    ai_requests_per_day: int = 500
    
    # AI Safety and Security
    max_conversation_length: int = 50
    max_message_length: int = 2000
    ai_timeout_seconds: int = 30
    
    # Request limits and timeouts
    max_request_size: int = 1024 * 1024  # 1 MB
    request_timeout_seconds: int = 30
    max_json_payload_size: int = 100 * 1024  # 100 KB for JSON payloads
    
    # Prompt Engineering
    enable_conversation_memory: bool = True
    conversation_context_limit: int = 5
    


settings = Settings()
