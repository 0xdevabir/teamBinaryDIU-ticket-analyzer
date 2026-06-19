import logging

from app.ai.formatter import display_category, display_priority
from app.ai.inference import InferenceEngine
from app.core.exceptions import InferenceError
from app.schemas.ai import AnalyzeRequest, AnalyzeResponse

logger = logging.getLogger(__name__)


class InferenceApiService:
    """Stateless AI analysis — no database persistence."""

    def __init__(self) -> None:
        self._engine = InferenceEngine()

    async def analyze(self, data: AnalyzeRequest) -> AnalyzeResponse:
        try:
            result = await self._engine.analyze(data.title, data.description)
        except Exception as exc:
            logger.exception("AI inference error")
            raise InferenceError(f"AI inference failed: {exc}") from exc

        return AnalyzeResponse(
            category=display_category(result.category),
            priority=display_priority(result.priority),
            summary=result.summary,
            confidence=round(result.ai_confidence, 2),
        )
