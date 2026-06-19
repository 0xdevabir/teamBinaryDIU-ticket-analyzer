"""Wait for PostgreSQL — used by docker-entrypoint (all platforms)."""

from __future__ import annotations

import asyncio
import os
import sys
import time

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def check() -> bool:
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("DATABASE_URL is not set", file=sys.stderr)
        return False
    engine = create_async_engine(url, pool_pre_ping=True)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        print(f"  DB not ready: {exc}")
        return False
    finally:
        await engine.dispose()


def main() -> None:
    max_attempts = int(os.environ.get("DB_WAIT_ATTEMPTS", "30"))
    delay = int(os.environ.get("DB_WAIT_DELAY", "2"))

    print("Waiting for database...")
    for attempt in range(1, max_attempts + 1):
        if asyncio.run(check()):
            print("Database is ready.")
            return
        if attempt == max_attempts:
            print("Database not reachable after max attempts.", file=sys.stderr)
            sys.exit(1)
        print(f"  attempt {attempt}/{max_attempts}...")
        time.sleep(delay)


if __name__ == "__main__":
    main()
