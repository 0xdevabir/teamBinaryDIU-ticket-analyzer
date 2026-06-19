from dataclasses import dataclass, field


@dataclass(frozen=True)
class AnalysisResult:
    category: str
    priority: str
    summary: str
    ai_confidence: float
    confidence_breakdown: dict[str, float] = field(default_factory=dict)
    inference_source: str = "fallback"
    processing_ms: int | None = None
