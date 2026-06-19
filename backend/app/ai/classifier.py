from app.ai.hf_client import HuggingFaceClient
from app.config import settings

CATEGORY_KEYWORDS = {
    "Billing": ["payment", "invoice", "refund", "charge", "billing", "money", "card"],
    "Technical": ["bug", "error", "crash", "api", "server", "loading", "slow"],
    "Account": ["login", "password", "account", "sign in", "credentials"],
    "Feature Request": ["feature", "request", "add", "improve", "suggestion"],
}


def fallback_category(text: str) -> str:
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return category
    return "Other"


class CategoryClassifier:
    def __init__(self, client: HuggingFaceClient) -> None:
        self._client = client

    async def classify(self, text: str) -> tuple[str, float]:
        if not self._client.enabled:
            return fallback_category(text), 0.5

        try:
            data = await self._client.post(
                settings.hf_classification_model,
                {
                    "inputs": text[:1000],
                    "parameters": {"candidate_labels": settings.ticket_categories},
                },
            )
            if isinstance(data, dict):
                return data["labels"][0], float(data["scores"][0])
        except Exception:
            pass
        return fallback_category(text), 0.5
