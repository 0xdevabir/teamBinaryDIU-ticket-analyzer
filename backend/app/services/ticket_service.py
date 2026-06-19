import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.ticket import Ticket
from app.repositories.ticket_repository import TicketRepository
from app.schemas.dashboard import DashboardStats
from app.schemas.ticket import TicketCreate, TicketUpdate


class TicketService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = TicketRepository(db)

    async def create(self, data: TicketCreate) -> Ticket:
        return await self.repo.create(data)

    async def get(self, ticket_id: uuid.UUID) -> Ticket | None:
        return await self.repo.get_by_id(ticket_id)

    async def list(self, **kwargs) -> tuple[list[Ticket], int]:
        return await self.repo.list(**kwargs)

    async def update(self, ticket_id: uuid.UUID, data: TicketUpdate) -> Ticket | None:
        ticket = await self.repo.get_by_id(ticket_id)
        if not ticket:
            return None
        return await self.repo.update(ticket, data)

    async def delete(self, ticket_id: uuid.UUID) -> bool:
        return await self.repo.delete(ticket_id)

    def get_categories(self) -> list[str]:
        return settings.ticket_categories

    async def dashboard_stats(self) -> DashboardStats:
        return await self.repo.dashboard_stats()
