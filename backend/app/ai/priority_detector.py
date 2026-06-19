"""Priority detection — keyword rules used to reinforce zero-shot scores."""

PRIORITY_KEYWORDS = {
    "critical": ["urgent", "critical", "emergency", "down", "outage", "cannot access"],
    "high": ["failed", "error", "broken", "not working", "blocked", "cannot login", "unable to login"],
    "medium": ["slow", "issue", "problem", "help"],
    "low": ["question", "request", "suggestion", "feedback"],
}


def keyword_priority_score(text: str, predicted: str | None = None) -> tuple[str, float]:
    """Return (priority, confidence) from keyword rules."""
    lowered = text.lower()
    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            score = 0.92 if priority in {"critical", "high"} else 0.75
            return priority, score
    # No keyword hit — trust zero-shot prediction if provided
    if predicted:
        return predicted, 0.65
    return "medium", 0.55
