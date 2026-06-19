CATEGORY_KEYWORDS = {
    "Billing": ["payment", "invoice", "refund", "charge", "billing", "money", "card"],
    "Technical": ["bug", "error", "crash", "api", "server", "loading", "slow"],
    "Account": ["login", "password", "account", "sign in", "credentials", "reset"],
    "Feature Request": ["feature", "request", "add", "improve", "suggestion", "dark mode"],
}


def fallback_category(text: str) -> str:
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return category
    return "Other"
