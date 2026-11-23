from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins_raw: str = "http://localhost:3000"
    allowed_hosts_raw: str = "localhost,127.0.0.1"
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_jwks_url: str = ""
    supabase_audience: str = "authenticated"
    supabase_storage_bucket: str = "documents"
    weaviate_url: str = ""
    weaviate_api_key: str = ""
    max_upload_mb: int = 50

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("app_env")
    @classmethod
    def normalize_env(cls, value: str) -> str:
        return (value or "development").strip().lower()

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        """En producción, rechazar configuraciones inseguras al arrancar."""
        if self.is_production:
            origins = self.cors_origins
            if not origins or "*" in origins:
                raise ValueError(
                    "CORS_ORIGINS_RAW debe contener orígenes explícitos sin '*' en producción"
                )
            hosts = self.allowed_hosts
            if not hosts or "*" in hosts:
                raise ValueError(
                    "ALLOWED_HOSTS_RAW debe contener hosts explícitos sin '*' en producción"
                )
            if not self.supabase_url or not self.supabase_anon_key:
                raise ValueError(
                    "SUPABASE_URL y SUPABASE_ANON_KEY son obligatorios en producción"
                )
        return self

    @property
    def is_production(self) -> bool:
        return self.app_env in {"production", "prod"}

    @property
    def cors_origins(self) -> list[str]:
        return [
            item.strip()
            for item in self.cors_origins_raw.split(",")
            if item.strip()
        ]

    @property
    def allowed_hosts(self) -> list[str]:
        return [
            item.strip()
            for item in self.allowed_hosts_raw.split(",")
            if item.strip()
        ]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
