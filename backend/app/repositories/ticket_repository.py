import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.result import AnalysisResult
from app.models.ticket import Ticket
from app.schemas.dashboard import DashboardStats
from app.schemas.ticket import TicketCreate, TicketUpdate


class TicketRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: TicketCreate) -> Ticket:
        ticket = Ticket(title=data.title, description=data.description)
        self.db.add(ticket)
        await self.db.flush()
        await self.db.refresh(ticket)
        return ticket

    async def get_by_id(self, ticket_id: uuid.UUID) -> Ticket | None:
        result = await self.db.execute(select(Ticket).where(Ticket.id == ticket_id))
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        page: int,
        page_size: int,
        analyzed: bool | None = None,
        category: str | None = None,
        priority: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Ticket], int]:
        query = select(Ticket)

        if analyzed is True:
            query = query.where(Ticket.category.is_not(None))
        elif analyzed is False:
            query = query.where(Ticket.category.is_(None))
        if category:
            query = query.where(Ticket.category == category)
        if priority:
            query = query.where(Ticket.priority == priority)
        if search:
            pattern = f"%{search}%"
            query = query.where(or_(Ticket.title.ilike(pattern), Ticket.description.ilike(pattern)))

        total = (await self.db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
        query = query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def update(self, ticket: Ticket, data: TicketUpdate) -> Ticket:
        changes = data.model_dump(exclude_unset=True)
        content_changed = "title" in changes or "description" in changes

        for field, value in changes.items():
            setattr(ticket, field, value)

        if content_changed:
            ticket.category = None
            ticket.priority = None
            ticket.summary = None
            ticket.ai_confidence = None

        await self.db.flush()
        await self.db.refresh(ticket)
        return ticket

    async def delete(self, ticket_id: uuid.UUID) -> bool:
        result = await self.db.execute(delete(Ticket).where(Ticket.id == ticket_id))
        return result.rowcount > 0

    async def apply_analysis(self, ticket: Ticket, result: AnalysisResult) -> Ticket:
        ticket.category = result.category
        ticket.priority = result.priority
        ticket.summary = result.summary
        ticket.ai_confidence = Decimal(str(result.ai_confidence))
        await self.db.flush()
        await self.db.refresh(ticket)
        return ticket

    async def dashboard_stats(self) -> DashboardStats:
        total = (await self.db.execute(select(func.count()).select_from(Ticket))).scalar_one()

        today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        analyzed_today = (
            await self.db.execute(
                select(func.count())
                .select_from(Ticket)
                .where(Ticket.category.is_not(None), Ticket.updated_at >= today_start)
            )
        ).scalar_one()

        category_rows = (
            await self.db.execute(
                select(Ticket.category, func.count())
                .where(Ticket.category.is_not(None))
                .group_by(Ticket.category)
            )
        ).all()
        priority_rows = (
            await self.db.execute(
                select(Ticket.priority, func.count())
                .where(Ticket.priority.is_not(None))
                .group_by(Ticket.priority)
            )
        ).all()
        avg_confidence = (
            await self.db.execute(
                select(func.avg(Ticket.ai_confidence))
                .select_from(Ticket)
                .where(Ticket.ai_confidence.is_not(None))
            )
        ).scalar_one()

        analyzed_total = (
            await self.db.execute(
                select(func.count()).select_from(Ticket).where(Ticket.category.is_not(None))
            )
        ).scalar_one()
        pending_total = total - analyzed_total
        analysis_rate = round((analyzed_total / total * 100) if total > 0 else 0.0, 1)

        return DashboardStats(
            total_tickets=total,
            analyzed_total=analyzed_total,
            pending_total=pending_total,
            analyzed_today=analyzed_today,
            analysis_rate=analysis_rate,
            by_category={str(row[0]): row[1] for row in category_rows},
            by_priority={str(row[0]): row[1] for row in priority_rows},
            avg_confidence=float(avg_confidence) if avg_confidence is not None else None,
        )
