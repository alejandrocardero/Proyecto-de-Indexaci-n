"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: "indexing" | "indexed" | "error";
  progress: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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

  const handleFile = (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    // Simular subida + indexación
    setTimeout(() => {
      setIsUploading(false);
      const newFile: UploadedFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type || "application/octet-stream",
        size: formatFileSize(file.size),
        uploadedAt: new Date().toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "indexing",
        progress: 0,
      };
      setUploadedFiles([newFile, ...uploadedFiles]);

      // Simular progreso de indexación
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === newFile.id ? { ...f, progress } : f
          )
        );
        if (progress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === newFile.id ? { ...f, status: "indexed" } : f
            )
          );
          setActiveFileId(newFile.id);
          setChatMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              role: "assistant",
              content: `He indexado "${file.name}". Ya puedes hacerme preguntas sobre su contenido.`,
              createdAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
        }
      }, 300);
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (id: string) => {
    setUploadedFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      if (activeFileId === id) setActiveFileId(null);
      return next;
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!activeFileId) {
      setUploadError("Primero sube un documento para poder hacer preguntas.");
      return;
    }

    const file = uploadedFiles.find(f => f.id === activeFileId);

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: chatInput,
      createdAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatting(true);

    // Simular respuesta del RAG
    setTimeout(() => {
      const responses = [
        `Basado en "${file?.name}", el documento contiene información relevante sobre tu consulta.`,
        "Según el contenido indexado, aquí está lo que encontré relacionado con lo que preguntas.",
        "El documento menciona varios puntos clave sobre este tema. ¿Te gustaría que profundice en alguno?",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];

      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: response,
          createdAt: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsChatting(false);
    }, 1200);
  };

  const handleSendClick = () => {
    handleSend({ preventDefault: () => {} } as React.FormEvent);
  };

  const activeFile = uploadedFiles.find(f => f.id === activeFileId);

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8 animate-in">
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
            Sube un archivo y hazle preguntas sobre su contenido con IA.
          </p>
        </div>

        {/* Zona de upload */}
        <div
          className={cn(
            "border-2 border-border rounded-2xl bg-surface p-8 sm:p-12 text-center transition-colors duration-300",
            "hover:border-primary/5 hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isUploading && "border-primary/20 bg-primary/5",
          )}
          onDragOver={e => e.preventDefault()}
          onDragLeave={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            if (file) handleFile(file);
          }}
        >
          {isUploading ? (
            <>
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <span className="text-text-primary text-sm font-medium">Subiendo archivo…</span>
              </div>
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
                Arrastra y suelta un archivo aquí
              </h3>
              <p className="text-text-secondary mb-6">
                Formatos compatibles: PDF, DOCX, XLSX, TXT (máx. 50 MB)
              </p>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
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

        {/* Lista de archivos con estado de indexación */}
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
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Archivo</th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Tamaño</th>
                    <th className="px-4 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">Acciones</th>
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
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge(file.status)} className="text-xs">
                          {file.status === "indexing" ? `Indexando… ${file.progress}%` : statusLabel(file.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-muted text-sm">{file.size}</td>
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
                    ? "Haz preguntas sobre el contenido de este documento."
                    : `Indexando… ${activeFile.progress}%`
                  : "Sube un documento para comenzar."
                }
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

          {/* Contenedor del chat - crece con los mensajes */}
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
            {/* Área de mensajes con scroll */}
            <div className="p-1 overflow-y-auto max-h-[200px] space-y-1 shrink-0">
              {activeFile && activeFile.status !== "indexed" && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary mb-1">
                      <span className="spin h-3 w-3 border-1 border-primary border-t-transparent rounded-full" />
                    </div>
                    <p className="text-text-secondary text-[0.65rem]">Indexando documento… {activeFile.progress}%</p>
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

            {/* Barra de input fija abajo */}
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
                onChange={e => setChatInput(e.target.value)}
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
    </main>
  );
}
