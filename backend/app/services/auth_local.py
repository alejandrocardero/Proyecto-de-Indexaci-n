"""Base de datos local (SQLite) para cuentas y sesiones de MiPymes.

Este servicio reemplaza la autenticación simulada del frontend. Los datos se
guardan en `backend/data/mipymes_auth.db` (ruta configurable con la variable de
entorno `MIPYMES_AUTH_DB`) y persisten entre reinicios.

Características:
- Contraseñas hasheadas con PBKDF2-HMAC-SHA256 (sal única por usuario).
- Correos restringidos a proveedores públicos conocidos (gmail, yahoo, etc.).
- Sesiones con token aleatorio y expiración, verificables desde el backend.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import time
from pathlib import Path
from typing import Any

DEFAULT_DB_PATH = Path(__file__).resolve().parents[2] / "data" / "mipymes_auth.db"
SESSION_TTL_SECONDS = 7 * 24 * 60 * 60  # 7 días
RESET_TTL_SECONDS = 60 * 60  # 1 hora
PBKDF2_ITERATIONS = 200_000

# Proveedores de correo público aceptados. Se rechazan dominios corporativos o
# personalizados para cumplir la regla: gmail, yahoo, etc.
ALLOWED_EMAIL_DOMAINS = frozenset(
    {
        "gmail.com",
        "googlemail.com",
        "yahoo.com",
        "yahoo.es",
        "yahoo.co.uk",
        "yahoo.com.mx",
        "yahoo.com.ar",
        "yahoo.com.br",
        "yahoo.fr",
        "yahoo.de",
        "yahoo.ca",
        "hotmail.com",
        "hotmail.es",
        "hotmail.co.uk",
        "outlook.com",
        "outlook.es",
        "live.com",
        "live.com.mx",
        "msn.com",
        "icloud.com",
        "me.com",
        "mac.com",
        "aol.com",
        "proton.me",
        "protonmail.com",
        "protonmail.ch",
        "mail.com",
        "gmx.com",
        "gmx.es",
        "zoho.com",
        "yandex.com",
        "yandex.ru",
    }
)

_EMAIL_RE = re.compile(r"^[^@\s]+@([^@\s]+\.[^@\s]+)$")

# Países disponibles en la indexación de documentos. El país se elige al
# registrar y queda fijo en la cuenta; el módulo de subida lo reutiliza.
ALLOWED_COUNTRIES = frozenset({"CO", "CU", "MX", "AR", "CL", "PE", "EC", "OTRO"})
DEFAULT_COUNTRY = "CO"


class AuthError(Exception):
    """Error de autenticación con código legible para el frontend."""

    def __init__(self, code: str, message: str, status: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


def db_path() -> Path:
    """Ruta de la base de datos (configurable para pruebas)."""
    return Path(os.getenv("MIPYMES_AUTH_DB", str(DEFAULT_DB_PATH)))


def init_db() -> None:
    """Crea las tablas si no existen. Idempotente."""
    path = db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(path, timeout=10) as conn:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'viewer',
                country TEXT NOT NULL DEFAULT 'CO',
                company_name TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            )
            """
        )
        # Migración para bases creadas antes de añadir país / nombre de MyPyme.
        columnas = {fila[1] for fila in conn.execute("PRAGMA table_info(users)")}
        if "country" not in columnas:
            conn.execute("ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT 'CO'")
        if "company_name" not in columnas:
            conn.execute("ALTER TABLE users ADD COLUMN company_name TEXT NOT NULL DEFAULT ''")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS password_resets (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL,
                used INTEGER NOT NULL DEFAULT 0
            )
            """
        )


def _connect() -> sqlite3.Connection:
    init_db()
    conn = sqlite3.connect(db_path(), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def normalize_email(email: str) -> str:
    """Normaliza y valida el correo. Solo permite proveedores públicos."""
    value = (email or "").strip().lower()
    match = _EMAIL_RE.match(value)
    if not match:
        raise AuthError("INVALID_EMAIL", "Ingresa un correo electrónico válido", 400)
    domain = match.group(1)
    if domain not in ALLOWED_EMAIL_DOMAINS:
        examples = ", ".join(
            sorted(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"])
        )
        raise AuthError(
            "INVALID_EMAIL_DOMAIN",
            f"Usa un correo de un proveedor permitido: {examples}",
            400,
        )
    return value


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = stored.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
        return hmac.compare_digest(candidate.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _initial_role(email: str) -> str:
    """Rol asignado al registrar. ADMIN_EMAILS define los administradores."""
    admins = {
        item.strip().lower()
        for item in os.getenv("ADMIN_EMAILS", "").split(",")
        if item.strip()
    }
    return "admin" if email in admins else "viewer"


def _public_user(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "role": row["role"],
        "country": row["country"],
        "companyName": row["company_name"],
        "createdAt": row["created_at"],
    }


def _validate_password(password: str) -> None:
    if len(password) < 8 or not re.search(r"[a-z]", password) or not re.search(
        r"[A-Z]", password
    ) or not re.search(r"\d", password):
        raise AuthError(
            "WEAK_PASSWORD",
            "La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula y número",
            400,
        )


def _validate_name(name: str) -> str:
    value = (name or "").strip()
    if len(value) < 2 or len(value) > 80:
        raise AuthError("INVALID_NAME", "El nombre debe tener entre 2 y 80 caracteres", 400)
    return value


def _validate_country(country: str) -> str:
    value = (country or "").strip().upper()
    if value not in ALLOWED_COUNTRIES:
        raise AuthError("INVALID_COUNTRY", "Selecciona un país válido", 400)
    return value


def _validate_company_name(company: str) -> str:
    value = " ".join((company or "").split())
    if len(value) < 2 or len(value) > 100:
        raise AuthError("INVALID_COMPANY", "El nombre de la MyPyme debe tener entre 2 y 100 caracteres", 400)
    return value


def _create_session(conn: sqlite3.Connection, user_id: str) -> str:
    token = "sess_" + secrets.token_urlsafe(32)
    now = int(time.time())
    conn.execute(
        "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, user_id, now, now + SESSION_TTL_SECONDS),
    )
    return token


def register_user(
    name: str,
    email: str,
    password: str,
    country: str = DEFAULT_COUNTRY,
    company_name: str = "MiPyme",
) -> dict[str, Any]:
    """Crea una cuenta con país y MyPyme. Falla si el correo ya existe."""
    clean_email = normalize_email(email)
    clean_name = _validate_name(name)
    clean_country = _validate_country(country)
    clean_company = _validate_company_name(company_name)
    _validate_password(password)

    user_id = "usr_" + secrets.token_hex(8)
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with _connect() as conn:
        exists = conn.execute(
            "SELECT 1 FROM users WHERE email = ?", (clean_email,)
        ).fetchone()
        if exists:
            raise AuthError(
                "EMAIL_ALREADY_EXISTS",
                "Ya existe una cuenta con ese correo. Inicia sesión.",
                409,
            )
        conn.execute(
            "INSERT INTO users (id, email, name, password_hash, role, country, company_name, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                user_id,
                clean_email,
                clean_name,
                hash_password(password),
                _initial_role(clean_email),
                clean_country,
                clean_company,
                created_at,
            ),
        )
        token = _create_session(conn, user_id)
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()

    return {"token": token, "user": _public_user(row)}


def login_user(email: str, password: str) -> dict[str, Any]:
    """Verifica que la cuenta exista y que la contraseña sea correcta."""
    clean_email = normalize_email(email)
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (clean_email,)
        ).fetchone()
        if row is None:
            raise AuthError(
                "ACCOUNT_NOT_FOUND",
                "No existe una cuenta con ese correo. Crea una cuenta primero.",
                404,
            )
        if not verify_password(password, row["password_hash"]):
            raise AuthError("WRONG_PASSWORD", "Contraseña incorrecta", 401)
        token = _create_session(conn, row["id"])

    return {"token": token, "user": _public_user(row)}


def get_session(token: str | None) -> dict[str, Any]:
    """Devuelve el usuario de una sesión vigente, o falla con 401."""
    if not token:
        raise AuthError("INVALID_SESSION", "No hay sesión activa", 401)
    with _connect() as conn:
        row = conn.execute(
            "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id "
            "WHERE s.token = ? AND s.expires_at > ?",
            (token, int(time.time())),
        ).fetchone()
    if row is None:
        raise AuthError("INVALID_SESSION", "Sesión inválida o expirada. Inicia sesión de nuevo.", 401)
    return _public_user(row)


def logout_session(token: str | None) -> None:
    if not token:
        return
    with _connect() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


def create_password_reset(email: str) -> dict[str, Any]:
    """Crea un token de reseteo con expiración de 1 hora.

    En producción el token debe enviarse por correo; aquí se devuelve en la
    respuesta para que el flujo sea comprobable sin un proveedor de email.
    """
    clean_email = normalize_email(email)
    with _connect() as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE email = ?", (clean_email,)
        ).fetchone()
        if row is None:
            # No revelar si la cuenta existe.
            return {"token": None, "expiresIn": RESET_TTL_SECONDS}
        token = "rst_" + secrets.token_urlsafe(32)
        now = int(time.time())
        conn.execute(
            "INSERT INTO password_resets (token, user_id, created_at, expires_at) "
            "VALUES (?, ?, ?, ?)",
            (token, row["id"], now, now + RESET_TTL_SECONDS),
        )
    return {"token": token, "expiresIn": RESET_TTL_SECONDS}


def reset_password(token: str, new_password: str) -> dict[str, bool]:
    """Cambia la contraseña si el token es válido, no usado y no expirado."""
    _validate_password(new_password)
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > ?",
            (token, int(time.time())),
        ).fetchone()
        if row is None:
            raise AuthError("INVALID_RESET_TOKEN", "El enlace de reseteo es inválido o expiró", 400)
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (hash_password(new_password), row["user_id"]),
        )
        conn.execute("UPDATE password_resets SET used = 1 WHERE token = ?", (token,))
        # Invalidar sesiones existentes tras un cambio de contraseña.
        conn.execute("DELETE FROM sessions WHERE user_id = ?", (row["user_id"],))
    return {"ok": True}
