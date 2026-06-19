#!/usr/bin/env bash
# =============================================================================
# Install Docker Engine + Compose plugin on Ubuntu 22.04 / 24.04
#   sudo bash deploy/scripts/install-docker.sh
# =============================================================================
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

echo "==> Removing old Docker packages (if any)..."
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

echo "==> Adding Docker official GPG key..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo "==> Adding Docker apt repository..."
source /etc/os-release
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  ${VERSION_CODENAME} stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "==> Enabling Docker service..."
systemctl enable docker
systemctl start docker

echo "==> Adding 'deploy' user to docker group..."
usermod -aG docker deploy 2>/dev/null || usermod -aG docker "$SUDO_USER" 2>/dev/null || true

docker --version
docker compose version

echo "==> Docker installation complete."
echo "    Log out and back in (or: newgrp docker) for group changes to apply."
