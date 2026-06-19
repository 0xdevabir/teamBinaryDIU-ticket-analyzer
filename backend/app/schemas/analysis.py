from pydantic import BaseModel, Field


class AnalysisResponse(BaseModel):
    category: str
    priority: str
    summary: str
    ai_confidence: float = Field(..., ge=0, le=1)
