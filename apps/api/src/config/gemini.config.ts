import { registerAs } from '@nestjs/config';

export const geminiConfig = registerAs('gemini', () => ({
  apiKey: process.env.GEMINI_API_KEY,
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2',
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS || 1536),
  chatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-flash-lite-latest',
}));
