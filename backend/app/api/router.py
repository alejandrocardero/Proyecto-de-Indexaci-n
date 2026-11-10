from fastapi import APIRouter
from app.api.routes import health, auth, organizations, documents, audit, search, members

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(members.router, prefix="/organizations", tags=["members"])
