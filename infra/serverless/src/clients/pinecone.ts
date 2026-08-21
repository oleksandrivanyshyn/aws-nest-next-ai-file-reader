import { Pinecone } from '@pinecone-database/pinecone';

import { env } from '../lib/env';

const pinecone = new Pinecone({ apiKey: env.pineconeApiKey });

export function namespaceFor(userEmail: string) {
  return pinecone.index(env.pineconeIndexName).namespace(userEmail);
}
