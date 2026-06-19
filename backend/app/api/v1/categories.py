from fastapi import APIRouter, Depends

from app.dependencies import get_ticket_service
from app.schemas.ticket import CategoryResponse
from app.services.ticket_service import TicketService

router = APIRouter()


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(service: TicketService = Depends(get_ticket_service)):
    return [CategoryResponse(name=name) for name in service.get_categories()]
