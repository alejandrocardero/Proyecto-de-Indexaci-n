from functools import lru_cache
from typing import Any
import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, status
from app.core.config import settings

@lru_cache
def _jwks_client():
    url = settings.supabase_jwks_url or (
        f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        if settings.supabase_url else ""
    )
    return PyJWKClient(url) if url else None

def decode_supabase_token(token: str) -> dict[str, Any]:
    """Verifica JWT de Supabase. Acepta claves JWKS (ES256/RS256) o secreto legacy HS256."""
    try:
        header = jwt.get_unverified_header(token)
        algorithm = header.get("alg")
        if algorithm in ("ES256", "RS256"):
            client = _jwks_client()
            if client is None:
                raise ValueError("SUPABASE_JWKS_URL o SUPABASE_URL no configurado")
            key = client.get_signing_key_from_jwt(token).key
            return jwt.decode(token, key, algorithms=[algorithm], audience=settings.supabase_audience,
                              options={"require": ["exp", "sub"]})
        if algorithm == "HS256" and settings.supabase_jwt_secret:
            return jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"],
                              audience=settings.supabase_audience, options={"require": ["exp", "sub"]})
        raise ValueError(f"Algoritmo JWT no admitido o clave ausente: {algorithm}")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Token de acceso inválido o expirado") from exc
