function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function requiredNumber(name: string): number {
  const value = Number(required(name));

  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return value;
}

export const env = {
  bucketName: required('BUCKET_NAME'),
  tableName: required('TABLE_NAME'),

  openaiApiKey: required('OPENAI_API_KEY'),
  embeddingModel: required('OPENAI_EMBEDDING_MODEL'),
  embeddingDimensions: requiredNumber('EMBEDDING_DIMENSIONS'),
  embedBatchSize: requiredNumber('EMBED_BATCH_SIZE'),

  pineconeApiKey: required('PINECONE_API_KEY'),
  pineconeIndexName: required('PINECONE_INDEX_NAME'),

  chunkSize: requiredNumber('CHUNK_SIZE'),
  chunkOverlap: requiredNumber('CHUNK_OVERLAP'),
};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}
