PRIORITY_KEYWORDS = {
    "critical": ["urgent", "critical", "emergency", "down", "outage", "cannot access"],
    "high": ["failed", "error", "broken", "not working", "blocked"],
    "medium": ["slow", "issue", "problem", "help"],
    "low": ["question", "request", "suggestion", "feedback"],
}


def detect_priority(text: str) -> tuple[str, float]:
    lowered = text.lower()
    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            confidence = 0.9 if priority in {"critical", "high"} else 0.7
            return priority, confidence
    return "medium", 0.6
