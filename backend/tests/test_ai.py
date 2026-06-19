"""Unit tests for keyword fallbacks and confidence scoring."""

from app.ai.classifier import fallback_category
from app.ai.confidence import build_confidence
from app.ai.priority_detector import keyword_priority_score


def test_fallback_category_login():
    text = "Title: Unable to login\nDescription: User cannot login after password reset."
    assert fallback_category(text) == "Account"


def test_keyword_priority_high():
    text = "Unable to login after password reset"
    priority, score = keyword_priority_score(text)
    assert priority == "high"
    assert score >= 0.9


def test_confidence_blend():
    result = build_confidence(0.91, 0.78, 0.92, "local")
    assert 0.0 <= result.overall <= 1.0
    assert result.category == 0.91
    assert "overall" in result.as_dict()
