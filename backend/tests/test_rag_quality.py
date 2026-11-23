"""Pruebas de calidad de la respuesta RAG (sin texto simulado)."""

from app.services.inference import NO_ANSWER, _expand_query, _extractive_answer

CONTEXT = """FRAGMENTOS:
[Fuente 1] Los embeddings de Google permiten representar texto en vectores para búsqueda semántica.
Google ofrece embeddings a través de la API de Gemini y de Vertex AI con modelos textuales y multimodales.
Gemini Embedding 2 es el primer modelo multimodal de Google y unifica texto, imágenes y audio.
Los embeddings se utilizan en RAG, clasificación de texto y detección de duplicados.
La receta de pastel de chocolate requiere harina, cacao y azúcar.

PREGUNTA:
{question}"""


def _messages(question: str):
    return [
        {"role": "system", "content": CONTEXT.format(question=question)},
        {"role": "user", "content": question},
    ]


def test_expansion_de_typos():
    expanded = _expand_query("embending", "los embeddings de google permiten busquedas semanticas")
    assert any(word.startswith("embed") for word in expanded)


def test_respuesta_a_pregunta_con_typo_usa_el_documento():
    answer = _extractive_answer(_messages("embending"))
    assert answer != NO_ANSWER
    assert "embedding" in answer.lower()
    assert "[Fuente 1]" in answer


def test_pregunta_sin_relacion_no_inventa_respuesta():
    answer = _extractive_answer(_messages("como instalar nodejs en windows"))
    assert answer == NO_ANSWER


def test_pregunta_exacta_devuelve_fragmento_real():
    answer = _extractive_answer(_messages(" embeddings "))
    assert answer != NO_ANSWER
    assert "embedding" in answer.lower()


def test_las_referencias_bibliograficas_no_suplantan_la_respuesta():
    """Las citas mencionan el término pero no deben elegirse como respuesta."""
    context = """FRAGMENTOS:
[Fuente 1] El nuevo embedding de Google se refiere a Gemini Embedding 2, un modelo multimodal.
Gemini Embedding 2 unifica texto, imágenes y audio en un espacio vectorial.
S. Arora et al., "Gecko: Versatile Text Embeddings", arXiv preprint arXiv:2403.20327, 28-Mar-2024. [En línea]. Disponible en: https://arxiv.org/html/2403.20327v1

PREGUNTA:
embending"""
    messages = [
        {"role": "system", "content": context},
        {"role": "user", "content": "embending"},
    ]
    answer = _extractive_answer(messages)
    assert answer != NO_ANSWER
    assert "Arora" not in answer
    assert "arXiv" not in answer
    assert "nuevo embedding de Google" in answer
