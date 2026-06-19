import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.pipeline import AnalysisPipeline
from app.core.exceptions import TicketNotFoundError
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository


class AnalysisService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = TicketRepository(db)
        self.pipeline = AnalysisPipeline()

    async def analyze_ticket(self, ticket_id: uuid.UUID) -> Ticket:
        ticket = await self.repo.get_by_id(ticket_id)
        if not ticket:
            raise TicketNotFoundError(str(ticket_id))
        result = await self.pipeline.run(ticket.title, ticket.description)
        return await self.repo.apply_analysis(ticket, result)
