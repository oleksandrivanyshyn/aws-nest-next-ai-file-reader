import { env, RateLimitError } from '../lib/env';

interface BatchEmbedContentsResponse {
  embeddings: { values: number[] }[];
}

interface GeminiErrorBody {
  error?: { code?: number; message?: string; status?: string };
}

export async function embed(texts: string[]): Promise<number[][]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.embeddingModel}:batchEmbedContents?key=${env.geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${env.embeddingModel}`,
        content: { parts: [{ text }] },
        outputDimensionality: env.embeddingDimensions,
      })),
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as GeminiErrorBody | null;
    const message = body?.error?.message ?? response.statusText;

    if (response.status === 429) {
      throw new RateLimitError(`Gemini rate limit: ${message}`);
    }

    throw new Error(`Gemini batchEmbedContents failed (${response.status}): ${message}`);
  }

  const data = (await response.json()) as BatchEmbedContentsResponse;
  return data.embeddings.map((embedding) => embedding.values);
}
