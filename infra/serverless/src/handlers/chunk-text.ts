import { getText, putJson } from '../clients/s3';
import { env } from '../lib/env';
import type { ChunkTextResult, ExtractTextResult } from '../types/state';

function splitIntoChunks(text: string, size: number, overlap: number): string[] {
  const stride = size - overlap;

  if (stride <= 0) {
    throw new Error(`CHUNK_OVERLAP (${overlap}) must be smaller than CHUNK_SIZE (${size})`);
  }

  const chunks: string[] = [];

  for (let start = 0; start < text.length; start += stride) {
    const chunk = text.slice(start, start + size).trim();

    if (chunk) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

export async function handler(input: ExtractTextResult): Promise<ChunkTextResult> {
  const { bucket, key, documentId, userEmail, textKey } = input;

  const text = await getText(bucket, textKey);
  const chunks = splitIntoChunks(text, env.chunkSize, env.chunkOverlap);

  if (chunks.length === 0) {
    throw new Error(`No chunks produced from ${textKey}`);
  }

  const chunksKey = `work/${documentId}/chunks.json`;
  await putJson(bucket, chunksKey, chunks);

  console.log(`split ${text.length} characters into ${chunks.length} chunks`);

  return { bucket, key, documentId, userEmail, chunksKey, chunkCount: chunks.length };
}
