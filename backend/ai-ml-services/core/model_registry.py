"""
ML Model Registry — loads and caches trained models at startup.
Models are loaded lazily on first request if not pre-loaded.
"""
import logging

logger = logging.getLogger(__name__)


class ModelRegistry:
    """Manages lifecycle of ML models used by the forecasting service."""

    _loaded: bool = False

    @classmethod
    async def load_all(cls) -> None:
        """Pre-load models into memory on application startup."""
        logger.info("ModelRegistry: loading ML models...")
        # Models are loaded on-demand inside each router;
        # this hook exists for future eager-load optimisation.
        cls._loaded = True
        logger.info("ModelRegistry: ready")

    @classmethod
    async def unload_all(cls) -> None:
        """Release model resources on application shutdown."""
        logger.info("ModelRegistry: unloading models")
        cls._loaded = False
