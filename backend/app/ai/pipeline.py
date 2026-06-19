from app.ai.inference import InferenceEngine


class AnalysisPipeline:
    def __init__(self) -> None:
        self._engine = InferenceEngine()

    async def run(self, title: str, description: str):
        return await self._engine.analyze(title, description)
