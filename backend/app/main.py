import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import settings
from app.core.handlers import register_exception_handlers

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)


async def _preload_models_background() -> None:
    try:
        from app.ai.model_registry import preload_models

        await asyncio.to_thread(preload_models)
        logger.info("AI models preloaded (mode=%s)", settings.ai_inference_mode)
    except Exception as exc:
        logger.warning("AI model preload skipped: %s", exc)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting %s v%s", settings.app_name, settings.app_version)

    if settings.preload_models_on_startup and settings.ai_inference_mode in {"local", "auto"}:
        asyncio.create_task(_preload_models_background())
    elif settings.ai_inference_mode in {"local", "auto"}:
        logger.info("AI models will load on first request (lazy)")

    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="AI-powered support ticket classification and analysis",
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
