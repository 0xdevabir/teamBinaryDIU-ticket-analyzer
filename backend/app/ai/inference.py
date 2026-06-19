"""Unified inference facade: local CPU → HF API → keyword fallback."""

from __future__ import annotations

import logging
import time

from app.ai.classifier import fallback_category
from app.ai.confidence import build_confidence
from app.ai.hf_client import HuggingFaceClient
from app.ai.local_engine import LocalEngine
from app.ai.priority_detector import keyword_priority_score
from app.ai.prompts import PRIORITY_LABELS
from app.ai.result import AnalysisResult
from app.ai.summarizer import truncate_summary
from app.config import settings

logger = logging.getLogger(__name__)


def _format_ticket_text(title: str, description: str) -> str:
    return f"Title: {title}\nDescription: {description}"


class InferenceEngine:
    def __init__(self) -> None:
        self._local = LocalEngine()
        self._api = HuggingFaceClient()

    async def analyze(self, title: str, description: str) -> AnalysisResult:
        started = time.perf_counter()
        text = _format_ticket_text(title, description)
        source = "fallback"

        category, cat_score = fallback_category(text), 0.5
        priority, pri_zs_score = "medium", 0.5
        summary = truncate_summary(text)

        if settings.ai_inference_mode in {"local", "auto"}:
            try:
                category, cat_score, priority, pri_zs_score, summary = (
                    await self._local.analyze_parallel(text)
                )
                source = "local"
            except Exception as exc:
                logger.warning("Local inference failed: %s", exc)
                if settings.ai_inference_mode == "local":
                    return self._fallback_result(text, started)

        if source == "fallback" and settings.ai_inference_mode in {"api", "auto"} and self._api.enabled:
            try:
                category, cat_score = await self._api.zero_shot(
                    text, settings.ticket_categories, "This support ticket is about {}."
                )
                priority, pri_zs_score = await self._api.zero_shot(
                    text, PRIORITY_LABELS, "This support ticket has {} priority."
                )
                summary = await self._api.summarize(text)
                source = "api"
            except Exception as exc:
                logger.warning("HF API inference failed: %s", exc)

        if source == "fallback":
            return self._fallback_result(text, started)

        pri_kw_score = keyword_priority_score(text, priority)[1]
        confidence = build_confidence(cat_score, pri_zs_score, pri_kw_score, source)
        elapsed_ms = int((time.perf_counter() - started) * 1000)

        return AnalysisResult(
            category=category,
            priority=priority,
            summary=summary,
            ai_confidence=confidence.overall,
            confidence_breakdown=confidence.as_dict(),
            inference_source=source,
            processing_ms=elapsed_ms,
        )

    def _fallback_result(self, text: str, started: float) -> AnalysisResult:
        category = fallback_category(text)
        priority, pri_kw = keyword_priority_score(text)
        confidence = build_confidence(0.5, 0.5, pri_kw, "fallback")
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        return AnalysisResult(
            category=category,
            priority=priority,
            summary=truncate_summary(text),
            ai_confidence=confidence.overall,
            confidence_breakdown=confidence.as_dict(),
            inference_source="fallback",
            processing_ms=elapsed_ms,
        )
