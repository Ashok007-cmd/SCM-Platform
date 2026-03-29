"""
Smoke tests for the AI/ML service — verify FastAPI app creates successfully
and the health endpoint responds correctly.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch


@pytest.fixture
def client():
    """Create a TestClient with model loading mocked out."""
    with (
        patch("core.model_registry.ModelRegistry.load_all", new_callable=AsyncMock),
        patch("core.model_registry.ModelRegistry.unload_all", new_callable=AsyncMock),
    ):
        from main import app
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200


def test_openapi_schema_available(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data
    assert data["info"]["title"] == "SCM Platform AI/ML Service"
