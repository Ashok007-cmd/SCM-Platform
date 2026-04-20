"""Re-export ModelRegistry from core to avoid duplicate implementations."""
from core.model_registry import ModelRegistry

__all__ = ["ModelRegistry"]
