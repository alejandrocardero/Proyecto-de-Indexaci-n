"""Rate limiting en memoria por IP (y ventana deslizante acotada).

Es suficiente para una instancia única. En un despliegue multi-proceso debe
sustituirse por un backend compartido (Redis), pero mantiene la misma interfaz.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from app.core.security_log import log_security_event

_lock = threading.Lock()
_hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(request: Request, scope: str, limit: int, window_seconds: int) -> None:
    """Lanza 429 cuando se supera `limit` peticiones en la ventana."""
    key = (scope, client_ip(request))
    now = time.monotonic()
    with _lock:
        bucket = _hits[key]
        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()
        if len(bucket) >= limit:
            retry_after = max(1, int(window_seconds - (now - bucket[0])))
            log_security_event("security.rate_limit", scope=scope, ip=key[1], retry_after=retry_after)
            raise HTTPException(
                status_code=429,
                detail={
                    "code": "RATE_LIMITED",
                    "message": f"Demasiadas peticiones. Intenta de nuevo en {retry_after} s.",
                },
                headers={"Retry-After": str(retry_after)},
            )
        bucket.append(now)


def reset_rate_limits() -> None:
    """Solo para pruebas."""
    with _lock:
        _hits.clear()
