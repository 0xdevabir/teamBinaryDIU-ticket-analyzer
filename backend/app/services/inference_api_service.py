import logging
import time

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
        started = time.perf_counter()
        try:
            result = await self._engine.analyze(data.title, data.description)
        except Exception as exc:
            logger.exception("AI inference error")
            raise InferenceError(f"AI inference failed: {exc}") from exc

        processing_ms = result.processing_ms or int((time.perf_counter() - started) * 1000)

        return AnalyzeResponse(
            category=display_category(result.category),
            priority=display_priority(result.priority),
            summary=result.summary,
            confidence=round(result.ai_confidence, 2),
            inference_source=result.inference_source,
            confidence_breakdown=result.confidence_breakdown,
            processing_ms=processing_ms,
        )
