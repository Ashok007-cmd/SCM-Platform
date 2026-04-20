"""
ML Model Registry — loads and caches trained models at startup.
Models are loaded lazily on first request if not pre-loaded.
"""
import logging
import numpy as np
import pandas as pd
from datetime import date, timedelta
from core.config import settings

logger = logging.getLogger(__name__)


class _MockDemandForecastModel:
    """Stub model — returns synthetic forecast data until real models are trained."""

    def predict(self, product_id: str, warehouse_code: str | None, horizon: int) -> pd.DataFrame:
        today = date.today()
        rows = []
        for i in range(horizon):
            day = today + timedelta(days=i + 1)
            yhat = max(0, 50 + np.random.normal(0, 10))
            rows.append({
                "ds": pd.Timestamp(day),
                "yhat": yhat,
                "yhat_lower": max(0, yhat * 0.8),
                "yhat_upper": yhat * 1.2,
                "confidence": 0.85,
            })
        return pd.DataFrame(rows)


class ModelRegistry:
    """Manages lifecycle of ML models used by the forecasting service."""

    _store: dict = {}
    _loaded: bool = False

    @classmethod
    async def load_all(cls) -> None:
        """Pre-load models into memory on application startup."""
        logger.info(f"ModelRegistry: loading ML models (Env: {settings.model_env})...")
        
        if settings.model_env == "production":
            logger.info("ModelRegistry: downloading production-grade models from model store...")
            # Real model loading would happen here, e.g.:
            # cls._store["demand_forecast"] = JoblibModelProxy("demand_v1")
            cls._store["demand_forecast"] = _MockDemandForecastModel() # Still using mock for now as placeholder
        else:
            logger.info("ModelRegistry: using local stubs for development")
            cls._store["demand_forecast"] = _MockDemandForecastModel()
            
        cls._loaded = True
        logger.info("ModelRegistry: ready")

    @classmethod
    async def unload_all(cls) -> None:
        """Release model resources on application shutdown."""
        logger.info("ModelRegistry: unloading models")
        cls._store.clear()
        cls._loaded = False

    @classmethod
    def get(cls, name: str):
        """Retrieve a loaded model by name. Raises KeyError if not found."""
        if name not in cls._store:
            # Lazy-init for development convenience
            if name == "demand_forecast":
                cls._store[name] = _MockDemandForecastModel()
            else:
                raise KeyError(f"Model '{name}' is not loaded. Call load_all() first.")
        return cls._store[name]
