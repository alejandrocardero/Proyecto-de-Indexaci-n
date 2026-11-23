"use client";

export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useRef, useCallback, useEffect } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { rag } from "@/lib/rag";
import { RAG_SYSTEM_PROMPT } from "@/lib/prompts";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  status: "indexing" | "indexed" | "error";
  progress: number;
  review_status: "pending" | "approved" | "rejected";
  aiModel: string;
  country?: string;
  docType?: string;
  reference?: string;
  folio?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const AI_MODELS = [
  { id: "extractivo-real-con-embeddings", name: "Extractivo real (ONNX)", provider: "Local · embeddings reales", free: true },
  { id: "meta-llama/Llama-3.1-8B-Instruct", name: "Llama 3.1 8B (HF)", provider: "Hugging Face", free: true },
  { id: "HuggingFaceH4/zephyr-7b-beta", name: "Zephyr 7B Beta (HF)", provider: "Hugging Face", free: true },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B v0.3 (HF)", provider: "Hugging Face", free: true },
] as const;

export default function UploadPage() {
  const savedConfig = typeof window !== "undefined"
    ? (() => {
        try {
          return JSON.parse(localStorage.getItem("mipymes_ai_config") || "{}");
        } catch {
          return {};
        }
      })()
    : {};
  const [selectedAiModel, setSelectedAiModel] = useState<string>(
    savedConfig.chatModel || AI_MODELS[0].id
  );
  const [embeddingModel, setEmbeddingModel] = useState<string>(
    savedConfig.embeddingModel || "sentence-transformers/all-MiniLM-L6-v2"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileCountry, setFileCountry] = useState<string>("CO");
  const [fileDocType, setFileDocType] = useState<string>("legal");
  const [fileReference, setFileReference] = useState<string>("");
  const [fileFolio, setFileFolio] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [extractionInfo, setExtractionInfo] = useState<string | null>(null);

  // Si llegamos con ?pick=1 (botón "Subir primer documento" del home),
  // abrimos directamente el selector de archivos del sistema.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("pick") !== "1") return;

    const timer = window.setTimeout(() => {
      fileInputRef.current?.click();
    }, 400);

    // Limpia el parámetro para que un refresh no reabra el diálogo
    window.history.replaceState({}, "", window.location.pathname);
    return () => window.clearTimeout(timer);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Restaurar documentos ya indexados desde IndexedDB al recargar/cambiar de
  // pestaña. El documento nunca se pierde; antes la UI no lo volvía a cargar.
  useEffect(() => {
    let cancelled = false;
    rag.getAllDocuments()
      .then((docs) => {
        if (cancelled) return;
        const restored: UploadedFile[] = docs.map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: formatFileSize(doc.size),
          sizeBytes: doc.size,
          uploadedAt: new Date(doc.uploadedAt).toLocaleDateString("es-ES", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
          }),
          status: doc.status === "indexed" ? "indexed" : doc.status === "error" ? "error" : "indexing",
          progress: doc.status === "indexed" ? 100 : 0,
          review_status: "approved",
          aiModel: doc.aiModel,
          country: doc.metadata?.country,
          docType: doc.metadata?.docType,
          reference: doc.metadata?.reference,
          folio: doc.metadata?.folio,
        }));
        setUploadedFiles(restored);
        const firstIndexed = restored.find((f) => f.status === "indexed");
        if (firstIndexed) setActiveFileId(firstIndexed.id);
      })
      .catch((err) => console.error("[upload] no se pudieron restaurar documentos:", err));
    return () => { cancelled = true; };
  }, []);

  const statusBadge = (status: string) => {
    switch (status) {
      case "indexing": return "primary";
      case "indexed": return "success";
      case "error": return "destructive";
      default: return "secondary";
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "indexing": return "Indexando…";
      case "indexed": return "Indexado";
      case "error": return "Error";
      default: return "Desconocido";
    }
  };

  /* --------------------------------------------------------------- */
  /*  Validaciones de campos de texto                                */
  /* --------------------------------------------------------------- */

  /** Solo letras (incluye tildes, ñ, espacios y guiones) */
  const validarSoloLetras = (valor: string): boolean => {
    if (!valor.trim()) return true; // campo opcional vacío es válido
    return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s\-]+$/.test(valor);
  };

  /** Solo números (permite espacios y guiones entre dígitos) */
  const validarSoloNumeros = (valor: string): boolean => {
    if (!valor.trim()) return true; // campo opcional vacío es válido
    return /^[\d\s\-]+$/.test(valor);
  };

  /** Validar que el archivo NO sea una imagen */
  const esArchivoImagen = (file: File): boolean => {
    return file.type.startsWith("image/");
  };

  const limpiarErroresValidacion = () => {
    setValidationErrors({});
  };

  const validarCamposMetadatos = (): boolean => {
    const errores: Record<string, string> = {};

    if (!validarSoloLetras(fileReference)) {
      errores.reference = "La referencia solo puede contener letras (sin números).";
    }

    if (!validarSoloNumeros(fileFolio)) {
      errores.folio = "El número de folio/expediente solo puede contener dígitos (sin letras).";
    }

    setValidationErrors(errores);
    return Object.keys(errores).length === 0;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // 1. Intentar extracción vía backend FastAPI (PDF real, DOCX, XLSX)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiUrl}/api/v1/documents/extract-text`, {
        method: "POST",
        body: formData,
        // Sin headers Authorization: el backend devuelve 401 si no hay sesión;
        // el fallback a cliente cubre ese caso.
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text && data.text.trim().length > 0) {
          return data.text;
        }
      }
    } catch {
      // Backend no disponible o sin auth: continuar con extracción en cliente
    }

    // 2. Fallback: extracción en el navegador (solo .txt legible, PDF básico)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
      if (file.type.startsWith("text/") || file.type.includes("json") || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else if (file.type === "application/pdf") {
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(buffer);
          let text = "";
          for (let i = 0; i < Math.min(bytes.length, 50000); i++) {
            const c = bytes[i];
            if (c >= 32 && c < 127) text += String.fromCharCode(c);
            else if (c === 10 || c === 13) text += "\n";
          }
          resolve(text || "No se pudo extraer texto del PDF (usa .txt para prueba real de RAG, o configura el backend para extracción real).");
        };
      } else {
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          resolve("Extracción de texto para este tipo de archivo requiere el backend. Configura NEXT_PUBLIC_API_URL y súbelo de nuevo.");
        };
      }
    });
  };

  const handleFile = async (file: File) => {
    // 1. Restricción: un solo documento a la vez para RAG correcto
    const existingIndexed = uploadedFiles.find((f) => f.status === "indexed" || f.status === "indexing");
    if (existingIndexed) {
      setUploadError(
        `Ya hay un documento indexado ("${existingIndexed.name}"). Elimínalo primero si quieres subir otro documento y realizar el RAG sobre uno solo.`
      );
      return;
    }

    // 2. Rechazar imágenes en la indexación
    if (esArchivoImagen(file)) {
      setUploadError("No se pueden indexar imágenes. Sube un archivo de texto, PDF, Word, Excel o CSV.");
      return;
    }

    // 2. Validar campos de metadatos antes de indexar
    limpiarErroresValidacion();
    if (!validarCamposMetadatos()) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setExtractionInfo(null);

    const newFile: UploadedFile = {
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: formatFileSize(file.size),
      sizeBytes: file.size,
      uploadedAt: new Date().toLocaleDateString("es-ES", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      status: "indexing",
      progress: 0,
      review_status: "pending",
      aiModel: selectedAiModel,
      country: fileCountry,
      docType: fileDocType,
      reference: fileReference.trim() || undefined,
      folio: fileFolio.trim() || undefined,
    };

    setUploadedFiles([newFile, ...uploadedFiles]);

    try {
      // 1. Extraer texto del archivo
      setUploadProgress(10);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, progress: 10 } : f
        )
      );
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length === 0) {
        throw new Error("No se extrajo texto del documento. Prueba con un PDF o DOCX que contenga texto seleccionable.");
      }
      setExtractionInfo(
        `${text.length.toLocaleString("es-ES")} caracteres extraídos de "${file.name}"`
      );
      setUploadProgress(30);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, progress: 30 } : f
        )
      );

      // 2. Indexar con limpieza, chunking semántico y embeddings reales
      setUploadProgress(60);
      await rag.indexDocument(
        newFile.id,
        file.name,
        file.type,
        file.size,
        text,
        selectedAiModel,
        {
          country: fileCountry,
          docType: fileDocType,
          reference: fileReference.trim() || undefined,
          folio: fileFolio.trim() || undefined,
        },
        embeddingModel
      );

      setUploadProgress(100);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, progress: 100, status: "indexed" } : f
        )
      );
      setActiveFileId(newFile.id);

      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: `He indexado "${file.name}" y estoy listo para responder preguntas sobre su contenido.`,
          createdAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, status: "error", error: err.message } : f
        )
      );
      setUploadError(err.message || "Error al indexar el documento.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (id: string) => {
    setUploadedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (activeFileId === id) setActiveFileId(null);
      return next;
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!activeFileId) {
      setUploadError("Primero sube un documento para poder hacer preguntas.");
      return;
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: chatInput,
      createdAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatting(true);

    try {
      const { chatWithSources } = await import("@/lib/rag");

      const result = await chatWithSources(
        chatInput,
        activeFileId,
        selectedAiModel,
        {
          systemPrompt: RAG_SYSTEM_PROMPT,
          topK: 4,
        }
      );

      // Construir respuesta con citas de fuentes
      let contentWithSources = result.answer;
      if (result.sources.length > 0) {
        contentWithSources += "\n\n---\n**Fuentes consultadas:**\n";
        result.sources.forEach((s, i) => {
          contentWithSources += `\n[Fuente ${i + 1}] ${s.docName} (fragmento ${s.chunkIndex + 1}, score ${(s.score * 100).toFixed(0)}%)\n`;
          contentWithSources += `>${s.text.slice(0, 200)}${s.text.length > 200 ? "…" : ""}\n`;
        });
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: contentWithSources,
          createdAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: `Error al consultar el modelo: ${err.message}`,
          createdAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleSendClick = () => {
    handleSend({ preventDefault: () => {} } as React.FormEvent);
  };

  const activeFile = uploadedFiles.find((f) => f.id === activeFileId);

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 animate-in">
      <ScrollReveal variant="fade" once>
        <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-bold text-text-primary mb-2">
            Subir documento
          </h2>
          <p className="text-text-secondary max-w-md mx-auto">
            Sube cualquier tipo de archivo y hazle preguntas sobre su contenido con IA.
          </p>
        </div>

        {/* Selector de modelo de IA */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in">
          <div>
            <h3 className="font-semibold text-text-primary text-sm mb-2">Modelo de IA para indexación</h3>
            <p className="text-text-muted text-xs">
              Se usará para extraer texto, generar embeddings y responder preguntas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedAiModel}
              onChange={(e) => setSelectedAiModel(e.target.value)}
              className={cn(
                "rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "bg-surface text-text-primary hover:bg-primary/5",
                "min-w-[200px]"
              )}
            >
              {AI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
            <span className="text-xs text-text-muted">
              {AI_MODELS.find((m) => m.id === selectedAiModel)?.name}
            </span>
          </div>
        </div>

        {/* Metadatos del documento */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3 sm:min-w-[200px]">
            <label className="text-sm font-medium text-text-primary w-20">País</label>
            <select
              value={fileCountry}
              onChange={(e) => setFileCountry(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="CO">Colombia</option>
              <option value="CU">Cuba</option>
              <option value="MX">México</option>
              <option value="AR">Argentina</option>
              <option value="CL">Chile</option>
              <option value="PE">Perú</option>
              <option value="EC">Ecuador</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
          <div className="flex items-center gap-3 sm:min-w-[200px]">
            <label className="text-sm font-medium text-text-primary w-20">Tipo</label>
            <select
              value={fileDocType}
              onChange={(e) => setFileDocType(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="legal">Legal / Contratos</option>
              <option value="fiscal">Facturas / Tributario</option>
              <option value="laboral">Laboral</option>
              <option value="civil">Civil</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        {/* Campos de texto con validación alfanumérica */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3 sm:min-w-[200px]">
            <label className="text-sm font-medium text-text-primary w-20">Referencia</label>
            <input
              type="text"
              value={fileReference}
              onChange={(e) => setFileReference(e.target.value)}
              placeholder="Solo letras"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-1"
            />
            {validationErrors.reference && (
              <span className="text-xs text-destructive mt-1 block">{validationErrors.reference}</span>
            )}
          </div>
          <div className="flex items-center gap-3 sm:min-w-[200px]">
            <label className="text-sm font-medium text-text-primary w-20">Folio / Expediente</label>
            <input
              type="text"
              value={fileFolio}
              onChange={(e) => setFileFolio(e.target.value)}
              placeholder="Solo números"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-1"
            />
            {validationErrors.folio && (
              <span className="text-xs text-destructive mt-1 block">{validationErrors.folio}</span>
            )}
          </div>
          <p className="text-xs text-text-muted">
            Referencia: solo letras. Folio: solo números.
          </p>
        </div>

        {/* Zona de upload - acepta cualquier tipo de archivo */}
        <div
          className={cn(
            "border-2 border-border rounded-2xl bg-surface p-8 sm:p-12 text-center transition-colors duration-300",
            "hover:border-primary/5 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isUploading && "border-primary/20 bg-primary/5",
          )}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            if (file) handleFile(file);
          }}
        >
          {isUploading ? (
            <>
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-text-primary text-sm font-medium">Subiendo e indexando archivo…</span>
              </div>
              <div className="w-full bg-border rounded-full h-2 mt-4">
                <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              {extractionInfo && (
                <p className="text-text-secondary text-xs mt-2">✓ {extractionInfo}</p>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-text-muted hover:text-primary transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M10 7a2 2 0 002 2h4a2 2 0 002-2M10 11a2 2 0 002 2h2a2 2 0 002-2M10 15a2 2 0 002 2h6a2 2 0 002-2M2 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M2 12l7 7 7-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Arrastra y suelta cualquier archivo aquí
              </h3>
              <p className="text-text-secondary mb-6">
                Formatos compatibles: PDF, DOCX, XLSX, TXT, PNG, JPG, WEBP, CSV, JSON y más (máx. 100 MB)
              </p>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="*/*"
              />
              <Button
                variant="primary"
                type="button"
                className="w-full sm:w-auto justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar archivo
              </Button>
            </>
          )}
        </div>

        {/* Error state */}
        {uploadError && (
          <div className="bg-destructive-light border border-destructive/20 text-destructive rounded-xl p-4 text-center">
            <p className="font-medium">{uploadError}</p>
          </div>
        )}

        {/* Lista de archivos */}
        {uploadedFiles.length > 0 && (
          <section className="animate-in fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-text-primary text-lg">
                Documentos indexados ({uploadedFiles.length})
              </h3>
              <Button variant="outline" size="sm" onClick={() => setUploadedFiles([])}>
                Limpiar todo
              </Button>
            </div>
            <div className="rounded-xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/5 border-b border-border">
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Archivo
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Modelo IA
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b border-border hover:bg-primary/3 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <span className="font-medium text-text-primary truncate">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm">
                        {file.type.split("/").pop()?.toUpperCase() || "FILE"}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm">{file.size}</td>
                      <td className="px-4 py-3 text-text-muted text-sm">
                        {AI_MODELS.find((m) => m.id === file.aiModel)?.name || file.aiModel}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge(file.status)} className="text-xs">
                          {file.status === "indexing" ? `Indexando… ${file.progress}%` : statusLabel(file.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant={file.status === "indexed" ? "primary" : "outline"}
                          size="sm"
                          onClick={() => {
                            setActiveFileId(file.id);
                            if (file.status !== "indexed") {
                              setUploadError("Espera a que termine la indexación para hacer preguntas.");
                            }
                          }}
                          className="px-3 py-1.5 text-xs"
                          disabled={file.status !== "indexed"}
                        >
                          {file.status === "indexed" ? "Preguntar" : "Esperando"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="px-2 py-1.5 text-xs"
                          onClick={() => handleRemove(file.id)}
                          aria-label="Eliminar"
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Chat RAG */}
        <section className="animate-in slide-up space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-text-primary text-lg">
                {activeFile ? `Preguntar sobre "${activeFile.name}"` : "Chatea con tu documento"}
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                {activeFile
                  ? activeFile.status === "indexed"
                    ? `Usando modelo: ${AI_MODELS.find((m) => m.id === activeFile.aiModel)?.name}`
                    : `Indexando… ${activeFile.progress}%`
                  : "Sube un documento para comenzar."}
              </p>
            </div>
            {activeFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveFileId(null);
                  setChatMessages([]);
                }}
              >
                Cerrar
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
            <div className="p-1 overflow-y-auto max-h-[200px] space-y-1 shrink-0">
              {activeFile && activeFile.status !== "indexed" && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary mb-1">
                      <span className="spin h-3 w-3 border-1 border-primary border-t-transparent rounded-full" />
                    </div>
                    <p className="text-text-secondary text-[0.65rem]">
                      Indexando documento… {activeFile.progress}%
                    </p>
                  </div>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[70%] p-1 rounded-lg leading-relaxed text-[0.7rem]",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-surface rounded-tr-none rounded-tl-lg"
                      : "mr-auto bg-surface/50 text-text-primary border border-border rounded-tl-none rounded-br-lg",
                  )}
                >
                  <div className="flex items-start gap-1">
                    {msg.role === "assistant" && (
                      <div className="shrink-0 w-2 h-2 rounded-full bg-primary-light flex items-center justify-center text-primary">
                        <svg className="w-1 h-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="leading-relaxed mb-0.5">{msg.content}</p>
                      <span className="text-[0.55rem] text-text-muted block">
                        {msg.createdAt}
                      </span>
                    </div>
                    {msg.role === "user" && (
                      <div className="shrink-0 w-2 h-2 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <svg className="w-1 h-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 19H19M7 7h10v10H7V7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="ml-auto max-w-[70%] p-1 rounded-lg bg-primary text-surface rounded-tr-none rounded-tl-lg">
                  <div className="flex items-center gap-0.5">
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-0.5 rounded-full bg-surface animate-pulse" />
                      <span className="w-0.5 h-0.5 rounded-full bg-surface animate-pulse" style={{ animationDelay: "150ms" }} />
                      <span className="w-0.5 h-0.5 rounded-full bg-surface animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[0.6rem] text-surface font-medium">Escribiendo…</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-1 bg-surface flex items-center gap-1">
              <input
                type="text"
                placeholder={
                  !activeFile
                    ? "Sube un documento para comenzar…"
                    : activeFile.status !== "indexed"
                      ? "Espera a que termine la indexación…"
                      : "Escribe tu pregunta…"
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatting}
                className="flex-1 text-sm py-1 rounded-xl bg-transparent border-none focus:ring-0 placeholder:text-text-muted"
              />
              {!isChatting ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendClick}
                  className="px-3 py-1 text-sm font-medium shadow-sm hover:shadow-md min-w-[60px] text-center whitespace-nowrap"
                >
                  Enviar
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
      </ScrollReveal>
    </main>
  );
}
