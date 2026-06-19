"""Exception handlers and shared HTTP utilities."""

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.core.exceptions import AppError


class ErrorResponse(BaseModel):
    detail: str
    error_code: str | None = None


def register_exception_handlers(app) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        code = exc.__class__.__name__.replace("Error", "").upper() or "APP_ERROR"
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(detail=exc.message, error_code=code).model_dump(),
        )
