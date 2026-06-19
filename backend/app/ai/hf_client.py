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
