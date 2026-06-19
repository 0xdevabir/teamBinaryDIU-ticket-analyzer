from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.dashboard import DashboardStats
from app.schemas.ticket import TicketResponse
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/dashboard")


def get_ticket_service(db: AsyncSession = Depends(get_db)) -> TicketService:
    return TicketService(db)


@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(service: TicketService = Depends(get_ticket_service)):
    return await service.get_dashboard_stats()


@router.get("/recent", response_model=list[TicketResponse])
async def recent_tickets(service: TicketService = Depends(get_ticket_service)):
    items, _ = await service.list_tickets(page=1, page_size=5)
    return items


@router.post("/seed", response_model=list[TicketResponse])
async def seed_demo_tickets(service: TicketService = Depends(get_ticket_service)):
    return await service.seed_demo_data()
