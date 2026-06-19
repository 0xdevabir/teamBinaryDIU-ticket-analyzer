from fastapi import APIRouter, Depends

from app.config import settings
from app.schemas.ticket import CategoryResponse

router = APIRouter()


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories():
    return [CategoryResponse(name=name) for name in settings.ticket_categories]
