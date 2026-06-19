import pytest
from httpx import ASGITransport, AsyncClient

from app.ai_app import create_ai_app


@pytest.fixture
async def ai_client():
    app = create_ai_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_ai_service_health(ai_client):
    response = await ai_client.get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "ai"


@pytest.mark.asyncio
async def test_ai_analyze_endpoint(ai_client):
    response = await ai_client.post(
        "/analyze",
        json={
            "title": "Unable to login",
            "description": "User cannot login after password reset",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "category" in data
    assert "priority" in data
    assert "summary" in data
    assert 0.0 <= data["confidence"] <= 1.0
