import logging
import time
from fastapi import Request

logger = logging.getLogger("chess_api.requests")

SLOW_REQUEST_THRESHOLD_MS = 500  # log a warning for anything over 500ms


async def log_requests(request: Request, call_next):
    """
    Runs around every single request.
    Logs method, path, status code, and response time.
    Warns on slow requests.
    """
    start = time.perf_counter()

    # Process the request
    response = await call_next(request)

    duration_ms = (time.perf_counter() - start) * 1000

    log_line = (
        f"{request.method} {request.url.path} "
        f"→ {response.status_code} "
        f"({duration_ms:.1f}ms)"
    )

    if duration_ms > SLOW_REQUEST_THRESHOLD_MS:
        logger.warning(f"SLOW REQUEST: {log_line}")
    else:
        logger.info(log_line)

    return response