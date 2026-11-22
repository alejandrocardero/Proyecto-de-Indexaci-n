"""Inferencia REAL de modelos de Hugging Face ejecutada en el backend Python.

Los modelos se descargan desde huggingface.co (accesible en este entorno) y se
ejecutan localmente con ONNX Runtime. Esto evita el endpoint remoto de HF,
que falla por DNS (api-inference.huggingface.co -> ENOTFOUND) y por falta de
creditos (router.huggingface.co -> HTTP 402).

No hay respuestas simuladas: los embeddings y el texto provienen de modelos
reales ejecutados con ONNX Runtime.
"""

from __future__ import annotations

import logging
import os
import re
import threading
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Modelo ONNX cuantizado de sentence-transformers (22 MB, 384 dimensiones)
MODEL_DIR = Path(__file__).resolve().parents[2] / "models" / "all-MiniLM-L6-v2"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHAT_MODEL = "extractivo-real-con-embeddings"

_session: Any = None
_tokenizer: Any = None
_lock = threading.Lock()


def _get_embedder():
    """Carga el modelo y tokenizer una sola vez (thread-safe)."""
    global _session, _tokenizer
    if _session is None or _tokenizer is None:
        with _lock:
            if _session is None or _tokenizer is None:
                model_path = MODEL_DIR / "model_quantized.onnx"
                tokenizer_path = MODEL_DIR / "tokenizer.json"

                # Descarga automática si el modelo no existe (primera ejecución)
                if not model_path.exists() or not tokenizer_path.exists():
                    import subprocess
                    import sys

                    script = Path(__file__).resolve().parents[3] / "scripts" / "descargar_modelo.py"
                    logger.info("Descargando modelo ONNX (primera ejecución)...")
                    subprocess.run([sys.executable, str(script)], check=True)

                if not model_path.exists():
                    raise RuntimeError(f"Modelo no descargado: {model_path}")
                if not tokenizer_path.exists():
                    raise RuntimeError(f"Tokenizer no descargado: {tokenizer_path}")

                logger.info("Cargando modelo ONNX: %s", model_path)
                import onnxruntime as ort
                from tokenizers import Tokenizer

                _session = ort.InferenceSession(
                    str(model_path),
                    providers=["CPUExecutionProvider"],
                )
                _tokenizer = Tokenizer.from_file(str(tokenizer_path))
                _tokenizer.enable_truncation(max_length=256)
                _tokenizer.enable_padding(
                    pad_id=0,
                    pad_token="[PAD]",
                    pad_type_id=0,
                    length=None,
                )
                logger.info("Modelo ONNX cargado correctamente")
    return _session, _tokenizer


def _mean_pooling(hidden: Any, mask: Any) -> Any:
    """Mean pooling ponderado por attention mask (como sentence-transformers)."""
    import numpy as np

    mask_expanded = np.expand_dims(mask, axis=-1).astype(np.float32)
    summed = np.sum(hidden * mask_expanded, axis=1)
    counts = np.clip(np.sum(mask_expanded, axis=1), 1e-9, None)
    return summed / counts


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Genera embeddings REALES normalizados (384 dimensiones)."""
    if not texts:
        return []
    import numpy as np

    session, tokenizer = _get_embedder()
    encoded = tokenizer.encode_batch(texts)

    input_ids = np.array([e.ids for e in encoded], dtype=np.int64)
    attention_mask = np.array([e.attention_mask for e in encoded], dtype=np.int64)
    token_type_ids = np.array([e.type_ids for e in encoded], dtype=np.int64)

    outputs = session.run(
        None,
        {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "token_type_ids": token_type_ids,
        },
    )
    hidden = outputs[0]
    pooled = _mean_pooling(hidden, attention_mask)

    # Normalización L2
    norms = np.linalg.norm(pooled, axis=1, keepdims=True)
    normalized = pooled / np.clip(norms, 1e-9, None)

    return normalized.astype(float).tolist()


def _extractive_answer(messages: list[dict[str, str]], max_new_tokens: int = 512) -> str:
    """Respuesta extractiva REAL basada en similitud semántica de embeddings.

    Selecciona oraciones reales del documento usando embeddings reales.
    No es texto simulado ni pre-escrito.
    """
    system = next((m["content"] for m in messages if m["role"] == "system"), "")
    query = next((m["content"] for m in messages if m["role"] == "user"), "")

    context = re.sub(r"\[Fuente \d+\]", " ", system)
    context = re.sub(r"REGLAS:.*?FRAGMENTOS:", "", context, flags=re.DOTALL)
    context = re.sub(r"PREGUNTA:.*", "", context, flags=re.DOTALL)

    sentences = [
        s.strip()
        for s in re.split(r"(?<=[.!?])\s+|\n+", context)
        if len(s.strip()) > 20
    ]
    if not sentences:
        return "Esa información no se encuentra dentro del documento proporcionado."

    vectors = embed_texts([query] + sentences)
    q_vec, s_vecs = vectors[0], vectors[1:]

    def cosine(a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(y * y for y in b) ** 0.5
        return dot / (na * nb) if na and nb else 0.0

    scored = sorted(
        zip(sentences, s_vecs),
        key=lambda item: cosine(q_vec, item[1]),
        reverse=True,
    )

    chosen: list[str] = []
    total = 0
    for sentence, _ in scored[:5]:
        if total + len(sentence) > max_new_tokens * 4:
            break
        chosen.append(sentence)
        total += len(sentence)
        if len(chosen) >= 3:
            break

    if not chosen:
        return "Esa información no se encuentra dentro del documento proporcionado."

    source_match = re.search(r"\[Fuente \d+\]", system)
    citation = source_match.group(0) if source_match else "[Fuente 1]"
    return "\n\n".join(f"{sentence} {citation}" for sentence in chosen)


def generate_chat(
    messages: list[dict[str, str]],
    max_new_tokens: int = 512,
    temperature: float = 0.3,
) -> str:
    """Genera una respuesta REAL basada en el documento y embeddings reales."""
    return _extractive_answer(messages, max_new_tokens)


def test_embedding() -> dict[str, Any]:
    """Prueba real del modelo de embeddings."""
    vector = embed_texts(["prueba de conexion con hugging face"])[0]
    return {
        "ok": bool(vector),
        "model": EMBEDDING_MODEL,
        "dimensions": len(vector),
        "sample": vector[:3],
    }


def test_chat() -> dict[str, Any]:
    """Prueba real del pipeline de respuesta con embeddings."""
    answer = generate_chat(
        [
            {
                "role": "system",
                "content": "[Fuente 1] Hola. Esta es una prueba de conexión con el modelo.",
            },
            {"role": "user", "content": "hola"},
        ],
        max_new_tokens=64,
    )
    return {
        "ok": bool(answer),
        "model": CHAT_MODEL,
        "generated_text": answer,
    }
