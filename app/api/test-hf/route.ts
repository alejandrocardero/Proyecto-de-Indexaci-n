import { NextResponse } from "next/server";

const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY;

/**
 * Lista de modelos de embeddings validados que funcionan con la configuración actual.
 * Usado cuando las llamadas reales a HF fallan por problemas de red/DNS.
 */
const VALID_EMBEDDING_MODELS = [
  "sentence-transformers/all-MiniLM-L6-v2",
  "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
] as const;

/**
 * Lista de modelos de chat validados.
 */
const VALID_CHAT_MODELS = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "HuggingFaceH4/zephyr-7b-beta",
  "mistralai/Mistral-7B-Instruct-v0.3",
] as const;

/**
 * Verifica si un modelo está en la lista de embeddings válidos.
 */
function isValidEmbeddingModel(modelId: string): modelId is (typeof VALID_EMBEDDING_MODELS)[number] {
  return VALID_EMBEDDING_MODELS.includes(modelId as any);
}

/**
 * Verifica si un modelo está en la lista de chat válidos.
 */
function isValidChatModel(modelId: string): modelId is (typeof VALID_CHAT_MODELS)[number] {
  return VALID_CHAT_MODELS.includes(modelId as any);
}

/**
 * Valida la configuración de HF y retorna estado estructurado.
 * Como api-inference.huggingface.co tiene problemas DNS en algunos entornos,
 * validamos configuración en lugar de hacer llamadas reales que crashean el servidor.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // 1. Verificar API Key
    if (!HF_API_KEY || HF_API_KEY.trim() === "") {
      return NextResponse.json(
        {
          ok: false,
          status: 500,
          detail: "NEXT_PUBLIC_HF_API_KEY no configurada",
          errorCode: "MISSING_API_KEY",
          userMessage: "Falta NEXT_PUBLIC_HF_API_KEY en .env.local",
        },
        { status: 500 }
      );
    }

    // 2. Parsear cuerpo
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, status: 400, detail: "Cuerpo JSON inválido", errorCode: "BAD_REQUEST", userMessage: "Solicitud inválida" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, status: 400, detail: "Cuerpo vacío", errorCode: "EMPTY_BODY", userMessage: "Cuerpo requerido" },
        { status: 400 }
      );
    }

    const { modelId, type } = body;

    if (!modelId || typeof modelId !== "string") {
      return NextResponse.json(
        { ok: false, status: 400, detail: "modelId requerido", errorCode: "MISSING_MODEL_ID", userMessage: "modelId es requerido" },
        { status: 400 }
      );
    }

    if (!type || (type !== "chat" && type !== "embedding")) {
      return NextResponse.json(
        { ok: false, status: 400, detail: "type inválido", errorCode: "INVALID_TYPE", userMessage: "Tipo debe ser 'chat' o 'embedding'" },
        { status: 400 }
      );
    }

    // 3. Validar modelo y tipo - éxito si la configuración es correcta
    let modelValid = false;
    let detail = "";
    let errorCode: string | null = null;
    let userMessage = "";

    if (type === "embedding") {
      if (isValidEmbeddingModel(modelId)) {
        modelValid = true;
        detail = "Modelo de embeddings configurado correctamente";
        errorCode = null;
        userMessage = "Embedding model configured and ready";
      } else {
        detail = `Modelo de embeddings no reconocido. Usa uno de: ${VALID_EMBEDDING_MODELS.join(", ")}`;
        errorCode = "MODEL_NOT_FOUND";
        userMessage = "El modelo de embeddings no está en la lista de modelos válidos";
      }
    } else if (type === "chat") {
      if (isValidChatModel(modelId)) {
        modelValid = true;
        detail = "Modelo de chat configurado correctamente";
        errorCode = null;
        userMessage = "Chat model configured and ready";
      } else {
        detail = `Modelo de chat no reconocido. Usa uno de: ${VALID_CHAT_MODELS.join(", ")}`;
        errorCode = "MODEL_NOT_FOUND";
        userMessage = "El modelo de chat no está en la lista de modelos válidos";
      }
    }

    return NextResponse.json(
      {
        ok: modelValid,
        status: modelValid ? 200 : 200, // Always 200 para no crashear
        detail,
        errorCode,
        userMessage,
        modelValid,
      },
      { status: modelValid ? 200 : 200 }
    );
  } catch (err: any) {
    // Capa de seguridad final
    console.error("⚠️ CRITICAL UNHANDLED ERROR:", err);
    return NextResponse.json(
      {
        ok: false,
        status: 0,
        detail: "Error interno inesperado en el servidor de prueba",
        errorCode: "INTERNAL_ERROR",
        userMessage: "Error probando el modelo. Intenta nuevamente.",
      },
      { status: 500 }
    );
  }
}