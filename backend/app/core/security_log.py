"""Registro centralizado de eventos de seguridad.

Los eventos se escriben en `backend/data/security.log` con rotación y también
por stdout, para que el proveedor de logs del despliegue los recoja. Nunca se
registran contraseñas, tokens de sesión ni tokens de reseteo.
"""

from __future__ import annotations

import json
import logging
import logging.handlers
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

LOG_DIR = Path(__file__).resolve().parents[2] / "data"
LOG_FILE = LOG_DIR / "security.log"
LOGGER_NAME = "mipymes.security"

_configured = False


def configure_security_logging() -> logging.Logger:
    """Configura el logger una sola vez (idempotente)."""
    global _configured
    logger = logging.getLogger(LOGGER_NAME)
    if _configured:
        return logger

    logger.setLevel(logging.INFO)
    logger.propagate = False
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    fmt = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
    file_handler = logging.handlers.RotatingFileHandler(
        LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(fmt)
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(fmt)
    logger.addHandler(file_handler)
    logger.addHandler(stream_handler)
    _configured = True
    return logger


def log_security_event(event: str, **details: Any) -> None:
    """Registra un evento de seguridad con metadatos acotados."""
    logger = configure_security_logging()
    payload = {
        "event": event,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        **details,
    }
    # json.dumps evita caracteres de control en mensajes procedentes de input.
    logger.info(json.dumps(payload, ensure_ascii=False, default=str))
