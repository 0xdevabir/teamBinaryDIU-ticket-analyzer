from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.ai_inference_mode in {"local", "auto"}:
        try:
            from app.ai.model_registry import preload_models

            preload_models()
            logger.info("AI models preloaded (mode=%s)", settings.ai_inference_mode)
        except Exception as exc:
            logger.warning("AI model preload skipped: %s", exc)
    yield


app = FastAPI(
    title="Ticket Analyzer API",
    description="AI-powered support ticket classification and analysis",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
