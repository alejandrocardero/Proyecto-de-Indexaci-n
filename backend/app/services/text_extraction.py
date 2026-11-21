"""Extracción de texto de documentos (PDF, DOCX, XLSX, TXT, HTML)."""

from __future__ import annotations

import io
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extrae texto de un archivo PDF usando pdfplumber."""
    try:
        import pdfplumber  # type: ignore
    except ImportError as exc:
        raise RuntimeError("pdfplumber no está instalado") from exc

    texts: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            texts.append(page_text)
    return "\n".join(texts).strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extrae texto de un archivo Word (.docx) usando python-docx."""
    try:
        from docx import Document  # type: ignore
    except ImportError as exc:
        raise RuntimeError("python-docx no está instalado") from exc

    document = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in document.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()


def extract_text_from_xlsx(file_bytes: bytes) -> str:
    """Extrae texto de un archivo Excel (.xlsx) usando openpyxl."""
    try:
        import openpyxl  # type: ignore
    except ImportError as exc:
        raise RuntimeError("openpyxl no está instalado") from exc

    workbook = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
    parts: list[str] = []
    for sheet in workbook.worksheets:
        for row in sheet.iter_rows(values_only=True):
            cells = [str(c) for c in row if c is not None and str(c).strip()]
            if cells:
                parts.append(" | ".join(cells))
    return "\n".join(parts).strip()


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extrae texto de un archivo de texto plano."""
    return file_bytes.decode("utf-8", errors="replace").strip()


def extract_text(file_bytes: bytes, content_type: str, filename: str) -> str:
    """Extrae texto de un archivo según su tipo MIME o extensión.

    Raises ValueError si el tipo no es soportado.
    """
    mime = (content_type or "application/octet-stream").lower()
    name = (filename or "").lower()

    if mime == "application/pdf" or name.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    if mime in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ) or name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    if mime in (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ) or name.endswith(".xlsx"):
        return extract_text_from_xlsx(file_bytes)
    if mime.startswith("text/") or name.endswith((".txt", ".md", ".csv")):
        return extract_text_from_txt(file_bytes)

    raise ValueError(f"Tipo de archivo no soportado para extracción: {mime} ({filename})")
