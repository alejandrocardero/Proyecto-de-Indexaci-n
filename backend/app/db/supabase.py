from functools import lru_cache
from supabase import Client, create_client
from fastapi import HTTPException
from app.core.config import settings

@lru_cache
def get_supabase() -> Client:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="Supabase no está configurado en el backend")
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
