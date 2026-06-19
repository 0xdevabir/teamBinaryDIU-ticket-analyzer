from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://ticket_user:ticket_secret@localhost:5432/ticket_analyzer"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:80"

    # AI inference: local (CPU) | api (HF Inference API) | auto (local → api → fallback)
    ai_inference_mode: str = "auto"
    hf_api_token: str = ""

    # Lightweight models — ~250 MB + ~300 MB, fast on CPU
    hf_zero_shot_model: str = "typeform/distilbert-base-uncased-mnli"
    hf_summarization_model: str = "sshleifer/distilbart-cnn-12-6"
    ai_request_timeout: int = 30

    ticket_categories: list[str] = [
        "Billing",
        "Technical",
        "Account",
        "Feature Request",
        "Other",
    ]

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
