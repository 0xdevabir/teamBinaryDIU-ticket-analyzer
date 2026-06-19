"""Tests for the standalone AI analyze endpoint."""

from app.ai.formatter import display_category, display_priority
from app.schemas.ai import AnalyzeRequest
from app.services.inference_api_service import InferenceApiService


def test_display_category_account_to_authentication():
    assert display_category("Account") == "Authentication"


def test_display_priority_capitalization():
    assert display_priority("high") == "High"
    assert display_priority("critical") == "Critical"


async def test_analyze_login_ticket():
    service = InferenceApiService()
    result = await service.analyze(
        AnalyzeRequest(
            title="Unable to login",
            description="User cannot login after password reset",
        )
    )
    assert result.category in {"Authentication", "General", "Technical", "Billing", "Feature Request"}
    assert result.priority in {"Critical", "High", "Medium", "Low"}
    assert len(result.summary) > 0
    assert 0.0 <= result.confidence <= 1.0
