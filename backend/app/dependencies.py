from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session
from app.services.analysis_service import AnalysisService
from app.services.ticket_service import TicketService


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def get_ticket_service(db: AsyncSession = Depends(get_db)) -> TicketService:
    return TicketService(db)


def get_analysis_service(db: AsyncSession = Depends(get_db)) -> AnalysisService:
    return AnalysisService(db)
