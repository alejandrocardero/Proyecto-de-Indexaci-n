"""Pruebas de la fase 2: cookies, CSRF, reseteo y rate limiting."""

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.services import auth_local
from app.core.csrf import CSRF_COOKIE, CSRF_HEADER, SESSION_COOKIE
from app.core.rate_limit import reset_rate_limits


@pytest.fixture
def db(tmp_path, monkeypatch):
    monkeypatch.setenv("MIPYMES_AUTH_DB", str(tmp_path / "auth.db"))
    auth_local.init_db()
    return tmp_path


def _account(email="seguro@gmail.com"):
    return {"name": "Usuario Seguro", "email": email, "password": "Clave1234"}


def _csrf(client):
    """Obtiene el token CSRF igual que hace el frontend antes de mutar."""
    res = client.get("/api/v1/auth/csrf")
    assert res.status_code == 200
    return {CSRF_HEADER: res.json()["token"]}


def test_login_establece_cookie_httponly(db):
    client = TestClient(app)
    client.post("/api/v1/auth/register", json=_account())
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "seguro@gmail.com", "password": "Clave1234"},
        headers=_csrf(client),
    )
    assert response.status_code == 200
    cookie = next(c for c in client.cookies.jar if c.name == SESSION_COOKIE)
    assert cookie.has_nonstandard_attr("HttpOnly") or "httponly" in str(cookie).lower()
    assert client.get("/api/v1/auth/session").status_code == 200


def test_csrf_bloquea_logout_sin_token(db):
    client = TestClient(app)
    client.post("/api/v1/auth/register", json=_account())
    # La cookie de sesión existe pero no se envía el token CSRF.
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "CSRF_INVALID"


def test_csrf_permite_mutar_con_token(db):
    client = TestClient(app)
    client.post("/api/v1/auth/register", json=_account())
    csrf = client.get("/api/v1/auth/csrf")
    assert csrf.status_code == 200
    token = csrf.json()["token"]
    response = client.post(
        "/api/v1/auth/logout",
        headers={CSRF_HEADER: token},
    )
    assert response.status_code == 200
    assert client.get("/api/v1/auth/session").status_code == 401


def test_reset_expira_y_se_puede_usar_una_vez(db):
    client = TestClient(app)
    client.post("/api/v1/auth/register", json=_account())

    reset_rate_limits()
    forgot = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "seguro@gmail.com"},
        headers=_csrf(client),
    )
    assert forgot.status_code == 200
    token = forgot.json()["token"]
    assert token and forgot.json()["expiresIn"] == 3600

    changed = client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "password": "NuevaClave123"},
        headers=_csrf(client),
    )
    assert changed.status_code == 200
    reused = client.post(
        "/api/v1/auth/reset-password",
        json={"token": token, "password": "OtraClave123"},
        headers=_csrf(client),
    )
    assert reused.status_code == 400
    assert reused.json()["detail"]["code"] == "INVALID_RESET_TOKEN"

    # El reseteo invalidó la sesión anterior.
    assert client.get("/api/v1/auth/session").status_code == 401
    assert client.post(
        "/api/v1/auth/login",
        json={"email": "seguro@gmail.com", "password": "NuevaClave123"},
        headers=_csrf(client),
    ).status_code == 200


def test_rate_limit_devuelve_429(db):
    client = TestClient(app)
    reset_rate_limits()
    codes = [
        client.post(
            "/api/v1/auth/login",
            json={"email": "nadie@gmail.com", "password": "Clave1234"},
        ).status_code
        for _ in range(10)
    ]
    assert 429 in codes
