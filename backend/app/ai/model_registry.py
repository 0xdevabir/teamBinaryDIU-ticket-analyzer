"""Lazy-loaded Hugging Face pipeline singletons (CPU-only)."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from app.config import settings


@lru_cache(maxsize=1)
def get_zero_shot_pipeline() -> Any:
    from transformers import pipeline

    return pipeline(
        "zero-shot-classification",
        model=settings.hf_zero_shot_model,
        device="cpu",
    )


@lru_cache(maxsize=1)
def get_summarization_pipeline() -> Any:
    from transformers import pipeline

    return pipeline(
        "summarization",
        model=settings.hf_summarization_model,
        device="cpu",
    )


def preload_models() -> None:
    """Warm up pipelines at startup (optional)."""
    if settings.ai_inference_mode in {"local", "auto"}:
        get_zero_shot_pipeline()
        get_summarization_pipeline()
