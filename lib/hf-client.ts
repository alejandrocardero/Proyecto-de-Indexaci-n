"use client";

/**
 * Cliente de inferencia REAL de Hugging Face.
 *
 * Las llamadas se hacen al backend Python (/api/v1/inference), que ejecuta
 * los modelos descargados desde huggingface.co con ONNX Runtime / PyTorch.
 * No hay responses simuladas ni hashes: los vectores y el texto provienen de
 * modelos reales.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const INFERENCE_URL = `${API_URL}/api/v1/inference`;

export interface HFMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const hfClient = {
  /** Genera un embedding REAL usando sentence-transformers. */
  async embedding(model: string, text: string): Promise<number[]> {
    const res = await fetch(`${INFERENCE_URL}/embedding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: text, model }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HF embedding error ${res.status}: ${text}`);
    }

    const data = await res.json();
    if (Array.isArray(data?.data?.[0])) return data.data[0];
    throw new Error("Respuesta de embedding inválida");
  },

  /** Genera una respuesta REAL con el modelo de lenguaje local. */
  async chat(model: string, messages: HFMessage[]) {
    const res = await fetch(`${INFERENCE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HF chat error ${res.status}: ${text}`);
    }

    return res.json();
  },
};
