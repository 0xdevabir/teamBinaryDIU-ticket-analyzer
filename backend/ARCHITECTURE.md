# FastAPI Backend — Complete File Reference

## Clean Architecture Layers

```
Presentation  →  app/api/v1/
DTO           →  app/schemas/
Business      →  app/services/
Data Access   →  app/repositories/
ORM           →  app/models/
Infrastructure→  app/db/, app/config.py, app/dependencies.py
AI            →  app/ai/
Core          →  app/core/
```

## All Files

```
backend/
├── Dockerfile                      # Multi-stage Docker build (dev + prod)
├── .dockerignore
├── requirements.txt                # Python dependencies
├── pytest.ini                      # Test configuration
├── alembic.ini                     # Alembic config
├── ARCHITECTURE.md                 # This file
│
├── alembic/
│   ├── env.py                      # Migration runtime
│   └── versions/
│       └── 001_initial_schema.py   # tickets table + enums + indexes
│
├── db/
│   └── schema.sql                  # Reference PostgreSQL schema
│
├── scripts/
│   └── seed_demo.py                # CLI demo data seeder
│
├── tests/
│   ├── conftest.py                 # Pytest fixtures
│   ├── test_ai.py                  # AI unit tests
│   └── test_api.py                 # API integration tests
│
└── app/
    ├── main.py                     # FastAPI factory, CORS, lifespan
    ├── config.py                   # pydantic-settings (env vars)
    ├── dependencies.py             # DI: get_db, services
    │
    ├── core/
    │   ├── exceptions.py           # AppError, TicketNotFoundError
    │   └── handlers.py             # Global exception handlers
    │
    ├── api/v1/
    │   ├── router.py               # Route aggregator
    │   ├── health.py               # GET /health, /health/ready
    │   ├── categories.py           # GET /categories
    │   ├── tickets.py              # CRUD + POST /analyze
    │   └── dashboard.py            # Stats, recent, seed
    │
    ├── schemas/
    │   ├── ticket.py               # TicketCreate, Update, Response
    │   ├── analysis.py             # AnalysisResponse
    │   └── dashboard.py            # DashboardStats
    │
    ├── services/
    │   ├── ticket_service.py       # CRUD business logic
    │   └── analysis_service.py     # AI analysis orchestration
    │
    ├── repositories/
    │   └── ticket_repository.py    # SQLAlchemy queries
    │
    ├── models/
    │   └── ticket.py               # Ticket ORM model
    │
    ├── db/
    │   └── session.py              # Engine, session, Base
    │
    └── ai/                         # Hugging Face inference
        ├── inference.py
        ├── local_engine.py
        ├── hf_client.py
        ├── pipeline.py
        ├── model_registry.py
        ├── confidence.py
        ├── prompts.py
        ├── classifier.py
        ├── priority_detector.py
        ├── summarizer.py
        └── result.py
```

## API Routes

| Method | Endpoint | Service |
|--------|----------|---------|
| POST | `/api/v1/tickets` | TicketService.create |
| GET | `/api/v1/tickets` | TicketService.list |
| GET | `/api/v1/tickets/{id}` | TicketService.get |
| PATCH | `/api/v1/tickets/{id}` | TicketService.update |
| DELETE | `/api/v1/tickets/{id}` | TicketService.delete |
| POST | `/api/v1/tickets/{id}/analyze` | AnalysisService.analyze_ticket |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | postgresql+asyncpg://... | Async PostgreSQL connection |
| `API_V1_PREFIX` | /api/v1 | API base path |
| `CORS_ORIGINS` | localhost origins | Allowed CORS origins |
| `AI_INFERENCE_MODE` | auto | local \| api \| auto |
| `HF_API_TOKEN` | (empty) | HF API token (optional) |
| `DEBUG` | false | Enable debug logging |

## Run

```bash
docker compose up --build
# API docs: http://localhost:8000/docs
```
