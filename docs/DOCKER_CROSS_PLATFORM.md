# Docker — Cross-Platform Guide

Run **Ticket Analyzer** on **macOS**, **Linux**, and **Windows** using Docker.

All containers run **Linux** inside Docker — the same images work everywhere.

---

## Requirements

| Platform | Tool | Minimum RAM |
|----------|------|-------------|
| **macOS** (Intel / Apple Silicon) | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 4 GB allocated |
| **Windows** | Docker Desktop + **WSL2** backend | 4 GB allocated |
| **Linux** | Docker Engine + Compose plugin | 4 GB system RAM |

Enable in Docker Desktop → **Settings → Resources → Memory: 4GB+**

---

## Quick Start (All Platforms)

```bash
git clone <repo-url>
cd teamBinaryDIU-ticket-analyzer
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## Platform Notes

### macOS (Apple Silicon M1/M2/M3)

- Native **arm64** images — no extra config needed
- First AI analysis downloads models (~550 MB) — be patient
- If build is slow, ensure Docker Desktop uses **VirtioFS** for file sharing

### macOS (Intel)

- Uses **amd64** images automatically
- Same commands as above

### Windows

1. Install **Docker Desktop** with **WSL2** enabled
2. Clone repo inside WSL2 Ubuntu (recommended) or use Windows path
3. If **port 80 is blocked**, edit `.env`:

```env
FRONTEND_PORT=8080
CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
```

4. Open http://localhost:8080

**Line endings:** `.gitattributes` forces LF for shell scripts — if entrypoint fails with `$'\r'`, run:

```bash
git config core.autocrlf input
git checkout -- backend/scripts/
```

### Linux

```bash
# Install Docker (Ubuntu)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Log out and back in

docker compose up --build
```

---

## Development Mode (Hot Reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |

---

## Cross-Platform Design Choices

| Feature | Why |
|---------|-----|
| `python:3.12-slim-bookworm` | Stable on amd64 + arm64 |
| CPU PyTorch wheel index | Auto-selects architecture |
| `node:20-alpine` / `nginx:alpine` | Official multi-arch images |
| `postgres:16-alpine` | Multi-arch, lightweight |
| Python `wait_for_db.py` | No shell `seq` / CRLF issues |
| `.gitattributes` LF for `*.sh` | Windows checkout safety |
| Named volumes | `postgres_data`, `huggingface_cache` |
| `PRELOAD_MODELS_ON_STARTUP=false` | Fast healthy startup on all devices |
| Healthcheck `/health` | Lightweight liveness probe |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `backend unhealthy` | `docker compose logs backend` — wait 90s on first start |
| Port 80 in use (Windows) | Set `FRONTEND_PORT=8080` in `.env` |
| Out of memory | Increase Docker RAM to 4–6 GB |
| Slow on Apple Silicon | Normal for first AI run (model download) |
| Permission denied (Linux) | `sudo usermod -aG docker $USER` |
| WSL2 file watch issues | Clone repo inside `\\wsl$\Ubuntu\home\...` |

### Reset everything

```bash
docker compose down -v
docker compose up --build
```

### Force amd64 (rare — compatibility testing)

```bash
DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose up --build
```

---

## Environment Variables

See `.env.example` for full list. Key cross-platform vars:

```env
FRONTEND_PORT=80          # Use 8080 on Windows if 80 blocked
BACKEND_PORT=8000
PRELOAD_MODELS_ON_STARTUP=false
DB_WAIT_ATTEMPTS=30
```
