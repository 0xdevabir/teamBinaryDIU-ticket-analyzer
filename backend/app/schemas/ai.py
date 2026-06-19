from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, examples=["Unable to login"])
    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        examples=["User cannot login after password reset"],
    )


class AnalyzeResponse(BaseModel):
    category: str
    priority: str
    summary: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    inference_source: str = "fallback"
    confidence_breakdown: dict[str, float] = Field(default_factory=dict)
    processing_ms: int | None = None
