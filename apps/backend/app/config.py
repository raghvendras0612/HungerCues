from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/baby_tracker"

    # Firebase
    firebase_project_id: str = ""
    firebase_service_account_key_path: str = ""

    # Cloudflare R2
    r2_endpoint: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "baby-tracker"

    # Gemma AI Service
    gemma_api_url: str = "http://localhost:8080"
    gemma_api_key: str = ""

    # Gemini AI Service
    gemini_api_key: str = ""


    # App
    environment: str = "development"


settings = Settings()
