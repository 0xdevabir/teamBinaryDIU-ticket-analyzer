from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_tickets: int
    analyzed_today: int
    by_category: dict[str, int]
    by_priority: dict[str, int]
    avg_confidence: float | None
