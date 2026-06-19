"""Confidence scoring for ticket analysis.

Strategy
--------
1. Category  — zero-shot softmax score (model-native probability)
2. Priority  — blend: 60% zero-shot + 40% keyword rules
3. Summary   — heuristic based on inference source
4. Overall   — weighted blend of the three signals

Weights favour category because mis-routing is the costliest error.
"""

from dataclasses import dataclass

CATEGORY_WEIGHT = 0.50
PRIORITY_WEIGHT = 0.30
SUMMARY_WEIGHT = 0.20

SUMMARY_CONFIDENCE = {
    "local": 0.88,
    "api": 0.85,
    "fallback": 0.62,
}


def fallback_summary_confidence(category_score: float, priority_score: float) -> float:
    """Heuristic summary confidence when ML summarization is unavailable."""
    return round(min(0.55 + 0.25 * category_score + 0.15 * priority_score, 0.75), 4)


@dataclass(frozen=True)
class ConfidenceBreakdown:
    category: float
    priority: float
    summary: float
    overall: float

    def as_dict(self) -> dict[str, float]:
        return {
            "category": round(self.category, 4),
            "priority": round(self.priority, 4),
            "summary": round(self.summary, 4),
            "overall": round(self.overall, 4),
        }


def blend_priority(zero_shot_score: float, keyword_score: float) -> float:
    return round(0.6 * zero_shot_score + 0.4 * keyword_score, 4)


def score_summary(inference_source: str) -> float:
    return SUMMARY_CONFIDENCE.get(inference_source, 0.55)


def score_overall(category: float, priority: float, summary: float) -> float:
    overall = (
        CATEGORY_WEIGHT * category
        + PRIORITY_WEIGHT * priority
        + SUMMARY_WEIGHT * summary
    )
    return round(min(max(overall, 0.0), 1.0), 4)


def build_confidence(
    category_score: float,
    priority_zero_shot: float,
    priority_keyword: float,
    inference_source: str,
) -> ConfidenceBreakdown:
    priority = blend_priority(priority_zero_shot, priority_keyword)
    if inference_source == "fallback":
        summary = fallback_summary_confidence(category_score, priority)
    else:
        summary = score_summary(inference_source)
    overall = score_overall(category_score, priority, summary)
    return ConfidenceBreakdown(
        category=round(category_score, 4),
        priority=priority,
        summary=summary,
        overall=overall,
    )
