"""Model registry — lazy-loads and caches trained ML models."""
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ModelRegistry:
    """Simple in-process model cache."""
    _models: Dict[str, Any] = {}

    @classmethod
    def get(cls, name: str):
        return cls._models.get(name)

    @classmethod
    def register(cls, name: str, model: Any) -> None:
        cls._models[name] = model
        logger.info("Registered model: %s", name)

    @classmethod
    def is_loaded(cls, name: str) -> bool:
        return name in cls._models

    @classmethod
    def list_models(cls) -> list:
        return list(cls._models.keys())
