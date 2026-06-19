# syntax=docker/dockerfile:1
# =============================================================================
# Ticket Analyzer — Backend (FastAPI)
# Cross-platform: linux/amd64 (Intel/Windows/Linux) + linux/arm64 (Apple Silicon)
# Targets: development | production
# =============================================================================

FROM python:3.12-slim-bookworm AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    HF_HOME=/app/.cache/huggingface \
    TRANSFORMERS_CACHE=/app/.cache/huggingface \
    HF_HUB_DISABLE_TELEMETRY=1

# Runtime deps (works on amd64 + arm64 Debian bookworm)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      libpq5 \
      tini \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# CPU-only PyTorch — auto-selects wheel for host architecture (x86_64 / aarch64)
RUN pip install --upgrade pip \
    && pip install torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install -r requirements.txt

COPY alembic.ini ./
COPY alembic ./alembic
COPY app/ ./app/
COPY scripts/wait_for_db.py scripts/docker-entrypoint.sh ./scripts/
RUN chmod +x ./scripts/docker-entrypoint.sh \
    && cp ./scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/.cache/huggingface

# Non-root user (consistent UID across platforms)
RUN groupadd --system --gid 1000 app 2>/dev/null || groupadd --gid 1000 app \
    && useradd --system --uid 1000 --gid app --create-home app 2>/dev/null \
       || useradd --uid 1000 --gid app --create-home app \
    && chown -R app:app /app

USER app

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/v1/health', timeout=5)"

ENTRYPOINT ["tini", "--"]

# ── Development ──────────────────────────────────────────────────────────────
FROM base AS development
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*
USER app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ── Production ───────────────────────────────────────────────────────────────
FROM base AS production
CMD ["docker-entrypoint.sh"]
