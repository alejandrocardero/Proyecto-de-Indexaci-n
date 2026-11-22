import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;

console.log('Cargando modelo de embeddings...');
const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
console.log('Modelo cargado. Generando embedding...');
const out = await extractor('contrato de arrendamiento de vivienda', {
  pooling: 'mean',
  normalize: true,
});
const vec = Array.from(out.data);
console.log('EMBEDDING_OK dims=' + vec.length);
console.log('PRIMEROS=' + vec.slice(0, 5).map((n) => n.toFixed(4)).join(','));
