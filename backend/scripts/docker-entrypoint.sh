#!/bin/sh
# Cross-platform entrypoint (runs inside Linux container on Mac / Linux / Windows Docker)
set -eu

python /app/scripts/wait_for_db.py

echo "Running migrations..."
alembic upgrade head

echo "Starting API server..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --proxy-headers \
  --forwarded-allow-ips="*"
