"use client";

const HF_API_KEY = process.env.NEXT_PUBLIC_HF_API_KEY;
const BASE = "https://api-inference.huggingface.co/models";

if (!HF_API_KEY) {
  console.warn("NEXT_PUBLIC_HF_API_KEY no configurada en .env.local");
}

async function hfRequest<T>(model: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HF API error ${res.status}: ${text}`);
  }

  return res.json();
}

export interface HFMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const hfClient = {
  async embedding(model: string, text: string): Promise<number[]> {
    const data: number[][] = await hfRequest(model, { inputs: text });
    return Array.isArray(data) && data.length > 0 ? data[0] : [];
  },

  async chat(model: string, messages: HFMessage[]) {
    const prompt = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n") + "\nassistant:";

    return hfRequest(model, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.3,
        top_p: 0.9,
        return_full_text: false,
      },
    });
  },
};
