from fastapi import APIRouter

from app.api.v1 import categories, dashboard, health, tickets

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(categories.router)
api_router.include_router(tickets.router)
api_router.include_router(dashboard.router)
