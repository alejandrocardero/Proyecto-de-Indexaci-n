"""Pruebas de la base de datos local de autenticación."""

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.core.csrf import CSRF_HEADER
from app.services import auth_local


@pytest.fixture
def db(tmp_path, monkeypatch):
    path = tmp_path / "auth.db"
    monkeypatch.setenv("MIPYMES_AUTH_DB", str(path))
    auth_local.init_db()
    return path


def _client():
    return TestClient(app)


def _account(email="prueba@gmail.com", password="Clave1234"):
    return {"name": "Usuario Prueba", "email": email, "password": password}


def _csrf(client):
    """Obtiene el token CSRF igual que hace el frontend antes de mutar."""
    res = client.get("/api/v1/auth/csrf")
    assert res.status_code == 200
    return {CSRF_HEADER: res.json()["token"]}


def test_registro_crea_cuenta_y_sesion(db):
    response = _client().post("/api/v1/auth/register", json=_account())
    assert response.status_code == 200
    data = response.json()
    assert data["token"].startswith("sess_")
    assert data["user"]["email"] == "prueba@gmail.com"
    assert data["user"]["role"] == "viewer"


def test_no_permite_correo_de_dominio_no_autorizado(db):
    response = _client().post(
        "/api/v1/auth/register", json=_account("usuario@empresa.com")
    )
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "INVALID_EMAIL_DOMAIN"


def test_acepta_proveedores_comunes(db):
    for email in ("a@yahoo.com", "b@hotmail.com", "c@outlook.com", "d@icloud.com"):
        response = _client().post("/api/v1/auth/register", json=_account(email))
        assert response.status_code == 200, email


def test_registro_duplicado_falla(db):
    client = _client()
    assert client.post("/api/v1/auth/register", json=_account()).status_code == 200
    response = client.post("/api/v1/auth/register", json=_account(), headers=_csrf(client))
    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "EMAIL_ALREADY_EXISTS"


def test_login_cuenta_inexistente_falla(db):
    response = _client().post(
        "/api/v1/auth/login",
        json={"email": "nocreo@gmail.com", "password": "Clave1234"},
    )
    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "ACCOUNT_NOT_FOUND"


def test_login_contrasena_incorrecta_falla(db):
    client = _client()
    client.post("/api/v1/auth/register", json=_account())
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "prueba@gmail.com", "password": "OtraClave123"},
        headers=_csrf(client),
    )
    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "WRONG_PASSWORD"


def test_login_exitoso_y_sesion_se_puede_cerrar(db):
    client = _client()
    client.post("/api/v1/auth/register", json=_account())
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "PRUEBA@GMAIL.COM", "password": "Clave1234"},
        headers=_csrf(client),
    )
    assert login.status_code == 200
    token = login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    session = client.get("/api/v1/auth/session", headers=headers)
    assert session.status_code == 200
    assert session.json()["email"] == "prueba@gmail.com"

    assert client.post("/api/v1/auth/logout", headers=headers).status_code == 200
    assert client.get("/api/v1/auth/session", headers=headers).status_code == 401


def test_contrasena_debil_falla(db):
    response = _client().post(
        "/api/v1/auth/register", json=_account(password="12345678")
    )
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "WEAK_PASSWORD"
