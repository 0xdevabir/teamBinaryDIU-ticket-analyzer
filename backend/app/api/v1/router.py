from fastapi import APIRouter

from app.api.v1 import ai, categories, dashboard, health, tickets

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(categories.router)
api_router.include_router(tickets.router)
api_router.include_router(ai.router)
api_router.include_router(dashboard.router)
