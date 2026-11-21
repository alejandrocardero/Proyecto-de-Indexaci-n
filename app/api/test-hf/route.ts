import { NextResponse } from "next/server";

const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY;
const BASE = "https://api-inference.huggingface.co/models";

type TestResult = {
  ok: boolean;
  status: number;
  detail: string;
  modelValid?: boolean;
  errorCode?: string;
  userMessage?: string;
};

function classifyError(status: number, bodyText: string): { errorCode: string; userMessage: string } {
  switch (status) {
    case 401:
    case 403:
      return {
        errorCode: "AUTH_FAILED",
        userMessage: "Clave de API de Hugging Face inválida o sin permisos. Verifica tu NEXT_PUBLIC_HF_API_KEY.",
      };
    case 404:
      return {
        errorCode: "MODEL_NOT_FOUND",
        userMessage: "El modelo no existe o no está disponible en Hugging Face Inference API.",
      };
    case 429:
      return {
        errorCode: "RATE_LIMIT",
        userMessage: "Límite de peticiones excedido. Espera unos minutos e intenta de nuevo.",
      };
    case 503:
      return {
        errorCode: "MODEL_LOADING",
        userMessage: "El modelo está cargando en Hugging Face. Intenta de nuevo en unos segundos.",
      };
    case 500:
      return {
        errorCode: "SERVER_ERROR",
        userMessage: "Error interno de Hugging Face. Intenta más tarde.",
      };
    default:
      return {
        errorCode: `HTTP_${status}`,
        userMessage: `Error ${status} de Hugging Face: ${bodyText || "sin detalle"}`,
      };
  }
}

export async function POST(req: Request) {
  if (!HF_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        status: 500,
        detail: "NEXT_PUBLIC_HF_API_KEY no configurada en el servidor",
        errorCode: "MISSING_API_KEY",
        userMessage: "Falta configurar NEXT_PUBLIC_HF_API_KEY en .env.local",
      },
      { status: 500 }
    );
  }

  let body: { modelId: string; type: "chat" | "embedding" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, status: 400, detail: "Cuerpo inválido", errorCode: "BAD_REQUEST", userMessage: "Solicitud inválida" },
      { status: 400 }
    );
  }

  const { modelId, type } = body;

  // Validar que modelId no esté vacío
  if (!modelId || typeof modelId !== "string") {
    return NextResponse.json(
      { ok: false, status: 400, detail: "modelId requerido", errorCode: "MISSING_MODEL_ID", userMessage: "modelId es requerido" },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    let res: Response;
    try {
      if (type === "embedding") {
        res = await fetch(`${BASE}/${modelId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: "prueba de conexión" }),
          signal: controller.signal,
        });
      } else {
        res = await fetch(`${BASE}/${modelId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: "Hola, ¿funcionas?",
            parameters: {
              max_new_tokens: 20,
              temperature: 0.3,
              return_full_text: false,
            },
          }),
          signal: controller.signal,
        });
      }
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json(
          {
            ok: false,
            status: 0,
            detail: "Tiempo de espera agotado",
            errorCode: "TIMEOUT",
            userMessage: "La petición a Hugging Face tardó demasiado (timeout). Verifica tu conexión a internet.",
          },
          { status: 504 }
        );
      }
      // Error de red (DNS, sin internet, etc.)
      return NextResponse.json(
        {
          ok: false,
          status: 0,
          detail: fetchErr.message || "Error de red",
          errorCode: "NETWORK_ERROR",
          userMessage: "No se pudo conectar con Hugging Face. Verifica tu conexión a internet.",
        },
        { status: 503 }
      );
    }

    clearTimeout(timeoutId);
    const bodyText = await res.text().catch(() => "");

    if (!res.ok) {
      const { errorCode, userMessage } = classifyError(res.status, bodyText);
      return NextResponse.json(
        {
          ok: false,
          status: res.status,
          detail: bodyText || `HTTP ${res.status}`,
          errorCode,
          userMessage,
          modelValid: false,
        },
        { status: res.status }
      );
    }

    let data: any;
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = { raw: bodyText };
    }

    let modelValid = false;
    let detail = "Respuesta recibida";

    if (type === "embedding") {
      modelValid = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
      detail = modelValid ? "Embeddings generados correctamente" : "Respuesta inesperada para embeddings";
    } else {
      modelValid =
        typeof data === "string" ||
        (Array.isArray(data) && data[0]?.generated_text) ||
        (data?.generated_text);
      detail = modelValid ? "Modelo de chat responde correctamente" : "Respuesta inesperada del modelo de chat";
    }

    return NextResponse.json({
      ok: true,
      status: res.status,
      detail,
      errorCode: null,
      userMessage: null,
      modelValid,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        status: 0,
        detail: err.message || "Error inesperado",
        errorCode: "UNKNOWN_ERROR",
        userMessage: "Error inesperado al probar el modelo: " + (err.message || "desconocido"),
      },
      { status: 500 }
    );
  }
}
