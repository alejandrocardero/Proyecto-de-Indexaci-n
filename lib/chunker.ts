/**
 * Chunking semántico respetuoso de la estructura legal/documental.
 * Divide en fragmentos de 300-800 tokens (~400-1000 caracteres)
 * con solapamiento de 50-100 tokens, intentando no cortar artículos
 * ni secciones en medio.
 */

export interface ChunkOptions {
  minChars?: number;
  maxChars?: number;
  overlapChars?: number;
}

const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  minChars: 300,
  maxChars: 900,
  overlapChars: 120,
};

/**
 * Patrones que indican inicio de artículo, sección, cláusula o inciso.
 */
const STRUCTURE_PATTERNS = [
  /^(Art(?:ículo)?\s*\d+[^\n]{0,80})/im,           // Artículo 5, Art. 12
  /^(Sección\s*\d+[^\n]{0,80})/im,                  // Sección 2
  /^(Cap(?:ítulo)?\s*\d+[^\n]{0,80})/im,            // Capítulo 3
  /^(Inciso\s*[a-z0-9]+[^\n]{0,80})/im,             // Inciso a)
  /^(Literal\s*[a-z0-9]+[^\n]{0,80})/im,            // Literal a)
  /^(Numeral\s*\d+[^\n]{0,80})/im,                  // Numeral 1
  /^(Parágrafo\s*\d+[^\n]{0,80})/im,                // Parágrafo 1
  /^(Anexo\s*\d+[^\n]{0,80})/im,                    // Anexo 1
];

/**
 * Detecta si una línea inicia una nueva sección estructural.
 */
function isStructureStart(line: string): boolean {
  const trimmed = line.trim();
  return STRUCTURE_PATTERNS.some((re) => re.test(trimmed));
}

/**
 * Divide texto en chunks semánticos respetando estructura.
 */
export function chunkTextSemantic(
  text: string,
  options: ChunkOptions = {}
): string[] {
  const opts = { ...DEFAULT_CHUNK_OPTIONS, ...options };

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const paraTrim = para.trim();

    // Si el párrafo inicia una estructura y ya tenemos contenido, cerrar chunk
    if (isStructureStart(paraTrim) && current.length >= opts.minChars!) {
      chunks.push(current.trim());
      current = "";
    }

    // Si agregar el párrafo excede maxChars y ya tenemos contenido, cerrar
    if (current.length + paraTrim.length > opts.maxChars! && current.length >= opts.minChars!) {
      chunks.push(current.trim());
      current = paraTrim;
    } else {
      current = current ? `${current}\n\n${paraTrim}` : paraTrim;
    }
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  // Aplicar solapamiento: mezclar final de chunk N con inicio de N+1
  if (opts.overlapChars && opts.overlapChars > 0 && chunks.length > 1) {
    const overlapped: string[] = [chunks[0]];
    for (let i = 1; i < chunks.length; i++) {
      const prev = chunks[i - 1];
      const tail = prev.slice(-opts.overlapChars);
      overlapped[i] = `${tail}\n---\n${chunks[i]}`;
    }
    return overlapped;
  }

  return chunks;
}

export interface DocumentChunkData {
  id: string;
  docId: string;
  text: string;
  index: number;
  metadata: DocumentChunkMetadata;
}

export interface DocumentChunkMetadata {
  country?: string;
  docType?: string;
  articleNumber?: string;
  section?: string;
  sourceUrl?: string;
  pageNumber?: number;
  uploadedAt?: string;
  reference?: string;
  folio?: string;
}
