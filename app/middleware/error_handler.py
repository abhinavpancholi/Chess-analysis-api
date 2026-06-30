import logging
import traceback
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("chess_api")


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handles HTTPException raised intentionally in your code
    (e.g. raise HTTPException(status_code=404, detail="Not found"))
    These are expected errors — just pass the detail through cleanly.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handles Pydantic validation errors — e.g. missing required field,
    wrong type sent in request body. Returns a clean list of what's wrong.
    """
    errors = [
        {
            "field": ".".join(str(loc) for loc in err["loc"] if loc != "body"),
            "message": err["msg"],
        }
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """
    Handles any database error — connection issues, constraint violations,
    query errors. Logs the full error server-side, never exposes it to the client.
    """
    logger.error(f"Database error on {request.method} {request.url.path}: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred. Please try again."},
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catch-all for anything not handled above — bugs, unexpected None values,
    third-party library errors. This is the safety net.
    Never leaks the actual exception message or stack trace to the client.
    """
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again."},
    )