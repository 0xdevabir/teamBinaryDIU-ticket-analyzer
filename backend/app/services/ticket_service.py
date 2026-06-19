import uuid
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.pipeline import AnalysisPipeline
from app.ai.result import AnalysisResult
from app.config import settings
from app.models.ticket import Ticket
from app.schemas.dashboard import DashboardStats
from app.schemas.ticket import TicketCreate


class TicketRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_ticket(self, data: TicketCreate) -> Ticket:
        ticket = Ticket(title=data.title, description=data.description)
        self.db.add(ticket)
        await self.db.flush()
        return ticket

    async def get_ticket(self, ticket_id: uuid.UUID) -> Ticket | None:
        result = await self.db.execute(select(Ticket).where(Ticket.id == ticket_id))
        return result.scalar_one_or_none()

    async def list_tickets(
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

        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar_one()

        query = query.order_by(Ticket.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def apply_analysis(self, ticket: Ticket, result: AnalysisResult) -> Ticket:
        ticket.category = result.category
        ticket.priority = result.priority
        ticket.summary = result.summary
        ticket.ai_confidence = Decimal(str(result.ai_confidence))
        await self.db.flush()
        await self.db.refresh(ticket)
        return ticket

    async def clear_analysis(self, ticket: Ticket) -> Ticket:
        ticket.category = None
        ticket.priority = None
        ticket.summary = None
        ticket.ai_confidence = None
        await self.db.flush()
        await self.db.refresh(ticket)
        return ticket

    async def get_dashboard_stats(self) -> DashboardStats:
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

        return DashboardStats(
            total_tickets=total,
            analyzed_today=analyzed_today,
            by_category={row[0]: row[1] for row in category_rows},
            by_priority={row[0]: row[1] for row in priority_rows},
            avg_confidence=float(avg_confidence) if avg_confidence is not None else None,
        )


DEMO_TICKETS = [
    TicketCreate(
        title="URGENT: Payment failed but money deducted",
        description="I tried to pay for my subscription but the payment failed. However, the amount was deducted from my credit card. Please refund immediately.",
    ),
    TicketCreate(
        title="Cannot login after password reset",
        description="I reset my password using the forgot password link but I still get invalid credentials when trying to sign in to my account.",
    ),
    TicketCreate(
        title="App crashes on startup",
        description="After the latest update, the mobile app crashes immediately on startup. I am using Android 14 on a Samsung device.",
    ),
    TicketCreate(
        title="Feature request: Dark mode",
        description="It would be great if you could add a dark mode option to the dashboard. Many users have requested this improvement.",
    ),
    TicketCreate(
        title="Slow page loading times",
        description="The reports page takes over 30 seconds to load. This is causing issues for our team during daily standups.",
    ),
]


class TicketService:
    def __init__(self, db: AsyncSession):
        self.repo = TicketRepository(db)
        self.pipeline = AnalysisPipeline()

    async def create_and_analyze(self, data: TicketCreate) -> Ticket:
        ticket = await self.repo.create_ticket(data)
        try:
            result = await self.pipeline.run(ticket.title, ticket.description)
            return await self.repo.apply_analysis(ticket, result)
        except Exception:
            return ticket

    async def get_ticket(self, ticket_id: uuid.UUID) -> Ticket | None:
        return await self.repo.get_ticket(ticket_id)

    async def list_tickets(self, **kwargs) -> tuple[list[Ticket], int]:
        return await self.repo.list_tickets(**kwargs)

    async def reanalyze(self, ticket_id: uuid.UUID) -> Ticket | None:
        ticket = await self.repo.get_ticket(ticket_id)
        if not ticket:
            return None
        try:
            result = await self.pipeline.run(ticket.title, ticket.description)
            return await self.repo.apply_analysis(ticket, result)
        except Exception:
            return ticket

    def get_categories(self) -> list[str]:
        return settings.ticket_categories

    async def get_dashboard_stats(self) -> DashboardStats:
        return await self.repo.get_dashboard_stats()

    async def seed_demo_data(self) -> list[Ticket]:
        created: list[Ticket] = []
        for data in DEMO_TICKETS:
            ticket = await self.create_and_analyze(data)
            created.append(ticket)
        return created

    @property
    def db(self) -> AsyncSession:
        return self.repo.db
