import { registerAs } from '@nestjs/config';

export const pineconeConfig = registerAs('pinecone', () => ({
  apiKey: process.env.PINECONE_API_KEY,
  indexName: process.env.PINECONE_INDEX_NAME,
}));
