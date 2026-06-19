# Ticket Analyzer

AI-powered support ticket classification platform built for workshop competition.

**Stack:** React (Vite) · FastAPI · PostgreSQL · Docker Compose · Hugging Face

## Quick Start

### 1. Clone and configure

```bash
cp .env.example .env
# Optional: add HF_API_TOKEN for real AI analysis (works without it using fallback rules)
```

### 2. Run with Docker (production build)

```bash
docker compose up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:80 |
| Backend  | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### 3. Run in development mode (hot reload)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:8000 |

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
# Start PostgreSQL locally, then:
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/health/ready` | DB readiness |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/tickets` | Submit & analyze ticket |
| GET | `/api/v1/tickets` | List tickets |
| GET | `/api/v1/tickets/{id}` | Ticket detail |
| POST | `/api/v1/tickets/{id}/reanalyze` | Re-run analysis |
| GET | `/api/v1/dashboard/stats` | Dashboard metrics |
| GET | `/api/v1/dashboard/recent` | Recent tickets |
| POST | `/api/v1/dashboard/seed` | Load demo tickets |

## Project Structure

```
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── ai/       # Hugging Face pipeline
│   │   ├── services/ # Business logic
│   └── alembic/      # DB migrations
├── frontend/         # React (Vite) dashboard
└── docker-compose.yml
```

## Hugging Face Setup

1. Create a token at https://huggingface.co/settings/tokens
2. Add to `.env`: `HF_API_TOKEN=hf_your_token`
3. Without a token, the app uses keyword-based fallback classification

## Demo Flow

1. Open the dashboard
2. Submit: *"URGENT: Payment failed but money was deducted from my card"*
3. View AI classification: **Billing**, **critical/high**, summary
4. Check dashboard stats update
