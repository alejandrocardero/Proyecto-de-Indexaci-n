"""Endpoints de inferencia real de modelos HF (embeddings y chat)."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
    model: str | None = None


class ChatRequest(BaseModel):
    messages: list[dict[str, str]]
    parameters: dict[str, Any] | None = None


class TestRequest(BaseModel):
    type: str = "embedding"


@router.post("/embedding")
def embedding_endpoint(payload: EmbeddingRequest):
    """Genera embeddings reales con sentence-transformers."""
    texts = [payload.inputs] if isinstance(payload.inputs, str) else payload.inputs
    if not texts or any(not t.strip() for t in texts):
        raise HTTPException(status_code=400, detail="inputs no puede estar vacío")
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
def chat_endpoint(payload: ChatRequest):
    """Genera una respuesta real con el modelo de lenguaje local."""
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
def test_endpoint(payload: TestRequest):
    """Prueba real de los modelos, usada por el botón 'Probar conexión'."""
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
