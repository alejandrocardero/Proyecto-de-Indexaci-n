import { describe, it, expect, vi, beforeEach } from "vitest";
import { listDocuments, type Document } from "@/lib/api";

// Mock del cliente de Supabase para evitar necesidad de variables de entorno
vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  })),
}));

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("listDocuments", () => {
  it("debe retornar lista de documentos del backend", async () => {
    const mockResponse: { items: Document[]; total: number; limit: number; offset: number } = {
      items: [
        {
          id: "doc-1",
          organization_id: "org-1",
          title: "Test Document",
          original_filename: "test.pdf",
          mime_type: "application/pdf",
          size_bytes: 1024,
          storage_path: "org-1/doc-1/test.pdf",
          review_status: "pending",
          indexing_status: "indexed",
          created_at: "2024-01-15T00:00:00Z",
          updated_at: "2024-01-15T00:00:00Z",
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await listDocuments({ limit: 20, offset: 0 });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Test Document");
    expect(result.total).toBe(1);
  });

  it("debe lanzar error cuando el backend responde con error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ detail: "Error interno del servidor" }),
    } as Response);

    await expect(listDocuments({ limit: 20, offset: 0 })).rejects.toThrow(
      "Error interno del servidor"
    );
  });
});
