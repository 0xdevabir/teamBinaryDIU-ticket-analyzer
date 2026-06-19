from fastapi import APIRouter, Depends

from app.dependencies import get_analysis_service, get_ticket_service
from app.schemas.dashboard import DashboardStats
from app.schemas.ticket import TicketCreate, TicketResponse
from app.services.analysis_service import AnalysisService
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/dashboard")

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


@router.get("/stats", response_model=DashboardStats)
async def dashboard_stats(service: TicketService = Depends(get_ticket_service)):
    return await service.dashboard_stats()


@router.get("/recent", response_model=list[TicketResponse])
async def recent_tickets(service: TicketService = Depends(get_ticket_service)):
    items, _ = await service.list(page=1, page_size=5)
    return items


@router.post("/seed", response_model=list[TicketResponse])
async def seed_demo_tickets(
    ticket_service: TicketService = Depends(get_ticket_service),
    analysis_service: AnalysisService = Depends(get_analysis_service),
):
    created = []
    for data in DEMO_TICKETS:
        ticket = await ticket_service.create(data)
        analyzed = await analysis_service.analyze_ticket(ticket.id)
        created.append(analyzed or ticket)
    return created
