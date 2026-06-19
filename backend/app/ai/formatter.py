"""Maps internal model labels to public API response labels."""

CATEGORY_DISPLAY: dict[str, str] = {
    "Account": "Authentication",
    "Billing": "Billing",
    "Technical": "Technical",
    "Feature Request": "Feature Request",
    "Other": "General",
}

PRIORITY_DISPLAY: dict[str, str] = {
    "critical": "Critical",
    "high": "High",
    "medium": "Medium",
    "low": "Low",
}


def display_category(category: str) -> str:
    return CATEGORY_DISPLAY.get(category, category)


def display_priority(priority: str) -> str:
    return PRIORITY_DISPLAY.get(priority.lower(), priority.capitalize())
