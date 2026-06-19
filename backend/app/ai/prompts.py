"""Prompt templates for zero-shot classification.

Hypothesis templates anchor the model to the support-ticket domain,
improving accuracy over raw label names alone.
"""

CATEGORY_HYPOTHESIS = "This support ticket is about {}."

PRIORITY_LABELS = ["critical", "high", "medium", "low"]
PRIORITY_HYPOTHESIS = "This support ticket has {} priority."

# Maps zero-shot priority label → canonical DB enum value
PRIORITY_CANONICAL = {
    "critical": "critical",
    "high": "high",
    "medium": "medium",
    "low": "low",
}
