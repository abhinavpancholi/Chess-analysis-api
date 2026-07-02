from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    CHESS_COM_BASE_URL: str = "https://api.chess.com/pub"
    OPENAI_API_KEY: str = ""
    # Comma-separated string (Railway dashboard env vars are plain strings,
    # not JSON) e.g. "https://myapp.vercel.app,http://localhost:5173"
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        # Railway's Postgres plugin injects DATABASE_URL as
        # "postgres://..." or "postgresql://..." with no driver specified.
        # SQLAlchemy's async engine needs an explicit async driver, so we
        # force it to the psycopg3 async driver regardless of what's given.
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        if v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()