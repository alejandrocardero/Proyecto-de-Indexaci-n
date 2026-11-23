"""Endpoints de autenticación local (base de datos SQLite del backend)."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.csrf import CSRF_COOKIE, SESSION_COOKIE, issue_csrf_token
from app.core.dependencies import get_current_user
from app.core.rate_limit import client_ip, enforce_rate_limit
from app.core.security_log import log_security_event
from app.services.auth_local import (
    AuthError,
    SESSION_TTL_SECONDS,
    create_password_reset,
    get_session,
    login_user,
    logout_session,
    register_user,
    reset_password,
)

router = APIRouter()


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class ForgotRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)


class ResetRequest(BaseModel):
    token: str = Field(min_length=10, max_length=200)
    password: str = Field(min_length=8, max_length=128)


def _bearer_token(authorization: str | None = Header(default=None)) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1].strip()
    return None


def _token_from(request: Request, authorization: str | None) -> str | None:
    return _bearer_token(authorization) or request.cookies.get(SESSION_COOKIE)


def _auth_error(exc: AuthError) -> HTTPException:
    return HTTPException(
        status_code=exc.status,
        detail={"code": exc.code, "message": exc.message},
    )


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        SESSION_COOKIE,
        token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/",
        max_age=SESSION_TTL_SECONDS,
    )


@router.get("/csrf")
def csrf(response: Response) -> dict[str, str]:
    """Emite el token CSRF en cookie legible + cuerpo (double-submit)."""
    token = issue_csrf_token(response, settings.is_production)
    return {"token": token, "header": "X-CSRF-Token"}


@router.post("/register")
def register(payload: RegisterRequest, request: Request, response: Response) -> dict[str, Any]:
    """Crea una cuenta en la base de datos local y devuelve una sesión."""
    enforce_rate_limit(request, "register", limit=5, window_seconds=60)
    try:
        result = register_user(payload.name, payload.email, payload.password)
    except AuthError as exc:
        log_security_event(
            "auth.register_failed", code=exc.code, ip=client_ip(request),
            email=payload.email[:120],
        )
        raise _auth_error(exc) from exc
    log_security_event("auth.register", ip=client_ip(request), user_id=result["user"]["id"])
    _set_session_cookie(response, result["token"])
    return result


@router.post("/login")
def login(payload: LoginRequest, request: Request, response: Response) -> dict[str, Any]:
    """Verifica que la cuenta exista y que la contraseña sea correcta."""
    enforce_rate_limit(request, "login", limit=8, window_seconds=60)
    try:
        result = login_user(payload.email, payload.password)
    except AuthError as exc:
        log_security_event(
            "auth.login_failed", code=exc.code, ip=client_ip(request),
            email=payload.email[:120],
        )
        raise _auth_error(exc) from exc
    log_security_event("auth.login", ip=client_ip(request), user_id=result["user"]["id"])
    _set_session_cookie(response, result["token"])
    return result


@router.post("/forgot-password")
def forgot_password(payload: ForgotRequest, request: Request) -> dict[str, Any]:
    """Genera un enlace de reseteo con expiración de 1 hora."""
    enforce_rate_limit(request, "forgot", limit=3, window_seconds=300)
    log_security_event("auth.reset_requested", ip=client_ip(request), email=payload.email[:120])
    return create_password_reset(payload.email)


@router.post("/reset-password")
def reset(payload: ResetRequest, request: Request) -> dict[str, bool]:
    """Cambia la contraseña usando un token vigente."""
    enforce_rate_limit(request, "reset", limit=5, window_seconds=300)
    try:
        result = reset_password(payload.token, payload.password)
    except AuthError as exc:
        log_security_event("auth.reset_failed", code=exc.code, ip=client_ip(request))
        raise _auth_error(exc) from exc
    # Nunca registrar el token: solo el hecho de que se consumió correctamente.
    log_security_event("auth.reset_completed", ip=client_ip(request))
    return result


@router.post("/logout")
def logout(request: Request, authorization: str | None = Header(default=None)) -> dict[str, bool]:
    """Invalida la sesión actual y borra la cookie."""
    logout_session(_token_from(request, authorization))
    return {"ok": True}


@router.get("/session")
def session(request: Request, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """Devuelve el usuario autenticado por cookie o Bearer (para hidratar la UI)."""
    try:
        return get_session(_token_from(request, authorization))
    except AuthError as exc:
        raise _auth_error(exc) from exc


@router.get("/me")
def me(user=Depends(get_current_user)):
    """Endpoint legacy compatible con tokens JWT de Supabase."""
    return {"id": user.id, "email": user.email, "metadata": user.claims.get("user_metadata", {})}
