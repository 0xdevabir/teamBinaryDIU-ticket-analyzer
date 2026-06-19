# Lightweight Hugging Face AI Design

## Recommended Models

| Task | Model | Size | CPU latency |
|------|-------|------|-------------|
| Category + Priority | `typeform/distilbert-base-uncased-mnli` | ~250 MB | ~200–400 ms |
| Summary | `sshleifer/distilbart-cnn-12-6` | ~300 MB | ~300–600 ms |

Both are Distil variants of larger BART/BERT models — 40–60% smaller, 2× faster on CPU, with acceptable accuracy for support tickets.

## Pipeline

```
Title + Description
       │
       ▼
  preprocess (truncate, format)
       │
       ├─► Zero-shot ──► category + score
       ├─► Zero-shot ──► priority + score
       └─► DistilBART ─► summary
       │
       ▼
  confidence scorer ──► ai_confidence
```

## Prompt Strategy

Zero-shot uses **hypothesis templates** to anchor predictions:

| Task | Template |
|------|----------|
| Category | `This support ticket is about {}.` |
| Priority | `This support ticket has {} priority.` |

Input is formatted as:
```
Title: Unable to login
Description: User cannot login after password reset.
```

## Inference Modes

| Mode | When | Token needed |
|------|------|--------------|
| `local` | CPU inside Docker | No |
| `api` | HF Inference API | Yes |
| `auto` | local → api → keywords | Optional |

## Confidence Scoring

| Signal | Source | Weight |
|--------|--------|--------|
| Category | Zero-shot softmax | 50% |
| Priority | 60% zero-shot + 40% keywords | 30% |
| Summary | Source-based heuristic | 20% |

**Overall** = 0.50×category + 0.30×priority + 0.20×summary

Example for "Unable to login / password reset":
- Category: Account @ 0.91
- Priority: high @ 0.78 (zero-shot) + keyword boost
- Summary: local @ 0.88
- **Overall: ~0.85**

## Architecture

```
AnalysisPipeline
  └── InferenceEngine
        ├── LocalEngine      (transformers pipelines, asyncio.to_thread)
        ├── HuggingFaceClient (HTTP fallback)
        └── keyword fallbacks (classifier.py, priority_detector.py)
```

Models are lazy-loaded once via `model_registry.py` and optionally preloaded at app startup.
