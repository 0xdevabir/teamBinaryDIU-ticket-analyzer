"""Unified inference facade: HF API (when token set) → local CPU → keyword fallback."""

from __future__ import annotations

import asyncio
import logging
import time

from app.ai.classifier import fallback_category
from app.ai.confidence import build_confidence
from app.ai.hf_client import HuggingFaceClient
from app.ai.priority_detector import keyword_priority_score
from app.ai.prompts import PRIORITY_LABELS
from app.ai.result import AnalysisResult
from app.ai.summarizer import truncate_summary
from app.config import settings

logger = logging.getLogger(__name__)

LOCAL_INFERENCE_TIMEOUT = 20  # seconds — avoid hanging/crashing on model download


def _format_ticket_text(title: str, description: str) -> str:
    return f"Title: {title}\nDescription: {description}"


class InferenceEngine:
    def __init__(self) -> None:
        self._local = None
        self._api = HuggingFaceClient()

    def _get_local(self):
        if self._local is None:
            from app.ai.local_engine import LocalEngine

            self._local = LocalEngine()
        return self._local

    async def analyze(self, title: str, description: str) -> AnalysisResult:
        started = time.perf_counter()
        text = _format_ticket_text(title, description)

        # auto + token: API first (avoids heavy local model load in Docker)
        if settings.ai_inference_mode in {"api", "auto"} and self._api.enabled:
            result = await self._try_api(text, started)
            if result:
                return result
            if settings.ai_inference_mode == "api":
                return self._fallback_result(text, started)

        if settings.ai_inference_mode in {"local", "auto"}:
            result = await self._try_local(text, started)
            if result:
                return result
            if settings.ai_inference_mode == "local":
                return self._fallback_result(text, started)

        return self._fallback_result(text, started)

    async def _try_local(self, text: str, started: float) -> AnalysisResult | None:
        try:
            category, cat_score, priority, pri_zs_score, summary = await asyncio.wait_for(
                self._get_local().analyze_parallel(text),
                timeout=LOCAL_INFERENCE_TIMEOUT,
            )
        except TimeoutError:
            logger.warning("Local inference timed out after %ss", LOCAL_INFERENCE_TIMEOUT)
            return None
        except Exception as exc:
            logger.warning("Local inference failed: %s", exc)
            return None

        pri_kw_score = keyword_priority_score(text, priority)[1]
        confidence = build_confidence(cat_score, pri_zs_score, pri_kw_score, "local")
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        return AnalysisResult(
            category=category,
            priority=priority,
            summary=summary,
            ai_confidence=confidence.overall,
            confidence_breakdown=confidence.as_dict(),
            inference_source="local",
            processing_ms=elapsed_ms,
        )

    async def _try_api(self, text: str, started: float) -> AnalysisResult | None:
        try:
            category, cat_score = await self._api.zero_shot(
                text, settings.ticket_categories, "This support ticket is about {}."
            )
            priority, pri_zs_score = await self._api.zero_shot(
                text, PRIORITY_LABELS, "This support ticket has {} priority."
            )
            summary = await self._api.summarize(text)
        except Exception as exc:
            logger.warning("HF API inference failed: %s", exc)
            return None

        pri_kw_score = keyword_priority_score(text, priority)[1]
        confidence = build_confidence(cat_score, pri_zs_score, pri_kw_score, "api")
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        return AnalysisResult(
            category=category,
            priority=priority,
            summary=summary,
            ai_confidence=confidence.overall,
            confidence_breakdown=confidence.as_dict(),
            inference_source="api",
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
