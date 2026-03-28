"""
SCM Platform — Demand Forecasting Service
==========================================
AI/ML service for demand prediction using ensemble models.

Models:
  - ARIMA (seasonal baseline)
  - LSTM (complex pattern detection)
  - XGBoost (gradient boosting ensemble)
  - Prophet (rapid prototyping / external signals)

Architecture:
  - FastAPI serving layer
  - SageMaker training pipeline
  - Kafka consumer for inference requests
  - Feature store integration

Author: Ashok
License: MIT
"""

import os
import logging
import uuid
import random
from datetime import date, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ──────────────────────────────────────────────────────────
# Application Setup
# ──────────────────────────────────────────────────────────
app = FastAPI(
    title="SCM Platform — Demand Forecasting Service",
    description="AI-powered demand prediction using ensemble ML models",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

logger = logging.getLogger("demand-forecasting")
logging.basicConfig(level=logging.INFO)

# ──────────────────────────────────────────────────────────
# Security & Rate Limiting
# ──────────────────────────────────────────────────────────
security = HTTPBearer()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS512"

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """Validate Bearer JWT token."""
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        import jwt
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"verify_exp": True})
        return payload.get("sub", "")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ──────────────────────────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────────────────────────

class ForecastRequest(BaseModel):
    """Request to generate demand forecast for a product at a location."""
    product_id: str = Field(..., description="Product UUID")
    location_id: str = Field(..., description="Location UUID")
    horizon_days: int = Field(default=90, ge=7, le=365, description="Forecast horizon in days")
    model_type: Optional[str] = Field(default="ensemble", description="Model: arima, lstm, xgboost, prophet, ensemble")
    include_external_signals: bool = Field(default=True, description="Include weather, market, and trend data")

    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "550e8400-e29b-41d4-a716-446655440000",
                "location_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "horizon_days": 90,
                "model_type": "ensemble",
                "include_external_signals": True,
            }
        }


class ForecastPoint(BaseModel):
    """A single forecast data point."""
    date: date
    predicted_quantity: float
    lower_bound: float
    upper_bound: float
    confidence: float = Field(ge=0.0, le=1.0)


class ForecastResponse(BaseModel):
    """Response containing the demand forecast results."""
    forecast_id: str
    product_id: str
    location_id: str
    model_type: str
    horizon_days: int
    mape: Optional[float] = Field(None, description="Mean Absolute Percentage Error")
    rmse: Optional[float] = Field(None, description="Root Mean Squared Error")
    forecast: list[ForecastPoint]
    external_signals_used: list[str] = []
    model_version: str = "1.0.0"


class ModelMetrics(BaseModel):
    """Model performance metrics."""
    model_type: str
    mape: float
    rmse: float
    mae: float
    r_squared: float
    training_date: date
    data_points_used: int


class HealthResponse(BaseModel):
    """Service health check response."""
    status: str
    service: str
    version: str
    models_loaded: list[str]


# ──────────────────────────────────────────────────────────
# Forecast Engine (Placeholder for ML Pipeline)
# ──────────────────────────────────────────────────────────

# In production, these would be loaded from SageMaker endpoints
AVAILABLE_MODELS = ["arima", "lstm", "xgboost", "prophet", "ensemble"]

def generate_forecast(request: ForecastRequest) -> ForecastResponse:
    """
    Generate demand forecast using the specified model.

    In production, this calls SageMaker endpoints for real-time inference.
    The ensemble model combines predictions from ARIMA, LSTM, and XGBoost
    using weighted averaging based on recent model performance.
    """
    try:
        logger.info(
            f"Generating {request.model_type} forecast for product={request.product_id}, "
            f"location={request.location_id}, horizon={request.horizon_days} days"
        )

        if request.model_type not in AVAILABLE_MODELS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid model_type. Available: {AVAILABLE_MODELS}"
            )

        # Placeholder — in production, this calls the trained ML models
        forecast_points = []
        base_quantity = random.uniform(100, 500)

        for i in range(request.horizon_days):
            forecast_date = date.today() + timedelta(days=i + 1)
            seasonal_factor = 1.0 + 0.2 * (1 if forecast_date.month in [11, 12, 1] else 0)
            trend = 1.0 + (i * 0.001)
            noise = random.uniform(0.9, 1.1)
            predicted = base_quantity * seasonal_factor * trend * noise

            forecast_points.append(ForecastPoint(
                date=forecast_date,
                predicted_quantity=round(predicted, 2),
                lower_bound=round(predicted * 0.85, 2),
                upper_bound=round(predicted * 1.15, 2),
                confidence=round(random.uniform(0.75, 0.95), 4),
            ))

        # Validate forecast bounds
        for point in forecast_points:
            if point.lower_bound < 0:
                point.lower_bound = 0.0
            if point.upper_bound < point.lower_bound:
                point.upper_bound = point.lower_bound

        external_signals = []
        if request.include_external_signals:
            external_signals = ["weather_temperature", "market_trend_index", "social_sentiment"]

        return ForecastResponse(
            forecast_id=str(uuid.uuid4()),
            product_id=request.product_id,
            location_id=request.location_id,
            model_type=request.model_type,
            horizon_days=request.horizon_days,
            mape=round(random.uniform(8, 18), 2),
            rmse=round(random.uniform(20, 50), 2),
            forecast=forecast_points,
            external_signals_used=external_signals,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forecast generation failed: {e}")
        raise HTTPException(status_code=500, detail="Forecast generation failed")


# ──────────────────────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────────────────────

@app.post("/api/v1/forecast/generate", response_model=ForecastResponse, dependencies=[Depends(verify_jwt_token)])
@limiter.limit("20/minute")
async def create_forecast(request: ForecastRequest):
    """Generate demand forecast for a product at a location."""
    return generate_forecast(request)


@app.get("/api/v1/forecast/models", response_model=list[str])
async def list_models():
    """List available forecasting models."""
    return AVAILABLE_MODELS


@app.get("/api/v1/forecast/models/{model_type}/metrics", response_model=ModelMetrics)
async def get_model_metrics(model_type: str):
    """Get performance metrics for a specific model."""
    if model_type not in AVAILABLE_MODELS:
        raise HTTPException(status_code=404, detail=f"Model '{model_type}' not found")

    import random
    return ModelMetrics(
        model_type=model_type,
        mape=round(random.uniform(8, 20), 2),
        rmse=round(random.uniform(15, 45), 2),
        mae=round(random.uniform(10, 35), 2),
        r_squared=round(random.uniform(0.82, 0.96), 4),
        training_date=date.today(),
        data_points_used=random.randint(5000, 50000),
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Service health check."""
    return HealthResponse(
        status="UP",
        service="demand-forecasting",
        version="1.0.0",
        models_loaded=AVAILABLE_MODELS,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085)
