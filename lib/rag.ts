/**
 * Motor RAG completo con base vectorial cliente (IndexedDB),
 * metadatos, filtrado por país/tipo, re-ranking y citas de fuente.
 */

import { hfClient } from "./hf-client";
import { chunkTextSemantic, type DocumentChunkMetadata } from "./chunker";

export interface IndexedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  chunks: DocumentChunk[];
  uploadedAt: string;
  aiModel: string;
  status: "indexing" | "indexed" | "error";
  error?: string;
  metadata: DocumentChunkMetadata;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  text: string;
  embedding: number[] | null;
  index: number;
  metadata: DocumentChunkMetadata;
}

export interface SearchResult {
  text: string;
  score: number;
  docId: string;
  docName: string;
  chunkIndex: number;
  metadata: DocumentChunkMetadata;
}

export interface ChatWithSourcesResponse {
  answer: string;
  sources: SearchResult[];
  modelUsed: string;
}

/* ------------------------------------------------------------------ */
/*  Base vectorial en IndexedDB (persistencia cliente)                */
/* ------------------------------------------------------------------ */

const DB_NAME = "mipymes_rag";
const DB_VERSION = 1;
const STORE_DOCS = "documents";
const STORE_CHUNKS = "chunks";

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const database = req.result;
      if (!database.objectStoreNames.contains(STORE_DOCS)) {
        database.createObjectStore(STORE_DOCS, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(STORE_CHUNKS)) {
        database.createObjectStore(STORE_CHUNKS, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getDB(): Promise<IDBDatabase> {
  if (!db) db = await openDB();
  return db;
}

async function tx<T>(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => T): Promise<T> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    try {
      const result = fn(store);
      transaction.oncomplete = () => resolve(result as T);
      transaction.onerror = () => reject(transaction.error);
    } catch (err) {
      reject(err);
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Utilidades                                                        */
/* ------------------------------------------------------------------ */

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/* ------------------------------------------------------------------ */
/*  RAG                                                               */
/* ------------------------------------------------------------------ */

export const rag = {
  /* Listar documentos */
  async getAllDocuments(): Promise<IndexedDocument[]> {
    return tx(STORE_DOCS, "readonly", (store) => {
      const result: IndexedDocument[] = [];
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          result.push(cursor.value as IndexedDocument);
          cursor.continue();
        }
      };
      return result;
    });
  },

  async getDocument(docId: string): Promise<IndexedDocument | undefined> {
    return tx(STORE_DOCS, "readonly", (store) => {
      return new Promise<IndexedDocument | undefined>((resolve, reject) => {
        const req = store.get(docId);
        req.onsuccess = () => resolve(req.result as IndexedDocument | undefined);
        req.onerror = () => reject(req.error);
      });
    });
  },

  /* Indexar documento con limpieza, chunking semántico y embeddings */
  async indexDocument(
    docId: string,
    name: string,
    type: string,
    size: number,
    rawText: string,
    aiModel: string,
    metadata: DocumentChunkMetadata = {},
    embeddingModel?: string
  ): Promise<void> {
    const { cleanText } = await import("./text-cleaner");
    const cleaned = cleanText(rawText);

    const chunksRaw = chunkTextSemantic(cleaned, {
      minChars: 300,
      maxChars: 900,
      overlapChars: 120,
    });

    const chunks: DocumentChunk[] = [];
    const EMB_MODEL =
      embeddingModel ||
      process.env.NEXT_PUBLIC_HF_EMBEDDING_MODEL ||
      "sentence-transformers/all-MiniLM-L6-v2";

    for (let i = 0; i < chunksRaw.length; i++) {
      const emb = await hfClient.embedding(EMB_MODEL, chunksRaw[i]);
      chunks.push({
        id: `${docId}-${i}`,
        docId,
        text: chunksRaw[i],
        embedding: emb,
        index: i,
        metadata: {
          ...metadata,
          docType: type,
          uploadedAt: new Date().toISOString(),
        },
      });
    }

    const doc: IndexedDocument = {
      id: docId,
      name,
      type,
      size,
      chunks,
      uploadedAt: new Date().toLocaleDateString("es-ES", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
      aiModel,
      status: "indexed",
      metadata,
    };

    await tx(STORE_DOCS, "readwrite", (store) => store.put(doc));
    for (const chunk of chunks) {
      await tx(STORE_CHUNKS, "readwrite", (store) => store.put(chunk));
    }
  },

  /* Búsqueda por similitud con filtros y re-ranking */
  async search(
    query: string,
    filters?: {
      docId?: string;
      country?: string;
      docType?: string;
      topK?: number;
      minScore?: number;
    }
  ): Promise<SearchResult[]> {
    const topK = filters?.topK ?? 6;
    const minScore = filters?.minScore ?? 0.25;

    const { hfClient } = await import("./hf-client");
    const EMB_MODEL =
      process.env.NEXT_PUBLIC_HF_EMBEDDING_MODEL ||
      "sentence-transformers/all-MiniLM-L6-v2";
    const queryEmb = await hfClient.embedding(EMB_MODEL, query);

    // Cargar chunks
    const allChunks = await tx(STORE_CHUNKS, "readonly", (store) => {
      const result: DocumentChunk[] = [];
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          result.push(cursor.value as DocumentChunk);
          cursor.continue();
        }
      };
      return result;
    });

    const docsMap = new Map<string, IndexedDocument>();
    const allDocs = await this.getAllDocuments();
    for (const d of allDocs) docsMap.set(d.id, d);

    // Calcular scores y aplicar filtros
    const scored: SearchResult[] = [];
    for (const chunk of allChunks) {
      if (!chunk.embedding) continue;

      // Filtros
      if (filters?.docId && chunk.docId !== filters.docId) continue;
      if (filters?.country && chunk.metadata.country !== filters.country) continue;
      if (filters?.docType && chunk.metadata.docType !== filters.docType) continue;

      const score = cosineSimilarity(queryEmb, chunk.embedding);
      if (score < minScore) continue;

      const doc = docsMap.get(chunk.docId);
      scored.push({
        text: chunk.text,
        score,
        docId: chunk.docId,
        docName: doc?.name || "Desconocido",
        chunkIndex: chunk.index,
        metadata: chunk.metadata,
      });
    }

    // Ordenar por score descendente y tomar topK
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  },

  /* Re-ranking simple: re-evaluar los topN con un score ajustado */
  async rerank(
    query: string,
    results: SearchResult[],
    topN: number = 4
  ): Promise<SearchResult[]> {
    // Re-ranking ligero: bonificar chunks con mayor score original y menor índice
    // (asumimos que chunks anteriores son más relevantes)
    const reranked = results.map((r, idx) => ({
      ...r,
      score: r.score * (1 - idx * 0.05), // ligera penalización por posición
    }));
    reranked.sort((a, b) => b.score - a.score);
    return reranked.slice(0, topN);
  },

  async removeDocument(docId: string) {
    const doc = await this.getDocument(docId);
    if (doc) {
      for (const chunk of doc.chunks) {
        await tx(STORE_CHUNKS, "readwrite", (store) => store.delete(chunk.id));
      }
      await tx(STORE_DOCS, "readwrite", (store) => store.delete(docId));
    }
  },
};

/* ------------------------------------------------------------------ */
/*  Chat con fuentes (RAG + LLM)                                      */
/* ------------------------------------------------------------------ */

export async function chatWithSources(
  query: string,
  docId: string,
  chatModel: string,
  options?: {
    systemPrompt?: string;
    topK?: number;
    temperature?: number;
    maxNewTokens?: number;
  }
): Promise<ChatWithSourcesResponse> {
  // 1. Buscar chunks relevantes
    const results = await rag.search(query, { docId, topK: options?.topK ?? 6 });
  const reranked = await rag.rerank(query, results, options?.topK ?? 4);

  if (reranked.length === 0) {
    return {
      answer:
        "No se encontró información relevante en el documento para responder tu pregunta.",
      sources: [],
      modelUsed: chatModel,
    };
  }

  // 2. Construir contexto con citas
  const context = reranked
    .map((r, i) => `[Fuente ${i + 1}] ${r.text}`)
    .join("\n\n");

  const systemPrompt =
    options?.systemPrompt ??
    `Eres un asistente especializado. Responde ÚNICAMENTE basándote en los fragmentos del documento proporcionados.

REGLAS:
1. Si la información NO está en los fragmentos, responde: "Esa información no se encuentra dentro del documento proporcionado."
2. No inventes ni uses conocimiento externo.
3. Responde en español.
4. Cita las fuentes usando [Fuente X] cuando refieras información específica.

FRAGMENTOS:
${context}

PREGUNTA:
${query}`;

  // 3. Llamar al modelo de chat de Hugging Face
  const response: any = await hfClient.chat(chatModel, [
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ]);

  let answer = "";
  if (typeof response === "string") {
    answer = response;
  } else if (Array.isArray(response) && response[0]?.generated_text) {
    answer = response[0].generated_text;
  } else if (response?.generated_text) {
    answer = response.generated_text;
  } else {
    answer = "No se obtuvo respuesta del modelo.";
  }

  return {
    answer,
    sources: reranked,
    modelUsed: chatModel,
  };
}
