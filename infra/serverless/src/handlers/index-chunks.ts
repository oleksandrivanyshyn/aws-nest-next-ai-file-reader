import { namespaceFor } from '../clients/pinecone';
import { getJson } from '../clients/s3';
import type { EmbedChunksResult, EmbeddedChunk, IndexChunksResult } from '../types/state';

const UPSERT_BATCH_SIZE = 100;

export async function handler(input: EmbedChunksResult): Promise<IndexChunksResult> {
  const { bucket, key, documentId, userEmail, vectorsKey } = input;

  const vectors = await getJson<EmbeddedChunk[]>(bucket, vectorsKey);
  const namespace = namespaceFor(userEmail);

  try {
    await namespace.deleteAll();
  } catch (error) {
    console.log(`nothing to clear in namespace ${userEmail}: ${String(error)}`);
  }

  for (let start = 0; start < vectors.length; start += UPSERT_BATCH_SIZE) {
    await namespace.upsert(vectors.slice(start, start + UPSERT_BATCH_SIZE));
    console.log(`indexed ${Math.min(start + UPSERT_BATCH_SIZE, vectors.length)}/${vectors.length}`);
  }

  return { bucket, key, documentId, userEmail, indexedCount: vectors.length };
}
