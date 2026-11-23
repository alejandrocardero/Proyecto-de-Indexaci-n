"""Protección CSRF con patrón double-submit cookie.

La cookie `mipymes_csrf` NO es HttpOnly (el frontend la lee) y el token se
envía de vuelta en la cabecera `X-CSRF-Token`. Las peticiones autenticadas
con `Authorization: Bearer` no usan cookies y, por tanto, no necesitan CSRF.
"""

from __future__ import annotations

import secrets

from fastapi import HTTPException, Request, Response

CSRF_COOKIE = "mipymes_csrf"
CSRF_HEADER = "X-CSRF-Token"
SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}
SESSION_COOKIE = "mipymes_session"


def issue_csrf_token(response: Response, secure: bool) -> str:
    token = secrets.token_urlsafe(32)
    response.set_cookie(
        CSRF_COOKIE,
        token,
        httponly=False,
        secure=secure,
        samesite="lax",
        path="/",
        max_age=7 * 24 * 60 * 60,
    )
    return token


def validate_csrf(request: Request) -> None:
    if request.method in SAFE_METHODS:
        return
    # Bearer no depende de cookies: CSRF no aplica.
    if request.headers.get("authorization", "").lower().startswith("bearer "):
        return
    if not request.cookies.get(SESSION_COOKIE):
        return
    cookie_token = request.cookies.get(CSRF_COOKIE)
    header_token = request.headers.get(CSRF_HEADER)
    if not cookie_token or not header_token or not secrets.compare_digest(cookie_token, header_token):
        raise HTTPException(
            status_code=403,
            detail={"code": "CSRF_INVALID", "message": "Token CSRF inválido o ausente"},
        )
