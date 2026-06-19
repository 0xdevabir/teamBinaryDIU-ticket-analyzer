CATEGORY_KEYWORDS = {
    "Billing": ["payment", "invoice", "refund", "charge", "billing", "money", "card"],
    "Technical": ["bug", "error", "crash", "api", "server", "loading", "slow"],
    "Account": ["login", "password", "account", "sign in", "credentials", "reset"],
    "Feature Request": ["feature", "request", "add", "improve", "suggestion", "dark mode"],
}


def fallback_category(text: str) -> str:
    category, _ = fallback_category_with_confidence(text)
    return category


def fallback_category_with_confidence(text: str) -> tuple[str, float]:
    """Keyword category + confidence from match strength (used when ML is unavailable)."""
    lowered = text.lower()
    best_category = "Other"
    best_hits = 0

    for category, keywords in CATEGORY_KEYWORDS.items():
        hits = sum(1 for keyword in keywords if keyword in lowered)
        if hits > best_hits:
            best_hits = hits
            best_category = category

    if best_hits == 0:
        return "Other", 0.45
    if best_hits >= 2:
        return best_category, 0.78
    return best_category, 0.68
