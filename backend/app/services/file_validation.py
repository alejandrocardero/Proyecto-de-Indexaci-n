"""Validación real de archivos subidos (tipo por magic bytes + tamaño).

El `Content-Type` lo envía el cliente y no es de confianza: un atacante puede
etiquetar un script como `image/png`. Comprobamos la firma binaria real antes
de aceptar el archivo.
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
MAX_FILENAME_LENGTH = 200


@dataclass(frozen=True)
class FileKind:
    mime: str
    signatures: tuple[bytes, ...]
    offsets: tuple[int, ...] = (0,)


# Firma → MIME real. Para DOCX/XLSX se comprueba el prefijo ZIP + el miembro
# interno [Content_Types].xml que distingue Word de Excel.
_KINDS: tuple[FileKind, ...] = (
    FileKind("application/pdf", (b"%PDF-",)),
    FileKind("image/png", (b"\x89PNG\r\n\x1a\n",)),
    FileKind("image/jpeg", (b"\xff\xd8\xff",)),
    FileKind("image/webp", (b"RIFF",)),
)


def _is_zip_container(content: bytes) -> str | None:
    if len(content) < 8 or content[:2] != b"PK":
        return None
    head = content[:4096].lower()
    if b"word/" in head:
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if b"xl/" in head:
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    return None


_SCRIPT_MARKERS = (b"<?php", b"<script", b"<%", b"javascript:")


def detect_real_mime(content: bytes, filename: str) -> str | None:
    """Devuelve el MIME real del contenido o None si no es admitido."""
    if not content:
        return None
    head = content[:4096].lower()
    if any(marker in head for marker in _SCRIPT_MARKERS):
        return None
    for kind in _KINDS:
        for offset in kind.offsets:
            if any(content[offset:].startswith(sig) for sig in kind.signatures):
                if kind.mime == "image/webp":
                    return "image/webp" if content[8:12] == b"WEBP" else None
                return kind.mime
    if _is_zip_container(content):
        return _is_zip_container(content)
    # CSV / JSON / TXT: texto plano válido en UTF-8 sin NUL (binario disfrazado).
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        return None
    if "\x00" in text:
        return None
    lowered = filename.lower()
    # Una extensión de imagen/documento debe coincidir con su firma binaria.
    if lowered.endswith((".png", ".jpg", ".jpeg", ".webp", ".pdf", ".docx", ".xlsx")):
        return None
    if lowered.endswith(".csv"):
        return "text/csv"
    if lowered.endswith(".json"):
        return "application/json"
    return "text/plain"


def sanitize_filename(filename: str) -> str:
    """Recorta y elimina caracteres de control y separadores de ruta."""
    name = "".join(ch for ch in (filename or "") if ord(ch) >= 32 and ch not in {"/", "\\", "\r", "\n"})
    name = name.strip().strip(".") or "archivo"
    if len(name) > MAX_FILENAME_LENGTH:
        stem, dot, ext = name.rpartition(".")
        name = (stem[: MAX_FILENAME_LENGTH - len(ext) - 1] + dot + ext) if dot else name[:MAX_FILENAME_LENGTH]
    return name


def validate_upload(
    content: bytes,
    filename: str,
    declared_mime: str | None,
    max_bytes: int = MAX_UPLOAD_BYTES,
) -> str:
    """Valida tamaño, nombre y firma real; devuelve el MIME detectado."""
    if not content:
        raise HTTPException(status_code=400, detail="El archivo está vacío")
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"El archivo supera {max_bytes // (1024*1024)} MB")
    if len(filename) > MAX_FILENAME_LENGTH:
        raise HTTPException(status_code=400, detail="El nombre del archivo es demasiado largo")

    real_mime = detect_real_mime(content, filename)
    if real_mime is None:
        raise HTTPException(
            status_code=415,
            detail="Formato no admitido o el contenido no coincide con la extensión declarada",
        )
    if declared_mime and declared_mime not in {"application/octet-stream", real_mime, "text/csv", "application/json"}:
        raise HTTPException(
            status_code=415,
            detail=f"El contenido es {real_mime}, no {declared_mime}",
        )
    return real_mime
