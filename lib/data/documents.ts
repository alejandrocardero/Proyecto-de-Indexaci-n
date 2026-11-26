export interface Document {
  id: number
  title: string
  type: "PDF" | "DOCX" | "XLSX" | "TXT"
  date: string
  uploader: string
  status: "pending" | "approved" | "rejected"
  size?: string
  relevance?: string
}

export const BASE_DOCUMENTS: Document[] = [
  { id: 1, title: "Informe trimestral Q4 2023", type: "PDF", date: "2024-01-15", uploader: "Marcos", status: "approved", size: "2.4 MB" },
  { id: 2, title: "Manual de usuario v2.1", type: "DOCX", date: "2024-01-10", uploader: "Sistema", status: "pending", size: "1.8 MB" },
  { id: 3, title: "Presupuesto anual 2024", type: "XLSX", date: "2024-01-05", uploader: "Marcos", status: "pending", size: "850 KB" },
  { id: 4, title: "Política de seguridad", type: "PDF", date: "2024-01-01", uploader: "Sistema", status: "approved", size: "3.1 MB" },
  { id: 5, title: "Manual de cumplimiento", type: "PDF", date: "2023-12-20", uploader: "Marcos", status: "rejected", size: "2.9 MB" },
]

export function getDocumentsForPage(page: "documents" | "admin" | "search"): Document[] {
  return BASE_DOCUMENTS
}