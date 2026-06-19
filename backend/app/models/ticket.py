import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import ENUM, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base

ticket_category_enum = ENUM(
    "Billing",
    "Technical",
    "Account",
    "Feature Request",
    "Other",
    name="ticket_category",
    create_type=False,
)

ticket_priority_enum = ENUM(
    "low",
    "medium",
    "high",
    "critical",
    name="ticket_priority",
    create_type=False,
)


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(ticket_category_enum, nullable=True, index=True)
    priority: Mapped[str | None] = mapped_column(ticket_priority_enum, nullable=True, index=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_confidence: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    @property
    def is_analyzed(self) -> bool:
        return self.category is not None
