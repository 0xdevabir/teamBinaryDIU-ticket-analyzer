import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.ticket import TicketCreate, TicketListResponse, TicketResponse
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/tickets")


def get_ticket_service(db: AsyncSession = Depends(get_db)) -> TicketService:
    return TicketService(db)


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(data: TicketCreate, service: TicketService = Depends(get_ticket_service)):
    ticket = await service.create_and_analyze(data)
    return ticket


@router.get("", response_model=TicketListResponse)
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    analyzed: bool | None = None,
    category: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    service: TicketService = Depends(get_ticket_service),
):
    items, total = await service.list_tickets(
        page=page,
        page_size=page_size,
        analyzed=analyzed,
        category=category,
        priority=priority,
        search=search,
    )
    return TicketListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: uuid.UUID, service: TicketService = Depends(get_ticket_service)):
    ticket = await service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.post("/{ticket_id}/reanalyze", response_model=TicketResponse)
async def reanalyze_ticket(ticket_id: uuid.UUID, service: TicketService = Depends(get_ticket_service)):
    ticket = await service.reanalyze(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket
