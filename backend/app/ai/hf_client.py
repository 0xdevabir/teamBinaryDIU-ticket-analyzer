import httpx

from app.config import settings


class HuggingFaceClient:
    def __init__(self) -> None:
        self._timeout = settings.ai_request_timeout
        self._token = settings.hf_api_token

    @property
    def enabled(self) -> bool:
        return bool(self._token)

    async def post(self, model: str, payload: dict) -> dict | list:
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                f"https://api-inference.huggingface.co/models/{model}",
                headers={"Authorization": f"Bearer {self._token}"},
                json=payload,
            )
            response.raise_for_status()
            return response.json()

    async def zero_shot(
        self, text: str, labels: list[str], hypothesis_template: str
    ) -> tuple[str, float]:
        data = await self.post(
            settings.hf_zero_shot_model,
            {
                "inputs": text[:1000],
                "parameters": {
                    "candidate_labels": labels,
                    "hypothesis_template": hypothesis_template,
                    "multi_label": False,
                },
            },
        )
        if isinstance(data, dict):
            return data["labels"][0], float(data["scores"][0])
        raise ValueError("Unexpected zero-shot response")

    async def summarize(self, text: str) -> str:
        data = await self.post(
            settings.hf_summarization_model,
            {
                "inputs": text[:512],
                "parameters": {"max_length": 80, "min_length": 15, "do_sample": False},
            },
        )
        if isinstance(data, list) and data:
            summary = data[0].get("summary_text")
            if summary:
                return summary
        raise ValueError("Unexpected summarization response")
