"""
SCM Platform — AI/ML Forecasting Service
FastAPI microservice for demand forecasting, risk scoring, and route optimization
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from routers import forecast, risk, optimization
from core.config import settings
from core.logging import setup_logging

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models on startup, release on shutdown."""
    from core.model_registry import ModelRegistry
    await ModelRegistry.load_all()
    yield
    await ModelRegistry.unload_all()


app = FastAPI(
    title="SCM Platform AI/ML Service",
    description="Demand forecasting, supplier risk scoring, and route optimization APIs",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────
app.include_router(forecast.router,     prefix="/api/v1/forecast",      tags=["Demand Forecasting"])
app.include_router(risk.router,         prefix="/api/v1/risk",           tags=["Supplier Risk"])
app.include_router(optimization.router, prefix="/api/v1/optimization",   tags=["Route Optimization"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "UP", "service": "scm-ai-ml"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
