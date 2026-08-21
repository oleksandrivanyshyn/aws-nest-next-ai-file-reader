import OpenAI from 'openai';

import { env, RateLimitError } from '../lib/env';

const client = new OpenAI({ apiKey: env.openaiApiKey });

export async function embed(texts: string[]): Promise<number[][]> {
  try {
    const response = await client.embeddings.create({
      model: env.embeddingModel,
      dimensions: env.embeddingDimensions,
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    if (error instanceof OpenAI.APIError && error.status === 429) {
      throw new RateLimitError(`OpenAI rate limit: ${error.message}`);
    }

    throw error;
  }
}
