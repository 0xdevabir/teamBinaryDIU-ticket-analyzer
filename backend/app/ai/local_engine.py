"""Local CPU inference engine using lightweight Distil models."""

from __future__ import annotations

import asyncio

from app.ai.model_registry import get_summarization_pipeline, get_zero_shot_pipeline
from app.ai.prompts import CATEGORY_HYPOTHESIS, PRIORITY_HYPOTHESIS, PRIORITY_LABELS
from app.config import settings


def _truncate(text: str, max_chars: int = 1024) -> str:
    return text[:max_chars]


def _run_zero_shot(text: str, labels: list[str], hypothesis: str) -> tuple[str, float]:
    pipe = get_zero_shot_pipeline()
    result = pipe(
        _truncate(text),
        candidate_labels=labels,
        hypothesis_template=hypothesis,
        multi_label=False,
    )
    return result["labels"][0], float(result["scores"][0])


def _run_summarize(text: str, max_length: int = 80, min_length: int = 15) -> str:
    pipe = get_summarization_pipeline()
    result = pipe(
        _truncate(text, 512),
        max_length=max_length,
        min_length=min_length,
        do_sample=False,
    )
    return result[0]["summary_text"]


class LocalEngine:
    async def classify_category(self, text: str) -> tuple[str, float]:
        return await asyncio.to_thread(
            _run_zero_shot,
            text,
            settings.ticket_categories,
            CATEGORY_HYPOTHESIS,
        )

    async def classify_priority(self, text: str) -> tuple[str, float]:
        label, score = await asyncio.to_thread(
            _run_zero_shot,
            text,
            PRIORITY_LABELS,
            PRIORITY_HYPOTHESIS,
        )
        return label, score

    async def summarize(self, text: str) -> str:
        return await asyncio.to_thread(_run_summarize, text)

    async def analyze_parallel(self, text: str) -> tuple[str, float, str, float, str]:
        """Run category, priority, and summary inference in parallel."""
        (category, cat_score), (priority, pri_score), summary = await asyncio.gather(
            self.classify_category(text),
            self.classify_priority(text),
            self.summarize(text),
        )
        return category, cat_score, priority, pri_score, summary
