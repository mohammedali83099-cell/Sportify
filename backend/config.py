import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Ensure .env is always actively loaded/refreshed
load_dotenv(override=True)


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./athletiq.db"
    SECRET_KEY: str = "change-this-secret-key-must-be-at-least-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Gemini API configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-2.5-flash"

    # Resend Email API
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Sportify <onboarding@resend.dev>"

    # Redis Cache & Ephemeral Storage
    REDIS_URL: str = ""

    # OTP Security Parameters
    OTP_EXPIRE_MINUTES: int = 10
    OTP_COOLDOWN_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5

    UPLOAD_DIR: str = "./uploads"
    MAX_VIDEO_SIZE_MB: int = 100

    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if "sslmode=" in url:
            url = url.replace("sslmode=", "ssl=")
        return url

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
