"""Pruebas de la fase 3: uploads validados, logging y SQL parametrizado."""

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.core.csrf import CSRF_HEADER
from app.services import auth_local
from app.services.file_validation import detect_real_mime, sanitize_filename, validate_upload
from fastapi import HTTPException


@pytest.fixture
def db(tmp_path, monkeypatch):
    monkeypatch.setenv("MIPYMES_AUTH_DB", str(tmp_path / "auth.db"))
    auth_local.init_db()
    return tmp_path


def test_detecta_mime_por_firma_y_no_por_extension():
    assert detect_real_mime(b"%PDF-1.7\n...", "fake.txt") == "application/pdf"
    assert detect_real_mime(b"\x89PNG\r\n\x1a\n", "fake.jpg") == "image/png"
    assert detect_real_mime(b"\xff\xd8\xff\xe0", "fake.png") == "image/jpeg"
    assert detect_real_mime(b"RIFF\x00\x00\x00\x00WEBP", "fake.jpg") == "image/webp"
    assert detect_real_mime(b"PK\x03\x04word/document.xml", "fake.docx") == (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert detect_real_mime(b"PK\x03\x04xl/workbook.xml", "fake.pdf") == (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert detect_real_mime(b"id,nombre\n1,a\n", "x.csv") == "text/csv"
    assert detect_real_mime('{"a":1}'.encode(), "x.json") == "application/json"


def test_rechaza_binario_y_script_disfrazado():
    assert detect_real_mime(b"<?php system($_GET['c']); ?>", "shell.png") is None
    assert detect_real_mime(b"<script>alert(1)</script>\x00", "x.txt") is None
    with pytest.raises(HTTPException) as exc:
        validate_upload(b"<?php echo 1; ?>", "shell.png", "image/png")
    assert exc.value.status_code == 415


def test_rechaza_tamano_excedido():
    with pytest.raises(HTTPException) as exc:
        validate_upload(b"a" * 101, "x.txt", "text/plain", max_bytes=100)
    assert exc.value.status_code == 413


def test_sanitize_filename_elimina_rutas_y_control():
    name = sanitize_filename("..\\..\\..\\etc/passwd\r\n\x00")
    assert "/" not in name and "\\" not in name
    assert "\r" not in name and "\n" not in name and "\x00" not in name
    assert len(name) <= 200


def test_extract_text_rechaza_contenido_disfrazado():
    client = TestClient(app)
    res = client.post(
        "/api/v1/documents/extract-text",
        files={"file": ("shell.png", b"<?php system($_GET['c']); ?>", "image/png")},
    )
    assert res.status_code == 415


def test_extract_text_acepta_texto_plano_real():
    client = TestClient(app)
    res = client.post(
        "/api/v1/documents/extract-text",
        files={"file": ("nota.txt", b"Contrato de indices real", "text/plain")},
    )
    assert res.status_code == 200
    assert "Contrato de indices real" in res.json()["text"]
    assert res.json()["mime_type"] == "text/plain"


def test_login_fallido_emite_evento_sin_secretos(db, monkeypatch):
    eventos = []
    monkeypatch.setattr(
        "app.api.routes.auth.log_security_event",
        lambda event, **detalles: eventos.append((event, detalles)),
    )
    client = TestClient(app)
    client.post("/api/v1/auth/register", json=_account())
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "prueba@gmail.com", "password": "ClaveErronea123"},
        headers=_csrf(client),
    )
    assert res.status_code == 401
    fallos = [d for e, d in eventos if e == "auth.login_failed"]
    assert fallos and fallos[0]["code"] == "WRONG_PASSWORD"
    assert all("ClaveErronea123" not in str(v) for v in fallos[0].values())


def test_sql_injection_no_altera_consulta(db):
    client = TestClient(app)
    payload = _account()
    payload["email"] = "prueba@gmail.com' OR '1'='1"
    # El dominio ya no es público exacto: se rechaza antes de tocar la BD.
    assert client.post("/api/v1/auth/register", json=payload).status_code == 400
    # El nombre con comillas se almacena como texto literal.
    payload = _account()
    payload["name"] = "Robert'); DROP TABLE users;--"
    assert client.post("/api/v1/auth/register", json=payload).status_code == 200
    assert client.get("/api/v1/auth/session").status_code == 200


def _account():
    return {"name": "Usuario Prueba", "email": "prueba@gmail.com", "password": "Clave1234"}


def _csrf(client):
    res = client.get("/api/v1/auth/csrf")
    assert res.status_code == 200
    return {CSRF_HEADER: res.json()["token"]}
