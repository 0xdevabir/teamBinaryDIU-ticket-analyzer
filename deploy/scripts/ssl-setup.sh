#!/usr/bin/env bash
# =============================================================================
# Obtain Let's Encrypt SSL certificate and enable HTTPS Nginx config
# Run from project root on the VM after app is running on HTTP.
#
# Prerequisites:
#   - DOMAIN and LETSENCRYPT_EMAIL set in .env
#   - DNS A record points to this server
#   - HTTP-only nginx config already active
#
#   sudo bash deploy/scripts/ssl-setup.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Missing .env — copy deploy/.env.production.example to .env first."
  exit 1
fi

# shellcheck disable=SC1091
source .env

: "${DOMAIN:?Set DOMAIN in .env}"
: "${LETSENCRYPT_EMAIL:?Set LETSENCRYPT_EMAIL in .env}"

echo "==> Requesting certificate for ${DOMAIN}..."
certbot certonly \
  --webroot \
  -w /var/www/certbot \
  -d "${DOMAIN}" \
  --email "${LETSENCRYPT_EMAIL}" \
  --agree-tos \
  --no-eff-email \
  --non-interactive

echo "==> Installing HTTPS Nginx config..."
sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" \
  deploy/nginx/ticket-analyzer.conf \
  > /etc/nginx/sites-available/ticket-analyzer.conf

ln -sf /etc/nginx/sites-available/ticket-analyzer.conf /etc/nginx/sites-enabled/ticket-analyzer.conf
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

echo "==> Setting up auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "==> SSL setup complete."
echo "    Site: https://${DOMAIN}"
certbot certificates
