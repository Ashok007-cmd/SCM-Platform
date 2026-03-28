"""Structured logging configuration for the AI/ML service."""
import logging
import sys

def setup_logging(log_level: str = "INFO") -> None:
    fmt = "%(asctime)s %(levelname)-8s %(name)s — %(message)s"
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format=fmt,
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    # Silence noisy libraries
    logging.getLogger("prophet").setLevel(logging.WARNING)
    logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
    logging.getLogger("numexpr").setLevel(logging.WARNING)
