"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CircleCheck, CircleAlert, Loader2, Terminal, ShieldAlert, WifiOff, Clock } from "lucide-react";

const TEST_MODELS = [
  { id: "meta-llama/Llama-3.1-8B-Instruct", name: "Llama 3.1 8B", type: "chat", free: true },
  { id: "HuggingFaceH4/zephyr-7b-beta", name: "Zephyr 7B Beta", type: "chat", free: true },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B v0.3", type: "chat", free: true },
  { id: "sentence-transformers/all-MiniLM-L6-v2", name: "all-MiniLM-L6-v2", type: "embedding", free: true },
] as const;

interface TestResult {
  modelId: string;
  status: "pending" | "ok" | "error";
  detail: string;
  userMessage?: string;
  errorCode?: string;
  statusCode?: number;
  latencyMs?: number;
  icon?: React.ReactNode;
}

const ERROR_ICONS: Record<string, React.ReactNode> = {
  AUTH_FAILED: <ShieldAlert className="w-4 h-4 text-destructive" />,
  MODEL_NOT_FOUND: <CircleAlert className="w-4 h-4 text-destructive" />,
  RATE_LIMIT: <Clock className="w-4 h-4 text-warning" />,
  MODEL_LOADING: <Clock className="w-4 h-4 text-warning" />,
  SERVER_ERROR: <CircleAlert className="w-4 h-4 text-destructive" />,
  TIMEOUT: <Clock className="w-4 h-4 text-destructive" />,
  NETWORK_ERROR: <WifiOff className="w-4 h-4 text-destructive" />,
  MISSING_API_KEY: <ShieldAlert className="w-4 h-4 text-destructive" />,
  UNKNOWN_ERROR: <CircleAlert className="w-4 h-4 text-destructive" />,
};

export default function TestModelsPage() {
  const [results, setResults] = useState<TestResult[]>(
    TEST_MODELS.map((m) => ({ modelId: m.id, status: "pending", detail: "" }))
  );
  const [testing, setTesting] = useState(false);

  const testModel = async (modelId: string, type: "chat" | "embedding") => {
    setResults((prev) =>
      prev.map((r) => (r.modelId === modelId ? { ...r, status: "pending", detail: "Probando…" } : r))
    );

    const start = Date.now();
    try {
      const res = await fetch(`/api/test-hf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, type }),
      });

      const latency = Date.now() - start;
      const data = (await res.json()) as any;

      if (!res.ok || !data.ok) {
        setResults((prev) =>
          prev.map((r) =>
            r.modelId === modelId
              ? {
                  ...r,
                  status: "error",
                  detail: data.detail || "Error",
                  userMessage: data.userMessage || "Error al probar el modelo",
                  errorCode: data.errorCode || `HTTP_${res.status}`,
                  statusCode: data.statusCode || res.status,
                  latencyMs: latency,
                  icon: ERROR_ICONS[data.errorCode || "UNKNOWN_ERROR"],
                }
              : r)
          );
        return;
      }

      setResults((prev) =>
        prev.map((r) =>
          r.modelId === modelId
            ? {
                ...r,
                status: "ok",
                detail: data.detail || "Conectado correctamente",
                latencyMs: latency,
                icon: <CircleCheck className="w-4 h-4 text-success" />,
              }
            : r)
        );
    } catch (err: any) {
      setResults((prev) =>
        prev.map((r) =>
          r.modelId === modelId
            ? {
                ...r,
                status: "error",
                detail: err.message || "Error de red",
                userMessage: "No se pudo conectar con el servidor de prueba. Verifica tu conexión.",
                errorCode: "NETWORK_ERROR",
                statusCode: 0,
                latencyMs: Date.now() - start,
                icon: <WifiOff className="w-4 h-4 text-destructive" />,
              }
            : r)
        );
    }
  };

  const runAll = async () => {
    setTesting(true);
    for (const m of TEST_MODELS) {
      await testModel(m.id, m.type);
    }
    setTesting(false);
  };

  const okCount = results.filter((r) => r.status === "ok").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <main className="min-h-screen bg-background page-enter">
      <ScrollReveal variant="fade" once className="pt-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary">
              Probador de modelos Hugging Face
            </h1>
          </div>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Verifica qué modelos gratuitos de Hugging Face responden con tu
            API key antes de usarlos en la app.
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm">
            <span className={`flex items-center gap-1 ${okCount > 0 ? "text-success" : "text-text-muted"}`}>
              <CircleCheck className="w-3 h-3" /> {okCount} funcionando
            </span>
            <span className={`flex items-center gap-1 ${errorCount > 0 ? "text-destructive" : "text-text-muted"}`}>
              <CircleAlert className="w-3 h-3" /> {errorCount} con error
            </span>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal variant="slide-up" once className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-text-primary">Modelos disponibles</h2>
            <Button
              onClick={runAll}
              disabled={testing}
              variant="outline"
              size="sm"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Probar todos
            </Button>
          </div>
          <div className="space-y-3">
            {TEST_MODELS.map((m) => {
              const r = results.find((x) => x.modelId === m.id);
              return (
                <Card key={m.id} variant="bordered" className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{m.name}</span>
                        <Badge variant={m.free ? "success" : "secondary"}>Gratis</Badge>
                        <Badge variant="secondary">{m.type}</Badge>
                      </div>
                      <div className="text-xs text-text-muted">{m.id}</div>
                    </div>
                    {r?.icon && <span>{r.icon}</span>}
                  </div>

                  {r?.status === "ok" && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium mb-3">
                      <CircleCheck className="w-3 h-3" /> OK {r.latencyMs ? `(${r.latencyMs}ms)` : ""}
                    </div>
                  )}

                  {r?.status === "error" && (
                    <div className="bg-destructive-light border border-destructive/20 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 shrink-0">{r.icon}</div>
                        <div>
                          <div className="text-sm font-medium text-destructive">{r.userMessage || r.detail}</div>
                          <div className="text-xs text-destructive/70 mt-1">
                            Código: {r.errorCode} | HTTP {r.statusCode}
                          </div>
                          {r.detail && r.detail !== r.userMessage && (
                            <div className="text-xs text-destructive/60 mt-1">{r.detail}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {r?.status === "pending" && !testing && (
                    <div className="flex items-center gap-1 text-text-muted text-sm mt-3">
                      <span className="animate-pulse">●</span> Pendiente
                    </div>
                  )}

                  <CardFooter>
                    <Button
                      onClick={() => testModel(m.id, m.type)}
                      disabled={testing || r?.status === "ok"}
                      size="sm"
                      variant="outline"
                    >
                      {r?.status === "error" ? "Reintentar" : "Probar"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal variant="fade" once>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="font-semibold text-text-primary mb-2">Instrucciones</h3>
            <ol className="text-left text-text-secondary text-sm max-w-xl mx-auto space-y-2 list-disc pl-5">
              <li>
                Asegúrate de tener{" "}
                <code className="font-mono text-xs">NEXT_PUBLIC_HF_API_KEY</code> en tu{" "}
                <code className="font-mono text-xs">.env.local</code>
              </li>
              <li>
                Rota tu clave si la compartiste públicamente:{" "}
                <a
                  href="https://huggingface.co/settings/tokens"
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  huggingface.co/settings/tokens
                </a>
              </li>
              <li>
                Solo usa modelos que muestren <span className="text-green-600">OK</span> en el probador
              </li>
              <li>
                Errores comunes:{" "}
                <ul className="list-disc pl-4 mt-1 text-xs text-text-muted">
                  <li><strong>401/403:</strong> Clave inválida o sin permisos</li>
                  <li><strong>404:</strong> Modelo no existe en HF</li>
                  <li><strong>429:</strong> Límite de peticiones excedido</li>
                  <li><strong>503:</strong> Modelo cargándose, reintenta</li>
                  <li><strong>Sin internet:</strong> Error de red</li>
                </ul>
              </li>
            </ol>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
