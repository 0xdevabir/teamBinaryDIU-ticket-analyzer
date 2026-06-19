from fastapi import APIRouter, Depends, HTTPException, status

from app.ai.result import AnalysisResult
from app.config import settings
from app.dependencies import get_ticket_service
from app.schemas.dashboard import DashboardStats
from app.schemas.ticket import TicketCreate, TicketResponse
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Pre-baked demo tickets — instant seed without downloading AI models
DEMO_TICKETS: list[tuple[TicketCreate, AnalysisResult]] = [
    (
        TicketCreate(
            title="URGENT: Payment failed but money deducted",
            description="I tried to pay for my subscription but the payment failed. However, the amount was deducted from my credit card. Please refund immediately.",
        ),
        AnalysisResult(
            category="Billing",
            priority="critical",
            summary="Customer charged despite failed subscription payment; requesting immediate refund.",
            ai_confidence=0.92,
            confidence_breakdown={"category": 0.94, "priority": 0.91, "keywords": 0.88},
            inference_source="demo",
            processing_ms=0,
        ),
    ),
    (
        TicketCreate(
            title="Cannot login after password reset",
            description="I reset my password using the forgot password link but I still get invalid credentials when trying to sign in to my account.",
        ),
        AnalysisResult(
            category="Account",
            priority="high",
            summary="User unable to sign in after password reset; invalid credentials error persists.",
            ai_confidence=0.89,
            confidence_breakdown={"category": 0.90, "priority": 0.87, "keywords": 0.85},
            inference_source="demo",
            processing_ms=0,
        ),
    ),
    (
        TicketCreate(
            title="App crashes on startup",
            description="After the latest update, the mobile app crashes immediately on startup. I am using Android 14 on a Samsung device.",
        ),
        AnalysisResult(
            category="Technical",
            priority="high",
            summary="Mobile app crashes on launch after recent update on Android 14 Samsung device.",
            ai_confidence=0.91,
            confidence_breakdown={"category": 0.93, "priority": 0.88, "keywords": 0.86},
            inference_source="demo",
            processing_ms=0,
        ),
    ),
    (
        TicketCreate(
            title="Feature request: Dark mode",
            description="It would be great if you could add a dark mode option to the dashboard. Many users have requested this improvement.",
        ),
        AnalysisResult(
            category="Feature Request",
            priority="low",
            summary="User requests dark mode for the dashboard; popular feature request.",
            ai_confidence=0.95,
            confidence_breakdown={"category": 0.96, "priority": 0.92, "keywords": 0.90},
            inference_source="demo",
            processing_ms=0,
        ),
    ),
    (
        TicketCreate(
            title="Slow page loading times",
            description="The reports page takes over 30 seconds to load. This is causing issues for our team during daily standups.",
        ),
        AnalysisResult(
            category="Technical",
            priority="medium",
            summary="Reports page load time exceeds 30 seconds, impacting team workflows.",
            ai_confidence=0.87,
            confidence_breakdown={"category": 0.88, "priority": 0.84, "keywords": 0.82},
            inference_source="demo",
            processing_ms=0,
        ),
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
):
    if not settings.seed_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo seeding is disabled in this environment",
        )
    return await ticket_service.seed_demo(DEMO_TICKETS)
