"""Endpoints de autenticación local (base de datos SQLite del backend)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.services.auth_local import (
    AuthError,
    get_session,
    login_user,
    logout_session,
    register_user,
)

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


def _bearer_token(authorization: str | None = Header(default=None)) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1].strip()
    return None


def _auth_error(exc: AuthError) -> HTTPException:
    return HTTPException(
        status_code=exc.status,
        detail={"code": exc.code, "message": exc.message},
    )


@router.post("/register")
def register(payload: RegisterRequest) -> dict[str, Any]:
    """Crea una cuenta en la base de datos local y devuelve una sesión."""
    try:
        return register_user(payload.name, payload.email, payload.password)
    except AuthError as exc:
        raise _auth_error(exc) from exc


@router.post("/login")
def login(payload: LoginRequest) -> dict[str, Any]:
    """Verifica que la cuenta exista y que la contraseña sea correcta."""
    try:
        return login_user(payload.email, payload.password)
    except AuthError as exc:
        raise _auth_error(exc) from exc


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)) -> dict[str, bool]:
    """Invalida la sesión actual."""
    logout_session(_bearer_token(authorization))
    return {"ok": True}


@router.get("/session")
def session(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """Devuelve el usuario autenticado por token local (para hidratar la UI)."""
    try:
        return get_session(_bearer_token(authorization))
    except AuthError as exc:
        raise _auth_error(exc) from exc


@router.get("/me")
def me(user=Depends(get_current_user)):
    """Endpoint legacy compatible con tokens JWT de Supabase."""
    return {"id": user.id, "email": user.email, "metadata": user.claims.get("user_metadata", {})}
