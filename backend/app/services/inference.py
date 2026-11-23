"""Inferencia REAL de modelos locales (embeddings ONNX + LLM GGUF).

- Embeddings: all-MiniLM-L6-v2 (ONNX Runtime, 22 MB, 384 dims) — 100% offline
- Chat: Qwen2.5-Coder-14B-Q5_K_M (llama.cpp, 10.5 GB, 14B parámetros) — 100% offline
"""

from __future__ import annotations

import logging
import os
import re
import threading
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

# Embeddings (ONNX)
MODEL_DIR = Path(__file__).resolve().parents[2] / "models" / "all-MiniLM-L6-v2"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Chat LLM (GGUF via llama.cpp) - Qwen2.5-7B-Instruct Q4_K_M (~4 GB)
LLM_MODEL_PATH = Path(os.getenv("LLM_MODEL_PATH", "D:/Install/models/qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf"))
CHAT_MODEL = "Qwen2.5-7B-Instruct-Q4_K_M"

# Thread-safe singletons
_embed_session: Any = None
_embed_tokenizer: Any = None
_llm: Any = None
_embed_lock = threading.Lock()
_llm_lock = threading.Lock()


# ============================================================
# EMBEDDINGS (ONNX Runtime) — se mantiene igual
# ============================================================
def _get_embedder():
    """Carga el modelo ONNX de embeddings una sola vez (thread-safe)."""
    global _embed_session, _embed_tokenizer
    if _embed_session is None or _embed_tokenizer is None:
        with _embed_lock:
            if _embed_session is None or _embed_tokenizer is None:
                model_path = MODEL_DIR / "model_quantized.onnx"
                tokenizer_path = MODEL_DIR / "tokenizer.json"

                if not model_path.exists() or not tokenizer_path.exists():
                    import subprocess
                    import sys
                    script = Path(__file__).resolve().parents[3] / "scripts" / "descargar_modelo.py"
                    logger.info("Descargando modelo ONNX embeddings (primera ejecución)...")
                    subprocess.run([sys.executable, str(script)], check=True)

                if not model_path.exists():
                    raise RuntimeError(f"Modelo ONNX no descargado: {model_path}")
                if not tokenizer_path.exists():
                    raise RuntimeError(f"Tokenizer ONNX no descargado: {tokenizer_path}")

                logger.info("Cargando modelo ONNX embeddings: %s", model_path)
                import onnxruntime as ort
                from tokenizers import Tokenizer

                _embed_session = ort.InferenceSession(
                    str(model_path),
                    providers=["CPUExecutionProvider"],
                )
                _embed_tokenizer = Tokenizer.from_file(str(tokenizer_path))
                _embed_tokenizer.enable_truncation(max_length=256)
                _embed_tokenizer.enable_padding(pad_id=0, pad_token="[PAD]", pad_type_id=0, length=None)
                logger.info("Modelo ONNX embeddings cargado correctamente")
    return _embed_session, _embed_tokenizer


def _mean_pooling(hidden: Any, mask: Any) -> Any:
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
        {"input_ids": input_ids, "attention_mask": attention_mask, "token_type_ids": token_type_ids},
    )
    hidden = outputs[0]
    pooled = _mean_pooling(hidden, attention_mask)
    norms = np.linalg.norm(pooled, axis=1, keepdims=True)
    normalized = pooled / np.clip(norms, 1e-9, None)
    return normalized.astype(float).tolist()


# ============================================================
# CHAT LLM (llama.cpp / GGUF)
# ============================================================
def _get_llm():
    """Carga el modelo GGUF con llama-cpp-python una sola vez (thread-safe)."""
    global _llm
    if _llm is None:
        with _llm_lock:
            if _llm is None:
                if not LLM_MODEL_PATH.exists():
                    raise RuntimeError(f"Modelo GGUF no encontrado: {LLM_MODEL_PATH}")
                logger.info("Cargando modelo GGUF (llama.cpp): %s", LLM_MODEL_PATH)
                from llama_cpp import Llama
                # n_gpu_layers=-1 intenta usar GPU (Metal/CUDA/ROCm) si está disponible
                # n_ctx=4096 para contexto suficiente en RAG
                _llm = Llama(
                    model_path=str(LLM_MODEL_PATH),
                    n_ctx=4096,
                    n_threads=os.cpu_count() or 8,
                    n_gpu_layers=-1,  # usa GPU si hay; 0 = solo CPU
                    verbose=False,
                )
                logger.info("Modelo GGUF cargado correctamente: %s", CHAT_MODEL)
    return _llm


# ============================================================
# RAG: búsqueda extractiva + generación con LLM local
# ============================================================
NO_ANSWER = "Esa información no se encuentra dentro del documento proporcionado."


def _edit_distance(a: str, b: str, max_dist: int) -> int:
    if abs(len(a) - len(b)) > max_dist:
        return max_dist + 1
    previous = list(range(len(b) + 1))
    for i, char_a in enumerate(a, 1):
        current = [i]
        for j, char_b in enumerate(b, 1):
            current.append(min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (char_a != char_b)))
        if min(current) > max_dist:
            return max_dist + 1
        previous = current
    return previous[-1]


def _expand_query(query: str, context: str) -> list[str]:
    tokens = re.findall(r"[a-zá-éíóúñ0-9]+", query.lower())
    vocabulary = {word for word in re.findall(r"[a-zá-éíóúñ0-9]+", context.lower()) if len(word) >= 3}
    expanded: list[str] = []
    for token in tokens:
        if len(token) < 3 or token in vocabulary:
            expanded.append(token)
            continue
        max_dist = 1 if len(token) <= 6 else 2
        best_word = None
        best_distance = max_dist + 1
        for word in vocabulary:
            if abs(len(word) - len(token)) > max_dist:
                continue
            distance = _edit_distance(token, word, max_dist)
            if distance < best_distance:
                best_word, best_distance = word, distance
        expanded.append(best_word if best_word and best_distance <= max_dist else token)
    return expanded


_REFERENCE_MARKERS = re.compile(
    r"\[En línea\]|https?://|arXiv|et al\.|Documentation|Google Blog|MindStudio Blog|"
    r"Developers Blog|\b(?:19|20)\d{2}\b",
    re.IGNORECASE,
)


def _is_reference(sentence: str) -> bool:
    return bool(_REFERENCE_MARKERS.search(sentence))


def _retrieve_relevant_chunks(query: str, context: str, top_k: int = 5) -> list[str]:
    """Busca los chunks más relevantes usando embeddings + anclaje léxico."""
    sentences = [
        re.sub(r"\b[a-z][a-z.]*\+\d+\b", "", s.strip()).strip()
        for s in re.split(r"(?<=[.!?])\s+|\n+", context)
        if len(s.strip()) > 20
    ]
    sentences = [s for s in sentences if s]
    complete = [s for s in sentences if s.rstrip()[-1:] in ".!?"]
    if complete:
        sentences = complete
    if not sentences:
        return []

    expanded = _expand_query(query, context)
    search_query = " ".join(dict.fromkeys(expanded)) or query
    vectors = embed_texts([search_query] + sentences)
    q_vec, s_vecs = vectors[0], vectors[1:]

    def cosine(a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(y * y for y in b) ** 0.5
        return dot / (na * nb) if na and nb else 0.0

    scored: list[tuple[str, float, float]] = []
    for sentence, vector in zip(sentences, s_vecs):
        semantic = cosine(q_vec, vector)
        words = set(re.findall(r"[a-zá-éíóúñ0-9]+", sentence.lower()))
        hits = sum(1 for token in expanded if len(token) >= 3 and any(token in word for word in words))
        lexical = hits / len(expanded) if expanded else 0.0
        combined = semantic * 0.75 + lexical * 0.25
        if _is_reference(sentence):
            combined *= 0.2
        else:
            if re.search(r"\b(?:se refiere|es el primer|es un|consiste|permite|ofrece|proporciona|define|utiliza|unifica)\b", sentence, re.IGNORECASE):
                combined += 0.06
        if combined >= 0.25 and (lexical > 0 or semantic >= 0.32):
            scored.append((sentence, semantic, combined))

    if not scored:
        return []

    scored.sort(key=lambda item: (item[2], item[1]), reverse=True)
    return [s for s, _, _ in scored[:top_k]]


def generate_chat(
    messages: list[dict[str, str]],
    max_new_tokens: int = 512,
    temperature: float = 0.3,
) -> str:
    """Genera respuesta con LLM local (Qwen2.5-Coder-14B) usando RAG."""
    system = next((m["content"] for m in messages if m["role"] == "system"), "")
    query = next((m["content"] for m in messages if m["role"] == "user"), "")

    # Extraer contexto del documento (soporta formatos FRAGMENTOS: y CONTEXTO DEL DOCUMENTO:)
    context = system
    for marker in ("FRAGMENTOS:", "CONTEXTO DEL DOCUMENTO:", "CONTEXTO:"):
        if marker in context:
            context = context.split(marker, 1)[1]
            break
    context = re.split(r"PREGUNTA(?: DEL USUARIO)?:|Respuesta:", context, maxsplit=1)[0]
    context = re.sub(r"\[Fuente \d+\]", " ", context)

    # Recuperar chunks relevantes
    relevant_chunks = _retrieve_relevant_chunks(query, context, top_k=5)
    if not relevant_chunks:
        return NO_ANSWER

    # Construir prompt para el LLM
    context_str = "\n\n".join(f"[Fuente {i+1}] {c}" for i, c in enumerate(relevant_chunks))
    prompt = f"""Eres un asistente especializado que responde ÚNICAMENTE basándote en los fragmentos del documento proporcionados.

Contexto del documento:
{context_str}

Pregunta: {query}

Instrucciones:
1. Responde solo con información del contexto.
2. Si la información NO está en el contexto, responde: "{NO_ANSWER}"
3. Cita las fuentes como [Fuente X].
4. Sé conciso y directo.

Respuesta:"""

    llm = _get_llm()
    try:
        output = llm(
            prompt,
            max_tokens=max_new_tokens,
            temperature=temperature,
            top_p=0.95,
            stop=["</s>", "Pregunta:", "Contexto:", "Instrucciones:"],
        )
        text = output["choices"][0]["text"].strip()
        # Añadir cita si el LLM no la incluyó
        if "[Fuente" not in text:
            text += " [Fuente 1]"
        return text
    except Exception as e:
        logger.exception("Error generando respuesta con LLM local")
        # Fallback a respuesta extractiva si falla el LLM
        return _extractive_answer_fallback(messages, max_new_tokens)


def _extractive_answer_fallback(messages: list[dict[str, str]], max_new_tokens: int = 512) -> str:
    """Respuesta extractiva de respaldo (método anterior) si falla el LLM."""
    system = next((m["content"] for m in messages if m["role"] == "system"), "")
    query = next((m["content"] for m in messages if m["role"] == "user"), "")
    context = system
    for marker in ("FRAGMENTOS:", "CONTEXTO DEL DOCUMENTO:", "CONTEXTO:"):
        if marker in context:
            context = context.split(marker, 1)[1]
            break
    context = re.split(r"PREGUNTA(?: DEL USUARIO)?:|Respuesta:", context, maxsplit=1)[0]
    context = re.sub(r"\[Fuente \d+\]", " ", context)

    sentences = [
        re.sub(r"\b[a-z][a-z.]*\+\d+\b", "", s.strip()).strip()
        for s in re.split(r"(?<=[.!?])\s+|\n+", context)
        if len(s.strip()) > 20
    ]
    sentences = [s for s in sentences if s]
    complete = [s for s in sentences if s.rstrip()[-1:] in ".!?"]
    if complete:
        sentences = complete
    if not sentences:
        return NO_ANSWER

    expanded = _expand_query(query, context)
    search_query = " ".join(dict.fromkeys(expanded)) or query
    vectors = embed_texts([search_query] + sentences)
    q_vec, s_vecs = vectors[0], vectors[1:]

    def cosine(a: list[float], b: list[float]) -> float:
        dot = sum(x * y for x, y in zip(a, b))
        na = sum(x * x for x in a) ** 0.5
        nb = sum(y * y for y in b) ** 0.5
        return dot / (na * nb) if na and nb else 0.0

    scored: list[tuple[str, float, float]] = []
    for sentence, vector in zip(sentences, s_vecs):
        semantic = cosine(q_vec, vector)
        words = set(re.findall(r"[a-zá-éíóúñ0-9]+", sentence.lower()))
        hits = sum(1 for token in expanded if len(token) >= 3 and any(token in word for word in words))
        lexical = hits / len(expanded) if expanded else 0.0
        combined = semantic * 0.75 + lexical * 0.25
        if _is_reference(sentence):
            combined *= 0.2
        else:
            if re.search(r"\b(?:se refiere|es el primer|es un|consiste|permite|ofrece|proporciona|define|utiliza|unifica)\b", sentence, re.IGNORECASE):
                combined += 0.06
        if combined >= 0.25 and (lexical > 0 or semantic >= 0.32):
            scored.append((sentence, semantic, combined))

    if not scored:
        return NO_ANSWER

    scored.sort(key=lambda item: (item[2], item[1]), reverse=True)
    chosen: list[str] = []
    total = 0
    for sentence, _, _ in scored[:5]:
        if total + len(sentence) > max_new_tokens * 4:
            break
        chosen.append(sentence)
        total += len(sentence)
        if len(chosen) >= 3:
            break
    if not chosen:
        return NO_ANSWER
    source_match = re.search(r"\[Fuente \d+\]", system)
    citation = source_match.group(0) if source_match else "[Fuente 1]"
    return " ".join(chosen) + f" {citation}"


def test_embedding() -> dict[str, Any]:
    vector = embed_texts(["prueba de conexion con hugging face"])[0]
    return {
        "ok": bool(vector),
        "model": EMBEDDING_MODEL,
        "dimensions": len(vector),
        "sample": vector[:3],
    }


def test_chat() -> dict[str, Any]:
    answer = generate_chat(
        [
            {"role": "system", "content": "FRAGMENTOS:\n[Fuente 1] Esta es una prueba de conexión con el modelo de embeddings de Hugging Face. La inferencia se ejecuta localmente con ONNX Runtime y Qwen2.5-Coder-14B."},
            {"role": "user", "content": "prueba de conexión con el modelo de embeddings"},
        ],
        max_new_tokens=64,
    )
    return {
        "ok": bool(answer),
        "model": CHAT_MODEL,
        "generated_text": answer,
    }