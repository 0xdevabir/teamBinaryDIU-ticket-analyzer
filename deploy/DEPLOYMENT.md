# Ticket Analyzer — Ubuntu VM Deployment Guide

Deploy the Dockerized stack (React + FastAPI + PostgreSQL) on an Ubuntu 22.04/24.04 VM with host Nginx reverse proxy and Let's Encrypt SSL.

## Architecture

```
Internet
   │
   ▼
Host Nginx :443 (SSL termination, Let's Encrypt)
   │
   ▼
Docker frontend :8080 (React SPA + internal /api proxy)
   │
   ├──► Docker backend :8000 (FastAPI)
   │         │
   │         ▼
   └──► Docker postgres :5432 (localhost only)
```

All Docker ports bind to `127.0.0.1` in production — only host Nginx is exposed to the internet.

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| VM | Ubuntu 22.04 or 24.04 LTS |
| CPU/RAM | 2 vCPU, 4 GB RAM minimum (AI models need ~2 GB) |
| Disk | 20 GB+ |
| Domain | DNS A record → VM public IP (e.g. `tickets.example.com`) |
| Ports | 22 (SSH), 80 (HTTP), 443 (HTTPS) open in cloud firewall |

---

## Step 1 — VM Setup

SSH into your server:

```bash
ssh root@YOUR_VM_IP
```

### Option A: Automated setup

```bash
git clone https://github.com/YOUR_ORG/teamBinaryDIU-ticket-analyzer.git /opt/ticket-analyzer
cd /opt/ticket-analyzer
sudo bash deploy/scripts/vm-setup.sh
```

### Option B: Manual setup

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx fail2ban
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
sudo mkdir -p /var/www/certbot /opt/ticket-analyzer
```

---

## Step 2 — Install Docker

```bash
cd /opt/ticket-analyzer
sudo bash deploy/scripts/install-docker.sh
```

Log out and back in so the `deploy` user gets Docker group access:

```bash
exit
ssh deploy@YOUR_VM_IP
```

Verify:

```bash
docker --version
docker compose version
```

---

## Step 3 — Clone App & Configure Environment

```bash
cd /opt/ticket-analyzer
git clone https://github.com/YOUR_ORG/teamBinaryDIU-ticket-analyzer.git . 2>/dev/null || git pull

cp deploy/.env.production.example .env
nano .env
```

### Required variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DOMAIN` | `tickets.example.com` | Public domain (must match DNS) |
| `LETSENCRYPT_EMAIL` | `admin@example.com` | SSL renewal notifications |
| `POSTGRES_PASSWORD` | strong random string | Database password |
| `DATABASE_URL` | `postgresql+asyncpg://ticket_user:PASSWORD@postgres:5432/ticket_analyzer` | Must match DB password |
| `CORS_ORIGINS` | `https://tickets.example.com` | Your HTTPS origin |

Generate a strong password:

```bash
openssl rand -base64 32
```

Update `DATABASE_URL` and `POSTGRES_PASSWORD` with the same value.

---

## Step 4 — Deploy Docker Stack

```bash
cd /opt/ticket-analyzer
bash deploy/scripts/deploy.sh
```

This builds and starts all three services. First run takes 5–10 minutes (AI model download).

Verify containers:

```bash
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml ps
```

Test internally:

```bash
curl -s http://127.0.0.1:8080/ | head
curl -s http://127.0.0.1:8000/api/v1/health
```

---

## Step 5 — Host Nginx Reverse Proxy (HTTP)

Before SSL, enable HTTP-only proxy so Certbot can validate your domain:

```bash
sudo bash deploy/scripts/nginx-http-setup.sh
```

Test from your machine:

```bash
curl -I http://tickets.example.com
```

You should see `200 OK` and the React app.

---

## Step 6 — SSL with Let's Encrypt

Ensure DNS A record points to the VM, then:

```bash
sudo bash deploy/scripts/ssl-setup.sh
```

This will:
1. Obtain a certificate via HTTP-01 challenge
2. Install the HTTPS Nginx config
3. Enable automatic renewal (`certbot.timer`)

Verify HTTPS:

```bash
curl -I https://tickets.example.com
```

Open in browser: **https://tickets.example.com**

---

## Step 7 — Post-Deploy Checklist

```bash
# All containers healthy
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml ps

# API ready
curl https://tickets.example.com/api/v1/health/ready

# SSL auto-renewal timer
sudo systemctl status certbot.timer

# Load demo data (optional)
curl -X POST https://tickets.example.com/api/v1/dashboard/seed
```

---

## Common Commands

### View logs

```bash
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml logs -f
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml logs -f backend
```

### Restart services

```bash
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml restart
```

### Update application

```bash
cd /opt/ticket-analyzer
git pull
bash deploy/scripts/deploy.sh
```

### Stop everything

```bash
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml down
```

### Stop and wipe database (destructive)

```bash
docker compose -f docker-compose.yml -f deploy/docker-compose.prod.yml down -v
```

### Database backup

```bash
docker exec ticket-analyzer-db pg_dump -U ticket_user ticket_analyzer > backup_$(date +%F).sql
```

### Restore database

```bash
cat backup_2026-06-19.sql | docker exec -i ticket-analyzer-db psql -U ticket_user ticket_analyzer
```

### Renew SSL manually

```bash
sudo certbot renew --dry-run
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `502 Bad Gateway` | App not running — `docker compose ps`, check frontend on `:8080` |
| Certbot fails | DNS not propagated; port 80 blocked; wrong `DOMAIN` in `.env` |
| Backend unhealthy | Check logs — first start downloads AI models (~90s) |
| CORS errors | Set `CORS_ORIGINS=https://your-domain.com` in `.env`, redeploy |
| Out of memory | Upgrade VM to 4 GB+ RAM or set `AI_INFERENCE_MODE=api` with `HF_API_TOKEN` |

---

## File Reference

```
deploy/
├── DEPLOYMENT.md                    # This guide
├── docker-compose.prod.yml          # Localhost-only port bindings
├── .env.production.example          # Production env template
├── nginx/
│   ├── ticket-analyzer.conf         # HTTPS config (after SSL)
│   └── ticket-analyzer.http-only.conf
└── scripts/
    ├── vm-setup.sh                  # Initial VM hardening
    ├── install-docker.sh            # Docker Engine install
    ├── deploy.sh                    # Build & start containers
    ├── nginx-http-setup.sh          # HTTP reverse proxy
    └── ssl-setup.sh                 # Let's Encrypt SSL
```
