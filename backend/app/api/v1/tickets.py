import uuid

from fastapi import APIRouter, Depends, Query, Response, status

from app.dependencies import get_analysis_service, get_ticket_service
from app.schemas.analysis import TicketAnalyzeResponse
from app.schemas.ticket import TicketCreate, TicketListResponse, TicketResponse, TicketUpdate
from app.services.analysis_service import AnalysisService
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(data: TicketCreate, service: TicketService = Depends(get_ticket_service)):
    return await service.create(data)


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
    items, total = await service.list(
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
    return await service.get(ticket_id)


@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: uuid.UUID,
    data: TicketUpdate,
    service: TicketService = Depends(get_ticket_service),
):
    return await service.update(ticket_id, data)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(ticket_id: uuid.UUID, service: TicketService = Depends(get_ticket_service)):
    await service.delete(ticket_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{ticket_id}/analyze", response_model=TicketAnalyzeResponse)
async def analyze_ticket(
    ticket_id: uuid.UUID,
    service: AnalysisService = Depends(get_analysis_service),
):
    return await service.analyze_ticket(ticket_id)
