#!/usr/bin/env bash
# =============================================================================
# Deploy / update Ticket Analyzer on Ubuntu VM
# Run from project root as deploy user (with docker group):
#   bash deploy/scripts/deploy.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILES=(-f docker-compose.yml -f deploy/docker-compose.prod.yml)

log() { echo "[deploy] $*"; }

if [[ ! -f .env ]]; then
  log "Creating .env from production template..."
  cp deploy/.env.production.example .env
  log "Edit .env (DOMAIN, passwords, CORS) then re-run this script."
  exit 1
fi

# shellcheck disable=SC1091
source .env

log "Pulling latest code (if git repo)..."
git pull --ff-only 2>/dev/null || true

log "Building and starting containers..."
docker compose "${COMPOSE_FILES[@]}" up -d --build --remove-orphans

log "Waiting for backend health..."
for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${BACKEND_PORT:-8000}/api/v1/health/ready" > /dev/null 2>&1; then
    log "Backend is healthy."
    break
  fi
  if [[ $i -eq 60 ]]; then
    log "Backend did not become healthy in time. Check: docker compose logs backend"
    exit 1
  fi
  sleep 3
done

log "Container status:"
docker compose "${COMPOSE_FILES[@]}" ps

log "Deploy complete."
log "  Frontend (internal): http://127.0.0.1:${FRONTEND_PORT:-8080}"
log "  Backend  (internal): http://127.0.0.1:${BACKEND_PORT:-8000}/docs"
if [[ -n "${DOMAIN:-}" ]]; then
  log "  Public URL:          https://${DOMAIN}"
fi
