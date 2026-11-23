from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.csrf import validate_csrf
from app.core.rate_limit import client_ip
from app.core.security_log import configure_security_logging, log_security_event

_PRODUCTION = settings.is_production
configure_security_logging()

app = FastAPI(
    title="MiPymes Document Indexing API",
    version="0.2.0",
    description="API multi-tenant para gestión documental y consulta de información.",
    # La documentación interactiva queda desactivada en producción.
    docs_url=None if _PRODUCTION else "/docs",
    redoc_url=None if _PRODUCTION else "/redoc",
    openapi_url=None if _PRODUCTION else "/openapi.json",
    debug=False,
)

if _PRODUCTION:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Organization-Id",
        "X-CSRF-Token",
    ],
)


@app.middleware("http")
async def security_headers(request, call_next):
    """Fuerza HTTPS en producción y añade cabeceras de seguridad a todas las respuestas."""
    # CSRF solo aplica a peticiones que autentican con cookies. Las
    # HTTPException lanzadas desde un middleware no pasan por el manejador de
    # excepciones de FastAPI, así que las convertimos explícitamente a JSON.
    try:
        validate_csrf(request)
    except HTTPException as exc:
        log_security_event(
            "security.csrf_rejected",
            path=request.url.path,
            ip=client_ip(request),
            code=(exc.detail or {}).get("code") if isinstance(exc.detail, dict) else None,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=exc.headers,
        )
    if _PRODUCTION:
        forwarded_proto = request.headers.get("x-forwarded-proto", "")
        forwarded_proto = forwarded_proto.split(",")[0].strip().lower()
        is_https = forwarded_proto == "https" or request.url.scheme == "https"
        if not is_https:
            secure_url = request.url.replace(scheme="https")
            return RedirectResponse(str(secure_url), status_code=307)

    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'")
    response.headers.setdefault("Cross-Origin-Opener-Policy", "same-origin")
    response.headers.setdefault("Cross-Origin-Resource-Policy", "same-origin")
    if _PRODUCTION:
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        )
    return response


app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["system"])
def root():
    return {"service": "mipymes-backend", "version": "0.2.0"}
