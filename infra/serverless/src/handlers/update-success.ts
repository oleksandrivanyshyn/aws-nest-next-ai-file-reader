import { updateStatus } from '../clients/dynamodb';
import type { IndexChunksResult } from '../types/state';

export async function handler(input: IndexChunksResult): Promise<IndexChunksResult> {
  const { userEmail, documentId, indexedCount } = input;

  await updateStatus({ userEmail, status: 'SUCCESS', chunkCount: indexedCount });

  console.log(`document ${documentId} ready with ${indexedCount} chunks`);

  return input;
}
