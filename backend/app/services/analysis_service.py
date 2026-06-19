import logging
import time
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.formatter import display_category, display_priority
from app.ai.pipeline import AnalysisPipeline
from app.core.exceptions import TicketNotFoundError
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository
from app.schemas.analysis import TicketAnalyzeResponse

logger = logging.getLogger(__name__)


class AnalysisService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = TicketRepository(db)
        self.pipeline = AnalysisPipeline()

    async def analyze_ticket(self, ticket_id: uuid.UUID) -> TicketAnalyzeResponse:
        ticket = await self.repo.get_by_id(ticket_id)
        if not ticket:
            raise TicketNotFoundError(str(ticket_id))

        started = time.perf_counter()
        result = await self.pipeline.run(ticket.title, ticket.description)
        updated = await self.repo.apply_analysis(ticket, result)

        processing_ms = result.processing_ms or int((time.perf_counter() - started) * 1000)
        logger.info(
            "Analyzed ticket %s via %s in %dms (confidence=%.2f)",
            ticket_id,
            result.inference_source,
            processing_ms,
            result.ai_confidence,
        )

        return self._to_analyze_response(updated, result, processing_ms)

    @staticmethod
    def _to_analyze_response(ticket: Ticket, result, processing_ms: int) -> TicketAnalyzeResponse:
        return TicketAnalyzeResponse(
            id=ticket.id,
            title=ticket.title,
            description=ticket.description,
            category=display_category(ticket.category) if ticket.category else None,
            priority=display_priority(ticket.priority) if ticket.priority else None,
            summary=ticket.summary,
            ai_confidence=float(ticket.ai_confidence) if ticket.ai_confidence is not None else None,
            created_at=ticket.created_at,
            updated_at=ticket.updated_at,
            inference_source=result.inference_source,
            confidence_breakdown=result.confidence_breakdown,
            processing_ms=processing_ms,
        )
