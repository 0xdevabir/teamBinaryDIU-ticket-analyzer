from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://ticket_user:ticket_secret@localhost:5432/ticket_analyzer"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:80"

    hf_api_token: str = ""
    hf_classification_model: str = "facebook/bart-large-mnli"
    hf_summarization_model: str = "facebook/bart-large-cnn"
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
