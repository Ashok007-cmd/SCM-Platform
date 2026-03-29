"""Application settings loaded from environment variables."""
from pydantic_settings import BaseSettings
from functools import lru_cache

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

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379

    # Kafka
    kafka_brokers: str = "localhost:9092"
    kafka_api_key: str = ""
    kafka_api_secret: str = ""

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ML model settings
    forecast_cache_ttl: int = 3600
    model_retrain_days: int = 7

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
