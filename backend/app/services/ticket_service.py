from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.result import AnalysisResult
from app.core.exceptions import TicketNotFoundError, ValidationError
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository
from app.schemas.dashboard import DashboardStats
from app.schemas.ticket import TicketCreate, TicketUpdate


class TicketService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = TicketRepository(db)

    async def create(self, data: TicketCreate) -> Ticket:
        return await self.repo.create(data)

    async def get(self, ticket_id: uuid.UUID) -> Ticket:
        ticket = await self.repo.get_by_id(ticket_id)
        if not ticket:
            raise TicketNotFoundError(str(ticket_id))
        return ticket

    async def list(self, **kwargs) -> tuple[list[Ticket], int]:
        return await self.repo.list(**kwargs)

    async def update(self, ticket_id: uuid.UUID, data: TicketUpdate) -> Ticket:
        if not data.model_dump(exclude_unset=True):
            raise ValidationError("No fields to update")
        ticket = await self.repo.get_by_id(ticket_id)
        if not ticket:
            raise TicketNotFoundError(str(ticket_id))
        return await self.repo.update(ticket, data)

    async def delete(self, ticket_id: uuid.UUID) -> None:
        deleted = await self.repo.delete(ticket_id)
        if not deleted:
            raise TicketNotFoundError(str(ticket_id))

    async def dashboard_stats(self) -> DashboardStats:
        return await self.repo.dashboard_stats()

    async def seed_demo(self, demos: list[tuple[TicketCreate, AnalysisResult]]) -> list[Ticket]:
        created: list[Ticket] = []
        for data, analysis in demos:
            ticket = await self.repo.create(data)
            ticket = await self.repo.apply_analysis(ticket, analysis)
            created.append(ticket)
        return created

    async def get_categories(self) -> list[str]:
        from app.config import settings
        return settings.ticket_categories
