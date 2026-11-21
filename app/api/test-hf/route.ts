import { NextResponse } from "next/server";

const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY;
const BASE = "https://api-inference.huggingface.co/models";

type TestResult = {
  ok: boolean;
  status: number;
  detail: string;
  errorCode?: string;
  userMessage?: string;
  modelValid?: boolean;
};

// Interfaz para errores de fetch
interface FetchErrorInfo {
  name: string;
  message: string;
  statusCode?: number;
}

/**
 * Robusto: valida entrada, hace fetch con timeout y captura errores específicos.
 * Nunca deja que una excepción escape y derribe el servidor.
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

    // 3. Hacer fetch con timeout, capturando absolutamente todos los errores
    let res: Response | null = null;
    let fetchErr: Error | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const fetchOpts: RequestInit = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      };

      if (type === "embedding") {
        fetchOpts.body = JSON.stringify({ inputs: "test" });
      } else {
        fetchOpts.body = JSON.stringify({ inputs: "hola" });
      }

      res = await fetch(`${BASE}/${encodeURIComponent(modelId)}`, fetchOpts);
      clearTimeout(timeoutId);
    } catch (err: any) {
      fetchErr = err;
      // Logueamos en la consola del servidor para depurar
      console.error("❌ fetch error caught:", err.name, err.message);
    }

    // 4. Si fetch falló, retornar error estructurado (NUNCA crash)
    if (fetchErr !== null && res === null) {
      const info = fetchErr as FetchErrorInfo;
      let detail = "Error en fetch a Hugging Face";
      let errorCode = "NETWORK_ERROR";

      if (info.name === "AbortError") {
        detail = "Tiempo de espera agotado (15 segundos)";
        errorCode = "TIMEOUT";
      } else {
        detail = info.message || "Error desconocido en la petición";
      }

      return NextResponse.json(
        {
          ok: false,
          status: info.statusCode || 0,
          detail,
          errorCode,
          userMessage: "No se pudo conectar con Hugging Face",
        },
        { status: 503 }
      );
    }

    // 5. Si completó el fetch, leer la respuesta de HF
    // (res ya no es null aquí gracias al chequeo anterior)
    const status = res?.status ?? 0;
    const statusText = res?.statusText ?? "";

    // Siempre retornar JSON estructurado - el OK depende del status de HF
    return NextResponse.json(
      {
        ok: res?.ok ?? false,
        status: status,
        detail: `Hugging Face ${status} ${statusText.substring(0, 40)}`,
        errorCode: res?.ok ? null : `HTTP_${status}`,
        userMessage: res?.ok
          ? "Conexión exitosa con Hugging Face"
          : `Hugging Face respondió con error ${status}`,
        modelValid: res?.ok ?? false,
      },
      { status: status }
    );
  } catch (err: any) {
    // Último recurso: seguridad absoluta
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