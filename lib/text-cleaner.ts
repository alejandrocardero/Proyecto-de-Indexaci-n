/**
 * Limpieza de texto extraído de documentos (PDF, Word, HTML, TXT).
 * Elimina encabezados, pies de página, números de página sueltos
 * y normaliza espacios en blanco sin destruir la estructura semántica.
 */

export interface CleanOptions {
  removePageNumbers?: boolean;
  removeHeadersFooters?: boolean;
  normalizeWhitespace?: boolean;
  minLineLength?: number;
}

const DEFAULT_OPTIONS: CleanOptions = {
  removePageNumbers: true,
  removeHeadersFooters: true,
  normalizeWhitespace: true,
  minLineLength: 3,
};

/**
 * Detecta si una línea es probablemente un número de página aislado.
 */
function isLikelyPageNumber(line: string): boolean {
  const trimmed = line.trim();
  // Números solos: "1", "42", "Página 5", "Page 5", "- 5 -", etc.
  const pagePatterns = [
    /^\s*\d{1,4}\s*$/,                 // "42"
    /^\s*(página|page)\s+\d{1,4}\s*$/i, // "Página 5"
    /^\s*-\s*\d{1,4}\s*-\s*$/,         // "- 5 -"
    /^\s*\d{1,4}\s*\|\s*$/,            // "5 |"
    /^\s*\|\s*\d{1,4}\s*$/,            // "| 5"
  ];
  return pagePatterns.some((re) => re.test(trimmed));
}

/**
 * Detecta si una línea es probablemente un encabezado/pie de página repetitivo.
 * Heurística: líneas muy cortas, todo mayúsculas, o que aparecen como borde.
 */
function isLikelyHeaderFooter(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 120) return false;
  // Todo mayúsculas y corto (ej: "CONFIDENCIAL", "MI PYMES")
  if (trimmed === trimmed.toUpperCase() && trimmed.length <= 60) {
    const alphaRatio = (trimmed.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/g) || []).length / trimmed.length;
    if (alphaRatio > 0.6) return true;
  }
  return false;
}

export function cleanText(
  raw: string,
  options: CleanOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let lines = raw.split(/\r?\n/);

  if (opts.removePageNumbers) {
    lines = lines.filter((line) => !isLikelyPageNumber(line));
  }

  if (opts.removeHeadersFooters) {
    lines = lines.filter((line) => !isLikelyHeaderFooter(line));
  }

  if (opts.normalizeWhitespace) {
    lines = lines.map((line) => line.replace(/\s+/g, " ").trim());
  }

  if (opts.minLineLength) {
    lines = lines.filter((line) => line.length >= opts.minLineLength!);
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
