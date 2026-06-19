# FastAPI Backend Architecture — Ticket Analyzer

## Overview

Layered monolith using async SQLAlchemy, Pydantic v2, and PostgreSQL. Each layer has a single responsibility; routes stay thin and delegate to services.

```
HTTP Request
    → API Router (validation, status codes)
    → Service Layer (business rules)
    → Repository Layer (SQL queries)
    → PostgreSQL
```

AI analysis is isolated in `app/ai/` and orchestrated by `AnalysisService`.

---

## Folder Structure

```
backend/
├── Dockerfile                    # Multi-stage: development | production
├── requirements.txt              # Python dependencies
├── alembic.ini                   # Migration config
├── alembic/
│   ├── env.py                    # Migration runtime (imports models)
│   └── versions/                 # Versioned schema migrations
├── db/
│   └── schema.sql                # Reference SQL schema
├── scripts/
│   └── seed_demo.py              # CLI seed script
└── app/
    ├── main.py                   # FastAPI app, CORS, router mount
    ├── config.py                 # pydantic-settings (env vars)
    ├── dependencies.py           # Dependency injection (DB, services)
    │
    ├── api/v1/                   # ── Presentation Layer ──
    │   ├── router.py             # Aggregates all v1 routers
    │   ├── health.py             # Liveness / readiness probes
    │   ├── categories.py         # GET /categories
    │   ├── tickets.py            # CRUD + POST /tickets/{id}/analyze
    │   └── dashboard.py          # Stats, recent, seed
    │
    ├── schemas/                  # ── DTO Layer (Pydantic) ──
    │   ├── ticket.py             # TicketCreate, Update, Response
    │   ├── analysis.py           # AnalysisResponse
    │   └── dashboard.py          # DashboardStats
    │
    ├── services/                 # ── Business Layer ──
    │   ├── ticket_service.py     # CRUD orchestration
    │   └── analysis_service.py   # AI analysis orchestration
    │
    ├── repositories/             # ── Data Access Layer ──
    │   └── ticket_repository.py  # SQLAlchemy queries
    │
    ├── models/                   # ── ORM Layer ──
    │   └── ticket.py             # SQLAlchemy Ticket model
    │
    ├── ai/                       # ── AI Integration ──
    │   ├── hf_client.py          # Hugging Face HTTP client
    │   ├── classifier.py         # Category classification
    │   ├── priority_detector.py  # Rule-based priority
    │   ├── summarizer.py         # Text summarization
    │   ├── pipeline.py           # Orchestrates AI steps
    │   └── result.py             # AnalysisResult dataclass
    │
    └── db/
        └── session.py            # Engine, session factory, get_db
```

---

## File Explanations

| File | Responsibility |
|------|----------------|
| `main.py` | Creates FastAPI app, registers middleware and `/api/v1` router |
| `config.py` | Centralizes env vars: DB URL, CORS, HF token, model names |
| `dependencies.py` | FastAPI `Depends()` factories for DB session and services |
| `api/v1/tickets.py` | HTTP mapping only — no business logic |
| `schemas/ticket.py` | Request/response contracts; validation rules |
| `services/ticket_service.py` | CRUD rules (e.g. clear AI fields when content changes) |
| `services/analysis_service.py` | Runs AI pipeline, persists results |
| `repositories/ticket_repository.py` | All `SELECT`/`INSERT`/`UPDATE`/`DELETE` |
| `models/ticket.py` | Maps `tickets` table to Python class |
| `ai/pipeline.py` | Calls HF models + fallbacks, returns `AnalysisResult` |
| `db/session.py` | Async engine, commits on success, rolls back on error |

---

## Route Structure

Base prefix: `/api/v1`

### Health

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/health` | `health.check` | Liveness probe |
| GET | `/health/ready` | `health.ready` | DB connectivity check |

### Categories

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/categories` | `categories.list_categories` | Valid category labels |

### Tickets (CRUD + AI)

| Method | Path | Handler | Status | Description |
|--------|------|---------|--------|-------------|
| POST | `/tickets` | `tickets.create_ticket` | 201 | Create ticket (no AI) |
| GET | `/tickets` | `tickets.list_tickets` | 200 | Paginated list + filters |
| GET | `/tickets/{id}` | `tickets.get_ticket` | 200 | Single ticket |
| PATCH | `/tickets/{id}` | `tickets.update_ticket` | 200 | Update title/description |
| DELETE | `/tickets/{id}` | `tickets.delete_ticket` | 204 | Delete ticket |
| POST | `/tickets/{id}/analyze` | `tickets.analyze_ticket` | 200 | Run AI analysis |

### Dashboard

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/dashboard/stats` | `dashboard.stats` | Aggregated metrics |
| GET | `/dashboard/recent` | `dashboard.recent` | Last 5 tickets |
| POST | `/dashboard/seed` | `dashboard.seed` | Load demo data |

---

## Service Layer Structure

### TicketService

```
create(data)           → repo.create()
get(id)                → repo.get_by_id()
list(filters, page)    → repo.list()
update(id, data)       → repo.get_by_id() → validate → repo.update()
                         (clears AI fields if title/description changed)
delete(id)             → repo.get_by_id() → repo.delete()
```

### AnalysisService

```
analyze(ticket_id)     → repo.get_by_id()
                       → pipeline.run(title, description)
                       → repo.apply_analysis()
```

### Dependency Flow

```
tickets.py
  └─ Depends(get_ticket_service)
       └─ TicketService(db)
            └─ TicketRepository(db)

tickets.py (analyze)
  └─ Depends(get_analysis_service)
       └─ AnalysisService(db)
            ├─ TicketRepository(db)
            └─ AnalysisPipeline()
```

---

## Docker Support

| Stage | Command | Use |
|-------|---------|-----|
| `development` | `uvicorn --reload` | Local hot-reload via compose override |
| `production` | `alembic upgrade head && uvicorn` | Runs migrations then starts API |

Environment variables injected via `.env` and `docker-compose.yml`.

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Separate create and analyze | AI is slow/optional; ticket persists even if HF fails |
| Repository pattern | Keeps SQL out of services; easy to test/mock |
| Async SQLAlchemy | Non-blocking I/O for DB + HF HTTP calls |
| PATCH for updates | Partial updates without sending full resource |
| Clear AI on content edit | Stale analysis is misleading after edits |
