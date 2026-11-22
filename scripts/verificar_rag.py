"""Verificación end-to-end del flujo RAG con inferencia real."""

import httpx
import numpy as np

BASE = "http://localhost:8000/api/v1/inference"

chunks = [
    "Las SLM (Small Language Models) on device permiten ejecutar modelos de lenguaje directamente en el dispositivo sin conexion a internet.",
    "Esto mejora la privacidad y reduce la latencia en el procesamiento de documentos.",
]

r = httpx.post(BASE + "/embedding", json={"inputs": chunks}, timeout=120)
vecs = r.json()["data"]
print("EMBEDDINGS GENERADOS:", len(vecs), "x", len(vecs[0]))

query = "slm"
qr = httpx.post(BASE + "/embedding", json={"inputs": query}, timeout=120).json()["data"][0]


def cos(a, b):
    a, b = np.array(a), np.array(b)
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))


scores = [cos(qr, v) for v in vecs]
print("SCORES BUSQUEDA 'slm':", [round(s, 3) for s in scores])

best = chunks[int(np.argmax(scores))]
print("CHUNK RELEVANTE:", best[:100])

# System prompt EXACTO del formato de rag.ts
context = "\n\n".join(f"[Fuente {i + 1}] {c}" for i, c in enumerate(chunks))
system = f"""Eres un asistente especializado. Responde ÚNICAMENTE basándote en los fragmentos del documento proporcionados.

REGLAS:
1. Si la información NO está en los fragmentos, responde: "Esa información no se encuentra dentro del documento proporcionado."
2. No inventes ni uses conocimiento externo.
3. Responde en español.

FRAGMENTOS:
{context}

PREGUNTA:
{query}"""

cr = httpx.post(
    BASE + "/chat",
    json={
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": query},
        ]
    },
    timeout=120,
)
print("CHAT STATUS", cr.status_code)
answer = cr.json().get("generated_text", "")
print("RESPUESTA REAL:")
print(answer)
