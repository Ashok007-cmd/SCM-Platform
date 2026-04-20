"""Application settings loaded from environment variables."""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
import os

class Settings(BaseSettings):
    app_name: str = "SCM AI/ML Service"
    debug: bool = False
    log_level: str = "INFO"

    # Database
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "scmdb"
    db_user: str = "scmadmin"
    db_password: str = ""
    db_pool_size: int = 10
    db_max_overflow: int = 20

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379

    # Kafka
    kafka_brokers: str = "localhost:9092"
    kafka_api_key: str = ""
    kafka_api_secret: str = ""

    # CORS — comma-separated origins injected from env
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ML model settings
    model_env: str = "development"  # set to "production" to load real models
    forecast_cache_ttl: int = 3600
    model_retrain_days: int = 7

    @field_validator("db_password", mode="before")
    @classmethod
    def require_db_password_in_prod(cls, v: str, info: object) -> str:
        if os.getenv("MODEL_ENV", "development") == "production" and not v:
            raise ValueError("DB_PASSWORD must be set in production")
        return v

    @field_validator("kafka_api_key", mode="before")
    @classmethod
    def require_kafka_key_in_prod(cls, v: str, info: object) -> str:
        if os.getenv("MODEL_ENV", "development") == "production" and not v:
            raise ValueError("KAFKA_API_KEY must be set in production")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
