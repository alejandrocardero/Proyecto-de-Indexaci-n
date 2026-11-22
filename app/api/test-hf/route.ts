import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy de la prueba de conexión al backend Python, que ejecuta inferencia
 * REAL de Hugging Face (embeddings y chat) con modelos descargados desde
 * huggingface.co. No hay respuestas simuladas.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));

    const res = await fetch(`${API_URL}/api/v1/inference/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: body?.type ?? "embedding" }),
      signal: AbortSignal.timeout(300000),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (err: any) {
    console.error("[api/test-hf] error:", err);
    return NextResponse.json(
      {
        ok: false,
        status: 503,
        detail: err?.message || "No se pudo conectar con el backend de inferencia",
        errorCode: "BACKEND_UNAVAILABLE",
        userMessage: `No se pudo ejecutar el modelo: ${err?.message || "error desconocido"}`,
      },
      { status: 503 }
    );
  }
}
