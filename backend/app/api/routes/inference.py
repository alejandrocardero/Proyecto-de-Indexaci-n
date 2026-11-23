"""Endpoints de inferencia real de modelos HF (embeddings y chat)."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.core.rate_limit import enforce_rate_limit
from app.services.inference import (
    CHAT_MODEL,
    EMBEDDING_MODEL,
    embed_texts,
    generate_chat,
    test_chat,
    test_embedding,
)

logger = logging.getLogger(__name__)
router = APIRouter()


class EmbeddingRequest(BaseModel):
    inputs: str | list[str]
    model: str | None = Field(default=None, max_length=200)


class ChatRequest(BaseModel):
    messages: list[dict[str, str]] = Field(max_length=40)
    parameters: dict[str, Any] | None = None


class TestRequest(BaseModel):
    type: str = Field(default="embedding", max_length=20)


@router.post("/embedding")
def embedding_endpoint(payload: EmbeddingRequest, request: Request):
    """Genera embeddings reales con sentence-transformers."""
    enforce_rate_limit(request, "embedding", limit=60, window_seconds=60)
    texts = [payload.inputs] if isinstance(payload.inputs, str) else payload.inputs
    if not texts or any(not t.strip() for t in texts):
        raise HTTPException(status_code=400, detail="inputs no puede estar vacío")
    if len(texts) > 32:
        raise HTTPException(status_code=400, detail="Máximo 32 textos por petición")
    try:
        vectors = embed_texts(texts)
    except Exception as exc:
        logger.exception("Error generando embeddings")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {
        "ok": True,
        "type": "embedding",
        "model": EMBEDDING_MODEL,
        "dimensions": len(vectors[0]),
        "data": vectors,
    }


@router.post("/chat")
def chat_endpoint(payload: ChatRequest, request: Request):
    """Genera una respuesta real con el modelo de lenguaje local."""
    enforce_rate_limit(request, "chat", limit=30, window_seconds=60)
    if not payload.messages:
        raise HTTPException(status_code=400, detail="messages no puede estar vacío")
    try:
        answer = generate_chat(
            payload.messages,
            max_new_tokens=(payload.parameters or {}).get("max_new_tokens", 512),
            temperature=(payload.parameters or {}).get("temperature", 0.3),
        )
    except Exception as exc:
        logger.exception("Error generando respuesta de chat")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {
        "ok": True,
        "type": "chat",
        "model": CHAT_MODEL,
        "generated_text": answer,
    }


@router.post("/test")
def test_endpoint(payload: TestRequest, request: Request):
    """Prueba real de los modelos, usada por el botón 'Probar conexión'."""
    enforce_rate_limit(request, "test", limit=20, window_seconds=60)
    try:
        if payload.type == "embedding":
            result = test_embedding()
        elif payload.type == "chat":
            result = test_chat()
        else:
            raise HTTPException(status_code=400, detail="type debe ser 'embedding' o 'chat'")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error en prueba de modelo")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "ok": result["ok"],
        "status": 200,
        "detail": (
            f"Embeddings reales generados ({result['dimensions']} dimensiones)"
            if payload.type == "embedding"
            else "Modelo de chat respondió correctamente"
        ),
        "errorCode": None,
        "userMessage": f"Conexión exitosa con {result['model']}",
        "modelValid": True,
        **result,
    }
