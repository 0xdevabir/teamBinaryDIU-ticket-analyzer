from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer

from app.schemas.ticket import TicketResponse


class TicketAnalyzeResponse(TicketResponse):
    """Ticket returned after AI analysis with inference metadata."""

    inference_source: str | None = None
    confidence_breakdown: dict[str, float] | None = None
    processing_ms: int | None = None
