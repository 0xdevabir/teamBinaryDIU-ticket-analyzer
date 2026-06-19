# AI Ticket Analyzer

An intelligent support ticket management platform that uses **Hugging Face** machine learning models to automatically classify, prioritize, and summarize customer support tickets.

Built with **React**, **FastAPI**, **PostgreSQL**, and **Docker** — designed for workshop demos, production deployment on Ubuntu VMs, and real-world support workflows.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [AI / Hugging Face](#ai--hugging-face)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Overview

**AI Ticket Analyzer** helps support teams triage incoming tickets faster by applying NLP models at submission time. When a ticket is created, the system:

1. **Classifies** it into a category (Billing, Technical, Account, etc.)
2. **Assigns** a priority level (Low → Critical)
3. **Generates** a concise AI summary
4. **Scores** confidence for each prediction

A modern SaaS-style React dashboard provides ticket management, filtering, analytics, and one-click AI analysis — all backed by a clean-architecture FastAPI service and PostgreSQL database.

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Axios, React Router |
| Backend | FastAPI, SQLAlchemy (async), Alembic, Pydantic |
| Database | PostgreSQL 16 |
| AI | Hugging Face Transformers (DistilBERT + DistilBART) |
| Infrastructure | Docker Compose, Nginx, Let's Encrypt |

---

## Features

### Ticket Management
- Create, read, update, and delete support tickets
- Paginated ticket table with search and filters (category, priority, analyzed status)
- Ticket detail page with full description and action buttons

### AI Analysis
- Automatic classification on ticket submission
- On-demand re-analysis for existing tickets
- Stateless preview endpoint (no database write)
- Three inference modes: `local`, `api`, `auto` (with keyword fallback)
- Confidence scoring with visual progress bars

### Dashboard
- Real-time stats: total tickets, analyzed today, average confidence
- Bar charts by category and priority
- Recent tickets table with quick navigation
- One-click demo data seeding

### Developer Experience
- OpenAPI / Swagger docs at `/docs`
- Docker Compose for local and production
- Alembic database migrations
- Pytest test suite
- VM deployment scripts with SSL automation

### UI / UX
- Modern SaaS design with sidebar navigation
- Responsive layout (mobile, tablet, desktop)
- Lucide icons, Inter font, indigo brand palette
- Empty states, loading spinners, error handling

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Host Nginx (production VM — SSL termination)       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend Container (React + Nginx)                             │
│  • Serves static SPA                                            │
│  • Proxies /api/* → backend                                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend Container (FastAPI)                                    │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ API v1   │→ │ Services   │→ │ Repositories │→ │ Models   │ │
│  └──────────┘  └─────┬──────┘  └──────────────┘  └──────────┘ │
│                      │                                          │
│                      ▼                                          │
│               ┌──────────────┐                                  │
│               │ AI Pipeline  │                                  │
│               │ DistilBERT   │                                  │
│               │ DistilBART   │                                  │
│               └──────────────┘                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  PostgreSQL 16                                                  │
│  • tickets table (single-table design)                           │
│  • ENUM types, indexes, full-text search                         │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Layers (Clean Architecture)

```
Presentation   →  app/api/v1/          (route handlers)
DTO            →  app/schemas/         (Pydantic models)
Business       →  app/services/        (ticket + analysis logic)
Data Access    →  app/repositories/    (SQLAlchemy queries)
ORM            →  app/models/          (database models)
Infrastructure →  app/db/, config.py   (engine, settings)
AI             →  app/ai/              (Hugging Face pipeline)
Core           →  app/core/            (exceptions, handlers)
```

### AI Pipeline

```
Title + Description
       │
       ▼
  Preprocess (truncate, format)
       │
       ├─► Zero-shot (DistilBERT) ──► Category + score
       ├─► Zero-shot (DistilBERT) ──► Priority + score
       └─► Summarization (DistilBART) ► Summary
       │
       ▼
  Confidence scorer ──► ai_confidence (0.0 – 1.0)
```

### Frontend Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Stats, charts, recent tickets |
| `/tickets` | Ticket List | Filterable data table |
| `/tickets/:id` | Ticket Detail | Description + inline AI results |
| `/tickets/:id/ai` | AI Results | Dedicated analysis view |
| `/create` | Create Ticket | Form with submit & preview |
| `/ai-results` | AI Preview | Stateless analysis results |

---

## Database Design

### Entity: `tickets`

Single-table design — AI analysis fields are stored inline on the ticket row (no separate analysis table).

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` | Primary key (`gen_random_uuid()`) |
| `title` | `VARCHAR(200)` | Ticket title (min 3 chars) |
| `description` | `TEXT` | Full description (min 10 chars) |
| `category` | `ticket_category` ENUM | AI category — `NULL` until analyzed |
| `priority` | `ticket_priority` ENUM | AI priority — `NULL` until analyzed |
| `summary` | `TEXT` | AI-generated summary |
| `ai_confidence` | `NUMERIC(5,4)` | Blended confidence score (0–1) |
| `created_at` | `TIMESTAMPTZ` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | Auto-updated on every change |

### ENUM Types

**`ticket_category`:** `Billing`, `Technical`, `Account`, `Feature Request`, `Other`

**`ticket_priority`:** `low`, `medium`, `high`, `critical`

### Indexes

| Index | Purpose |
|-------|---------|
| `idx_tickets_category` | Filter by category |
| `idx_tickets_priority` | Filter by priority |
| `idx_tickets_created_at_desc` | Recent-first listing |
| `idx_tickets_pending` | Partial — unanalyzed tickets only |
| `idx_tickets_analyzed` | Partial — analyzed tickets for reporting |
| `idx_tickets_fts` | GIN full-text search on title + description |

### ER Diagram

```
┌─────────────────────────────────────────────┐
│                  tickets                     │
├─────────────────────────────────────────────┤
│ PK  id              UUID                    │
│     title           VARCHAR(200)  NOT NULL  │
│     description     TEXT          NOT NULL  │
│     category        ENUM          NULLABLE  │
│     priority        ENUM          NULLABLE  │
│     summary         TEXT          NULLABLE  │
│     ai_confidence   NUMERIC(5,4)  NULLABLE  │
│     created_at      TIMESTAMPTZ     NOT NULL  │
│     updated_at      TIMESTAMPTZ     NOT NULL  │
└─────────────────────────────────────────────┘
```

Full reference schema: [`backend/db/schema.sql`](backend/db/schema.sql)

Migrations managed by Alembic: [`backend/alembic/versions/`](backend/alembic/versions/)

---

## Installation

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| Python | 3.12 |
| PostgreSQL | 16+ |
| Docker | 24+ (optional) |
| Docker Compose | v2+ (optional) |

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/teamBinaryDIU-ticket-analyzer.git
cd teamBinaryDIU-ticket-analyzer
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` as needed. Key variables:

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Async SQLAlchemy connection string |
| `CORS_ORIGINS` | Allowed frontend origins |
| `AI_INFERENCE_MODE` | `local` \| `api` \| `auto` |
| `HF_API_TOKEN` | Hugging Face token (optional) |

### 3. Backend (local)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend (local)

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## Docker Setup

### Production (single command)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL | Container |
|---------|-----|-----------|
| Frontend | http://localhost:80 | `ticket-analyzer-ui` |
| Backend | http://localhost:8000 | `ticket-analyzer-api` |
| API Docs | http://localhost:8000/docs | — |
| PostgreSQL | localhost:5432 | `ticket-analyzer-db` |

### Development (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |

### Docker files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Production stack (3 services) |
| `docker-compose.dev.yml` | Dev overrides (volume mounts, reload) |
| `backend/Dockerfile` | Multi-stage: `development` / `production` |
| `frontend/Dockerfile` | Multi-stage: `development` / `build` / `production` |
| `deploy/docker-compose.prod.yml` | VM overrides (localhost-only ports) |

### Useful commands

```bash
# View logs
docker compose logs -f

# Stop all services
docker compose down

# Reset database (destructive)
docker compose down -v

# Rebuild a single service
docker compose up -d --build backend
```

---

## Deployment

Production deployment on **Ubuntu 22.04/24.04** with host Nginx reverse proxy and **Let's Encrypt SSL**.

**Full guide:** [`deploy/DEPLOYMENT.md`](deploy/DEPLOYMENT.md)

### Quick start (VM)

```bash
# 1. VM setup + Docker
sudo bash deploy/scripts/vm-setup.sh
sudo bash deploy/scripts/install-docker.sh

# 2. Configure
cp deploy/.env.production.example .env
nano .env   # set DOMAIN, passwords, CORS

# 3. Deploy containers
bash deploy/scripts/deploy.sh

# 4. Nginx + SSL
sudo bash deploy/scripts/nginx-http-setup.sh
sudo bash deploy/scripts/ssl-setup.sh
```

### Production architecture

```
Internet → Nginx :443 (SSL) → Docker frontend :8080 → /api → backend :8000 → postgres
```

All Docker ports bind to `127.0.0.1` — only host Nginx is exposed publicly.

### VM requirements

| Resource | Minimum |
|----------|---------|
| OS | Ubuntu 22.04 / 24.04 LTS |
| CPU | 2 vCPU |
| RAM | 4 GB |
| Disk | 20 GB |
| Ports | 22, 80, 443 |

---

## API Documentation

Interactive docs available at **http://localhost:8000/docs** (Swagger UI) and **/redoc**.

Base URL: `/api/v1`

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness check |
| `GET` | `/health/ready` | Readiness check (includes DB ping) |

**Response** `GET /health`:
```json
{ "status": "ok" }
```

**Response** `GET /health/ready`:
```json
{ "status": "ready", "database": "connected" }
```

---

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | List supported ticket categories |

---

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tickets` | Create a new ticket |
| `GET` | `/tickets` | List tickets (paginated, filterable) |
| `GET` | `/tickets/{id}` | Get ticket by ID |
| `PATCH` | `/tickets/{id}` | Update ticket title/description |
| `DELETE` | `/tickets/{id}` | Delete ticket |
| `POST` | `/tickets/{id}/analyze` | Run AI analysis and persist results |

**Create ticket** `POST /tickets`:
```json
{
  "title": "Unable to login",
  "description": "User cannot login after password reset. Error 401 shown."
}
```

**Response** `201 Created`:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Unable to login",
  "description": "User cannot login after password reset. Error 401 shown.",
  "category": null,
  "priority": null,
  "summary": null,
  "ai_confidence": null,
  "created_at": "2026-06-19T10:00:00Z",
  "updated_at": "2026-06-19T10:00:00Z"
}
```

**List tickets** `GET /tickets`:

| Query param | Type | Description |
|-------------|------|-------------|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (1–100, default: 20) |
| `analyzed` | bool | Filter by analysis status |
| `category` | string | Filter by category |
| `priority` | string | Filter by priority |
| `search` | string | Full-text search |

**Response**:
```json
{
  "items": [ { "...ticket" } ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

**Analyze ticket** `POST /tickets/{id}/analyze`:

Persists AI results on the ticket row and returns the updated ticket with `category`, `priority`, `summary`, and `ai_confidence` populated.

---

### AI (Stateless)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/analyze` | Analyze text without saving to database |

**Request**:
```json
{
  "title": "URGENT: Payment failed",
  "description": "Money was deducted from my card but payment shows as failed."
}
```

**Response**:
```json
{
  "category": "Billing",
  "priority": "High",
  "summary": "Customer reports payment failure despite card charge.",
  "confidence": 0.87
}
```

---

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/stats` | Aggregated metrics |
| `GET` | `/dashboard/recent` | Latest tickets |
| `POST` | `/dashboard/seed` | Load demo tickets |

**Response** `GET /dashboard/stats`:
```json
{
  "total_tickets": 15,
  "analyzed_today": 3,
  "by_category": { "Billing": 5, "Technical": 4, "Account": 3 },
  "by_priority": { "high": 4, "medium": 6, "low": 3, "critical": 2 },
  "avg_confidence": 0.84
}
```

---

## Screenshots

> Add screenshots to [`docs/screenshots/`](docs/screenshots/) and uncomment the images below.

### Dashboard
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->
*Dashboard with stats cards, category/priority charts, and recent tickets table.*

### Ticket List
<!-- ![Ticket List](docs/screenshots/ticket-list.png) -->
*Paginated ticket table with search, category, priority, and status filters.*

### Create Ticket
<!-- ![Create Ticket](docs/screenshots/create-ticket.png) -->
*Ticket creation form with submit-and-analyze and preview-only options.*

### Ticket Detail
<!-- ![Ticket Detail](docs/screenshots/ticket-detail.png) -->
*Ticket detail page showing description, badges, and AI analysis panel.*

### AI Results
<!-- ![AI Results](docs/screenshots/ai-results.png) -->
*AI analysis results with category, priority, summary, and confidence score.*

---

## Project Structure

```
teamBinaryDIU-ticket-analyzer/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── api/v1/             # REST route handlers
│   │   ├── ai/                 # Hugging Face inference pipeline
│   │   ├── core/               # Exceptions, error handlers
│   │   ├── db/                 # SQLAlchemy engine & session
│   │   ├── models/             # ORM models
│   │   ├── repositories/       # Data access layer
│   │   ├── schemas/            # Pydantic DTOs
│   │   ├── services/           # Business logic
│   │   ├── config.py           # Environment settings
│   │   └── main.py             # Application entry point
│   ├── alembic/                # Database migrations
│   ├── db/schema.sql           # Reference PostgreSQL schema
│   ├── scripts/                # Seed & Docker entrypoint
│   ├── tests/                  # Pytest suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/                # Axios HTTP clients
│   │   ├── components/         # UI, layout, tickets, dashboard
│   │   ├── hooks/              # Data-fetching hooks
│   │   ├── pages/              # Route-level pages
│   │   ├── routes/             # React Router config
│   │   └── types/              # TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf              # Container reverse proxy
│
├── deploy/                     # Production VM deployment
│   ├── DEPLOYMENT.md           # Full deployment guide
│   ├── docker-compose.prod.yml
│   ├── nginx/                  # Host Nginx configs
│   └── scripts/                # Setup & deploy automation
│
├── docs/
│   └── screenshots/            # README screenshots
│
├── docker-compose.yml          # Production Docker stack
├── docker-compose.dev.yml      # Development overrides
├── .env.example                # Local environment template
└── README.md                   # This file
```

---

## AI / Hugging Face

### Models

| Task | Model | Size |
|------|-------|------|
| Category + Priority | `typeform/distilbert-base-uncased-mnli` | ~250 MB |
| Summary | `sshleifer/distilbart-cnn-12-6` | ~300 MB |

Both are CPU-optimized Distil variants — no GPU required.

### Inference Modes

| Mode | Behavior | Token Required |
|------|----------|----------------|
| `local` | CPU inference inside Docker container | No |
| `api` | Hugging Face Inference API | Yes (`HF_API_TOKEN`) |
| `auto` | Try local → API → keyword fallback | Optional |

Set via `AI_INFERENCE_MODE` in `.env`.

### Confidence Scoring

| Signal | Weight |
|--------|--------|
| Category (zero-shot softmax) | 50% |
| Priority (zero-shot + keywords) | 30% |
| Summary (source heuristic) | 20% |

Full design document: [`backend/app/ai/AI_DESIGN.md`](backend/app/ai/AI_DESIGN.md)

---

## Future Improvements

### Product
- [ ] User authentication and role-based access (admin, agent, viewer)
- [ ] Ticket assignment and agent workload balancing
- [ ] Email / webhook ingestion for automatic ticket creation
- [ ] Ticket status workflow (open → in progress → resolved → closed)
- [ ] Comments and internal notes on tickets
- [ ] Export tickets to CSV / PDF

### AI / ML
- [ ] Fine-tune models on domain-specific support data
- [ ] Multi-language ticket support
- [ ] Sentiment analysis and urgency detection
- [ ] Suggested reply generation for agents
- [ ] Model versioning and A/B testing
- [ ] GPU inference option for higher throughput

### Infrastructure
- [ ] Kubernetes manifests (Helm chart)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Centralized logging (ELK / Loki)
- [ ] Metrics and alerting (Prometheus + Grafana)
- [ ] Redis caching for dashboard stats
- [ ] Database read replicas for scale

### Frontend
- [ ] Dark mode toggle
- [ ] Real-time updates via WebSockets
- [ ] Bulk ticket actions (analyze, delete, export)
- [ ] Advanced analytics dashboard
- [ ] Keyboard shortcuts for power users

---

## Demo Flow

See **[docs/COMPETITION_REVIEW.md](docs/COMPETITION_REVIEW.md)** for judge evaluation and a 2-minute demo script.

1. Open the dashboard at http://localhost (or your deployed domain)
2. Click **Load Demo Data** or create a ticket manually
3. Submit: *"URGENT: Payment failed but money was deducted from my card"*
4. View AI classification: **Billing**, **High/Critical**, with summary
5. Check dashboard stats and charts update in real time

---

## License

This project was built for educational and workshop purposes. See repository license for terms.

---

<p align="center">
  Built with React · FastAPI · PostgreSQL · Docker · Hugging Face
</p>
