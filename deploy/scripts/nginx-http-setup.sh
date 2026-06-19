#!/usr/bin/env bash
# =============================================================================
# Configure host Nginx (HTTP only) before SSL certificate exists
#   sudo bash deploy/scripts/nginx-http-setup.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Missing .env"
  exit 1
fi

# shellcheck disable=SC1091
source .env
: "${DOMAIN:?Set DOMAIN in .env}"

mkdir -p /var/www/certbot

sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" \
  deploy/nginx/ticket-analyzer.http-only.conf \
  > /etc/nginx/sites-available/ticket-analyzer.conf

ln -sf /etc/nginx/sites-available/ticket-analyzer.conf /etc/nginx/sites-enabled/ticket-analyzer.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx

echo "HTTP reverse proxy active for ${DOMAIN} -> 127.0.0.1:${FRONTEND_PORT:-8080}"
