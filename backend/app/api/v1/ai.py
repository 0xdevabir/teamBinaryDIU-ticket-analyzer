from functools import lru_cache

from fastapi import APIRouter, Depends

from app.schemas.ai import AnalyzeRequest, AnalyzeResponse
from app.services.inference_api_service import InferenceApiService

router = APIRouter(tags=["ai"])


@lru_cache
def get_inference_service() -> InferenceApiService:
    return InferenceApiService()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_ticket(
    data: AnalyzeRequest,
    service: InferenceApiService = Depends(get_inference_service),
):
    """
    Analyze a support ticket with AI.

    Returns category, priority, summary, and confidence score.
    Uses lightweight DistilBERT/DistilBART models on CPU.
    """
    return await service.analyze(data)
