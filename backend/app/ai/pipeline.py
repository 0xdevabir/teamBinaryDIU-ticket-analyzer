import time
from decimal import Decimal

from app.ai.classifier import CategoryClassifier
from app.ai.hf_client import HuggingFaceClient
from app.ai.priority_detector import detect_priority
from app.ai.result import AnalysisResult
from app.ai.summarizer import Summarizer


class AnalysisPipeline:
    def __init__(self) -> None:
        client = HuggingFaceClient()
        self._classifier = CategoryClassifier(client)
        self._summarizer = Summarizer(client)

    async def run(self, title: str, description: str) -> AnalysisResult:
        text = f"{title}. {description}"

        category, category_confidence = await self._classifier.classify(text)
        priority, priority_confidence = detect_priority(text)
        summary = await self._summarizer.summarize(text)

        ai_confidence = round((category_confidence + priority_confidence) / 2, 4)

        return AnalysisResult(
            category=category,
            priority=priority,
            summary=summary,
            ai_confidence=ai_confidence,
        )
