"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import {
  Settings,
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldAlert,
  WifiOff,
  Clock,
  RefreshCw,
  Brain,
} from "lucide-react";

const DEFAULT_CHAT_MODELS = [
  { id: "meta-llama/Llama-3.1-8B-Instruct", name: "Llama 3.1 8B", provider: "Hugging Face", free: true },
  { id: "HuggingFaceH4/zephyr-7b-beta", name: "Zephyr 7B Beta", provider: "Hugging Face", free: true },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B v0.3", provider: "Hugging Face", free: true },
] as const;

const EMBEDDING_MODELS = [
  { id: "sentence-transformers/all-MiniLM-L6-v2", name: "all-MiniLM-L6-v2", provider: "sentence-transformers", free: true },
  { id: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", name: "paraphrase-multilingual-MiniLM-L12-v2", provider: "sentence-transformers", free: true },
] as const;

const LOCAL_STORAGE_KEY = "mipymes_ai_config";

interface AiConfig {
  chatModel: string;
  embeddingModel: string;
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

export default function ConfiguracionesPage() {
  const [config, setConfig] = useState<AiConfig>({
    chatModel: DEFAULT_CHAT_MODELS[0].id,
    embeddingModel: EMBEDDING_MODELS[0].id,
  });
  const [customModel, setCustomModel] = useState("");
  const [testing, setTesting] = useState<{ chat: boolean; embedding: boolean }>({
    chat: false,
    embedding: false,
  });
  const [testResult, setTestResult] = useState<{
    chat?: { ok: boolean; detail: string; userMessage?: string; errorCode?: string; statusCode?: number; icon?: React.ReactNode };
    embedding?: { ok: boolean; detail: string; userMessage?: string; errorCode?: string; statusCode?: number; icon?: React.ReactNode };
  }>({});

  // Cargar config guardada en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AiConfig;
        setConfig(parsed);
      }
    } catch {
      // ignorar
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  };

  const handleTest = async (type: "chat" | "embedding", modelId: string) => {
    setTesting((prev) => ({ ...prev, [type]: true }));
    setTestResult((prev) => ({ ...prev, [type]: undefined }));

    try {
      const res = await fetch("/api/test-hf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, type }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setTestResult((prev) => ({
          ...prev,
          [type]: {
            ok: false,
            detail: data.detail || "Error",
            userMessage: data.userMessage || "Error al probar el modelo",
            errorCode: data.errorCode || `HTTP_${res.status}`,
            statusCode: data.statusCode || res.status,
            icon: ERROR_ICONS[data.errorCode || "UNKNOWN_ERROR"],
          },
        }));
        return;
      }

      setTestResult((prev) => ({
        ...prev,
        [type]: {
          ok: true,
          detail: data.detail || "Conectado correctamente",
          icon: <CheckCircle2 className="w-4 h-4 text-success" />,
        },
      }));
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [type]: {
          ok: false,
          detail: err.message || "Error de red",
          userMessage: "No se pudo conectar con el servidor de prueba.",
          errorCode: "NETWORK_ERROR",
          statusCode: 0,
          icon: <WifiOff className="w-4 h-4 text-destructive" />,
        },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = () => {
    saveConfig();
  };

  const isCustomChat = !DEFAULT_CHAT_MODELS.some((m) => m.id === config.chatModel);
  const isCustomEmbedding = !EMBEDDING_MODELS.some((m) => m.id === config.embeddingModel);

  return (
    <main className="min-h-screen bg-background page-enter">
      <ScrollReveal variant="fade" once className="pt-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 inline-block">
                <Settings className="w-4 h-4" />
                Configuración de IA
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-2">
                Modelo de Inteligencia Artificial
              </h1>
              <p className="text-text-secondary">
                Elige el modelo de Hugging Face para indexación y chat. Los modelos marcados como
                <span className="text-success">Gratis</span> no tienen costo en la API de inferencia de HF.
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>

          {/* Chat model selector */}
          <Card variant="elevated" className="mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">Modelo de chat (responde preguntas)</h3>
                  <p className="text-text-muted text-sm">
                    Se usa para responder preguntas sobre tus documentos indexados.
                  </p>
                </div>
                <Badge variant={config.chatModel ? "secondary" : "primary"}>
                  {config.chatModel.split("/").pop() || config.chatModel}
                </Badge>
              </div>

              <div className="space-y-3">
                {DEFAULT_CHAT_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setConfig({ ...config, chatModel: m.id })}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                      config.chatModel === m.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface border-border hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-text-primary">{m.name}</div>
                        <div className="text-xs text-text-muted">{m.provider}</div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs">
                      Gratis
                    </Badge>
                  </button>
                ))}

                <div className="pt-4 border-t border-border">
                  <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                    Modelo personalizado
                  </label>
                  <Input
                    value={customModel}
                    onChange={(value) => setCustomModel(value)}
                    placeholder="meta-llama/Llama-3.1-8B-Instruct"
                    className="mb-2"
                  />
                  <Button
                    onClick={() => {
                      if (customModel.trim()) {
                        setConfig({ ...config, chatModel: customModel.trim() });
                        setCustomModel("");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    disabled={!customModel.trim()}
                  >
                    Usar modelo personalizado
                  </Button>
                  {isCustomChat && (
                    <p className="text-xs text-text-muted mt-1">
                      Modelo personalizado activo: {config.chatModel}
                    </p>
                  )}
                </div>
              </div>

              {testResult.chat && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    testResult.chat.ok ? "bg-success/10 border border-success/20" : "bg-destructive-light border border-destructive/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.chat.icon}
                    <div>
                      <div className={`text-sm font-medium ${
                        testResult.chat.ok ? "text-success" : "text-destructive"
                      }`}>
                        {testResult.chat.ok ? "✓ Conexión exitosa" : "✗ Error de conexión"}
                      </div>
                      <div className="text-xs text-text-muted">{testResult.chat.detail}</div>
                      {testResult.chat.userMessage && (
                        <div className="text-xs text-destructive/80 mt-1">
                          {testResult.chat.userMessage}
                        </div>
                      )}
                      {testResult.chat.errorCode && testResult.chat.statusCode && (
                        <div className="text-xs text-text-muted">
                          Código: {testResult.chat.errorCode} | HTTP {testResult.chat.statusCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <CardFooter>
              <Button
                onClick={() => handleTest("chat", config.chatModel)}
                disabled={testing.chat}
                variant="outline"
                size="sm"
              >
                {testing.chat ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Probar conexión
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
              >
                Guardar configuración
              </Button>
            </CardFooter>
          </Card>

          {/* Embedding model selector */}
          <Card variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">Modelo de embeddings (búsqueda semántica)</h3>
                  <p className="text-text-muted text-sm">
                    Convierte fragmentos de documento en vectores para búsqueda por similitud.
                  </p>
                </div>
                <Badge variant="secondary">
                  {config.embeddingModel.split("/").pop() || config.embeddingModel}
                </Badge>
              </div>

              <div className="space-y-3">
                {EMBEDDING_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setConfig({ ...config, embeddingModel: m.id })}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                      config.embeddingModel === m.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface border-border hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-text-primary">{m.name}</div>
                        <div className="text-xs text-text-muted">{m.provider}</div>
                      </div>
                    </div>
                    <Badge variant="success" className="text-xs">
                      Gratis
                    </Badge>
                  </button>
                ))}
              </div>

              {testResult.embedding && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    testResult.embedding.ok ? "bg-success/10 border border-success/20" : "bg-destructive-light border border-destructive/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.embedding.icon}
                    <div>
                      <div className={`text-sm font-medium ${
                        testResult.embedding.ok ? "text-success" : "text-destructive"
                      }`}>
                        {testResult.embedding.ok ? "✓ Conexión exitosa" : "✗ Error de conexión"}
                      </div>
                      <div className="text-xs text-text-muted">{testResult.embedding.detail}</div>
                      {testResult.embedding.userMessage && (
                        <div className="text-xs text-destructive/80 mt-1">
                          {testResult.embedding.userMessage}
                        </div>
                      )}
                      {testResult.embedding.errorCode && testResult.embedding.statusCode && (
                        <div className="text-xs text-text-muted">
                          Código: {testResult.embedding.errorCode} | HTTP {testResult.embedding.statusCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <CardFooter>
              <Button
                onClick={() => handleTest("embedding", config.embeddingModel)}
                disabled={testing.embedding}
                variant="outline"
                size="sm"
              >
                {testing.embedding ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Probar conexión
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
              >
                Guardar configuración
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-text-muted">
              La configuración se guarda localmente en tu navegador. Para que los modelos funcionen
              realmente, configura <code className="font-mono text-xs">NEXT_PUBLIC_HF_API_KEY</code> en tu
              <code className="font-mono text-xs">.env.local</code> y reinicia el servidor.
            </p>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
