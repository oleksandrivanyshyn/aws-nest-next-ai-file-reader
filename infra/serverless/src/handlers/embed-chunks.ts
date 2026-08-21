import { embed } from '../clients/openai';
import { getJson, putJson } from '../clients/s3';
import { env } from '../lib/env';
import type { ChunkTextResult, EmbedChunksResult, EmbeddedChunk } from '../types/state';

export async function handler(input: ChunkTextResult): Promise<EmbedChunksResult> {
  const { bucket, key, documentId, userEmail, chunksKey } = input;

  const chunks = await getJson<string[]>(bucket, chunksKey);
  const embedded: EmbeddedChunk[] = [];

  for (let start = 0; start < chunks.length; start += env.embedBatchSize) {
    const batch = chunks.slice(start, start + env.embedBatchSize);
    const vectors = await embed(batch);

    vectors.forEach((values, offset) => {
      const chunkIndex = start + offset;

      embedded.push({
        id: `${documentId}#${chunkIndex}`,
        values,
        metadata: {
          documentId,
          chunkIndex,
          text: chunks[chunkIndex] ?? '',
        },
      });
    });

    console.log(`embedded ${embedded.length}/${chunks.length} chunks`);
  }

  const vectorsKey = `work/${documentId}/vectors.json`;
  await putJson(bucket, vectorsKey, embedded);

  return { bucket, key, documentId, userEmail, vectorsKey, chunkCount: embedded.length };
}
