from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings

app = FastAPI(
    title="MiPymes Document Indexing API",
    version="0.2.0",
    description="API multi-tenant para gestión documental y consulta de información.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Organization-Id"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["system"])
def root():
    return {"service": "mipymes-backend", "version": "0.2.0", "docs": "/docs"}
