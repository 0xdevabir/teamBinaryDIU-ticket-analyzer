from dataclasses import dataclass


@dataclass(frozen=True)
class AnalysisResult:
    category: str
    priority: str
    summary: str
    ai_confidence: float
