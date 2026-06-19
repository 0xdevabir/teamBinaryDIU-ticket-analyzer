import uuid
from unittest.mock import AsyncMock, patch

import pytest

from app.ai.result import AnalysisResult
from app.services.analysis_service import AnalysisService

TICKET_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@pytest.mark.asyncio
async def test_analyze_ticket_returns_metadata():
    mock_ticket = AsyncMock()
    mock_ticket.id = TICKET_ID
    mock_ticket.title = "Login issue"
    mock_ticket.description = "Cannot login after password reset"
    mock_ticket.category = "Account"
    mock_ticket.priority = "high"
    mock_ticket.summary = "User cannot login"
    mock_ticket.ai_confidence = 0.85
    mock_ticket.created_at = "2026-01-01T00:00:00Z"
    mock_ticket.updated_at = "2026-01-01T00:00:00Z"

    mock_result = AnalysisResult(
        category="Account",
        priority="high",
        summary="User cannot login",
        ai_confidence=0.85,
        confidence_breakdown={"category": 0.9, "priority": 0.8, "summary": 0.7},
        inference_source="local",
        processing_ms=420,
    )

    with patch.object(AnalysisService, "__init__", lambda self, db: None):
        service = AnalysisService(None)
        service.repo = AsyncMock()
        service.pipeline = AsyncMock()
        service.repo.get_by_id.return_value = mock_ticket
        service.pipeline.run.return_value = mock_result
        service.repo.apply_analysis.return_value = mock_ticket

        response = await service.analyze_ticket(TICKET_ID)

    assert response.inference_source == "local"
    assert response.processing_ms == 420
    assert response.confidence_breakdown is not None
    assert response.category == "Authentication"
