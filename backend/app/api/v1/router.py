from fastapi import APIRouter

from app.api.v1 import categories, dashboard, health, tickets

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(categories.router, tags=["categories"])
api_router.include_router(tickets.router, tags=["tickets"])
api_router.include_router(dashboard.router, tags=["dashboard"])
