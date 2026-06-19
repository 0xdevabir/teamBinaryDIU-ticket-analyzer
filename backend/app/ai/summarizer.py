from app.ai.hf_client import HuggingFaceClient
from app.config import settings


def truncate_summary(text: str, limit: int = 180) -> str:
    return text[:limit] + ("..." if len(text) > limit else "")


class Summarizer:
    def __init__(self, client: HuggingFaceClient) -> None:
        self._client = client

    async def summarize(self, text: str) -> str:
        if not self._client.enabled:
            return truncate_summary(text)

        try:
            data = await self._client.post(
                settings.hf_summarization_model,
                {"inputs": text[:1024]},
            )
            if isinstance(data, list) and data:
                summary = data[0].get("summary_text")
                if summary:
                    return summary
        except Exception:
            pass
        return truncate_summary(text)
