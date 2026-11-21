"use client";

import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type DocumentStatus = "pending" | "approved" | "rejected";
export type IndexingStatus = "queued" | "processing" | "indexed" | "error";

export interface Document {
  id: string;
  organization_id: string;
  title: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  review_status: DocumentStatus;
  indexing_status: IndexingStatus;
  review_comment?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListDocumentsResponse {
  items: Document[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReviewRequest {
  status: "approved" | "rejected";
  comment?: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  metadata: Record<string, unknown>;
}

export interface SearchRequest {
  query: string;
  filters?: Record<string, unknown>;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  date: string;
  relevance?: string;
  status: DocumentStatus;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

/**
 * Ejecuta una petición autenticada contra el backend FastAPI.
 * Incluye automáticamente el token de Supabase en la cabecera Authorization
 * y el X-Organization-Id cuando se proporciona.
 */
async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  orgId?: string
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  if (orgId) {
    headers["X-Organization-Id"] = orgId;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.detail || errorBody.message || `Error ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Sube un archivo usando FormData (multipart). Incluye auth y org id.
 */
async function uploadFile(
  file: File,
  title?: string,
  orgId?: string
): Promise<Document> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append("file", file);
  if (title) {
    formData.append("title", title);
  }

  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  if (orgId) {
    headers["X-Organization-Id"] = orgId;
  }

  const response = await fetch(`${API_URL}/api/v1/documents`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.detail || errorBody.message || `Error ${response.status}`
    );
  }

  return response.json();
}

/* =========================================================================
   Auth
   ========================================================================= */

export async function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/api/v1/auth/me");
}

/* =========================================================================
   Documents
   ========================================================================= */

export async function listDocuments({
  status,
  limit = 20,
  offset = 0,
  orgId,
}: {
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
  orgId?: string;
}): Promise<ListDocumentsResponse> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("limit", String(limit));
  params.append("offset", String(offset));

  return apiRequest<ListDocumentsResponse>(
    `/api/v1/documents?${params.toString()}`,
    {},
    orgId
  );
}

export async function getDocument(
  documentId: string,
  orgId?: string
): Promise<Document> {
  return apiRequest<Document>(`/api/v1/documents/${documentId}`, {}, orgId);
}

export async function uploadDocument(
  file: File,
  title?: string,
  orgId?: string
): Promise<Document> {
  return uploadFile(file, title, orgId);
}

export async function reviewDocument(
  documentId: string,
  payload: ReviewRequest,
  orgId?: string
): Promise<Document> {
  return apiRequest<Document>(
    `/api/v1/documents/${documentId}/review`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    orgId
  );
}

export async function archiveDocument(
  documentId: string,
  orgId?: string
): Promise<void> {
  return apiRequest<void>(
    `/api/v1/documents/${documentId}`,
    { method: "DELETE" },
    orgId
  );
}

/* =========================================================================
   Search
   ========================================================================= */

export async function searchDocuments(
  payload: SearchRequest,
  orgId?: string
): Promise<SearchResult[]> {
  return apiRequest<SearchResult[]>(
    "/api/v1/search",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    orgId
  );
}

/* =========================================================================
   Audit
   ========================================================================= */

export async function listAuditLogs({
  limit = 50,
  offset = 0,
  orgId,
}: {
  limit?: number;
  offset?: number;
  orgId?: string;
}): Promise<{ items: AuditLog[]; total: number; limit: number; offset: number }> {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  params.append("offset", String(offset));

  return apiRequest(
    `/api/v1/audit?${params.toString()}`,
    {},
    orgId
  );
}

/* =========================================================================
   Organizations
   ========================================================================= */

export interface Organization {
  id: string;
  name: string;
  slug?: string | null;
  role: string;
}

export async function listOrganizations(): Promise<Organization[]> {
  return apiRequest<Organization[]>("/api/v1/organizations");
}

/* =========================================================================
   Health
   ========================================================================= */

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_URL}/api/v1/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return response.json();
}
