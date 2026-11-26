export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return `Tipo de archivo no permitido: ${file.type || "desconocido"}. Use PDF, DOCX, XLSX o TXT.`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `El archivo excede el límite de 50 MB (actual: ${(file.size / 1024 / 1024).toFixed(1)} MB).`
  }
  return null
}