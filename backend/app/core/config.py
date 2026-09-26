from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "MarketMind API"
    app_version: str = "0.1.0"
    environment: str = "development"

    database_url: str

    gemini_api_key: str
    gemini_model: str = "gemini-3.8-flash"

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()