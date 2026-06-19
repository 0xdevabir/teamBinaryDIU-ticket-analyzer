#!/usr/bin/env bash
# =============================================================================
# Ubuntu VM initial setup — run once as root or with sudo
#   curl -fsSL <repo>/deploy/scripts/vm-setup.sh | sudo bash
#   OR: sudo bash deploy/scripts/vm-setup.sh
# =============================================================================
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> Updating system packages..."
apt-get update -y
apt-get upgrade -y

echo "==> Installing base packages..."
apt-get install -y \
  ca-certificates \
  curl \
  git \
  gnupg \
  ufw \
  nginx \
  certbot \
  python3-certbot-nginx \
  unattended-upgrades \
  fail2ban

echo "==> Configuring firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

echo "==> Creating app user and directories..."
id -u deploy &>/dev/null || useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

mkdir -p /var/www/certbot
mkdir -p /opt/ticket-analyzer
chown -R deploy:deploy /opt/ticket-analyzer

echo "==> Enabling unattended security upgrades..."
dpkg-reconfigure -f noninteractive unattended-upgrades || true

echo "==> VM setup complete."
echo "    Next: run deploy/scripts/install-docker.sh"
