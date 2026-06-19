#!/bin/sh
set -eu

echo "Waiting for database..."
for i in $(seq 1 30); do
  if python -c "
import asyncio, os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check():
    engine = create_async_engine(os.environ['DATABASE_URL'], pool_pre_ping=True)
    async with engine.connect() as conn:
        await conn.execute(text('SELECT 1'))
    await engine.dispose()

asyncio.run(check())
"; then
    echo "Database is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Database not reachable after 30 attempts." >&2
    exit 1
  fi
  echo "  attempt $i/30..."
  sleep 2
done

echo "Running migrations..."
alembic upgrade head

echo "Starting API server..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --proxy-headers \
  --forwarded-allow-ips="*"
