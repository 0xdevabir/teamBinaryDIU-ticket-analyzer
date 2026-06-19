from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer


class TicketCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10, max_length=5000)


class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str
    category: str | None = None
    priority: str | None = None
    summary: str | None = None
    ai_confidence: float | None = None
    created_at: datetime
    updated_at: datetime

    @field_serializer("ai_confidence")
    def serialize_confidence(self, value: Decimal | float | None) -> float | None:
        if value is None:
            return None
        return float(value)


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    total: int
    page: int
    page_size: int


class CategoryResponse(BaseModel):
    name: str
