"""Standalone FastAPI AI microservice entry point.

Run:
    uvicorn app.ai_app:app --host 0.0.0.0 --port 8001

Endpoints:
    POST /analyze   — AI ticket analysis
    GET  /health    — Liveness probe
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.ai import router as ai_router
from app.config import settings
from app.core.handlers import register_exception_handlers

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting Ticket Analyzer AI Service")
    if settings.ai_inference_mode in {"local", "auto"}:
        try:
            from app.ai.model_registry import preload_models

            preload_models()
            logger.info("AI models loaded (mode=%s)", settings.ai_inference_mode)
        except Exception as exc:
            logger.warning("Model preload failed: %s", exc)
    yield


def create_ai_app() -> FastAPI:
    app = FastAPI(
        title="Ticket Analyzer AI Service",
        description="Lightweight CPU-based ticket classification and summarization",
        version=settings.app_version,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": "ai"}

    # Mount analyze at root /analyze for microservice consumers
    app.include_router(ai_router, prefix="")

    return app


app = create_ai_app()
