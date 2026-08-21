import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { env } from '../lib/env';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

interface StatusUpdate {
  userEmail: string;
  status: DocumentStatus;
  chunkCount?: number;
  errorMessage?: string;
}

export async function updateStatus({
  userEmail,
  status,
  chunkCount,
  errorMessage,
}: StatusUpdate): Promise<void> {
  const sets = ['#status = :status', 'updatedAt = :updatedAt'];
  const values: Record<string, unknown> = {
    ':status': status,
    ':updatedAt': new Date().toISOString(),
  };

  if (chunkCount !== undefined) {
    sets.push('chunkCount = :chunkCount');
    values[':chunkCount'] = chunkCount;
  }

  if (errorMessage !== undefined) {
    sets.push('errorMessage = :errorMessage');
    values[':errorMessage'] = errorMessage;
  }

  await client.send(
    new UpdateCommand({
      TableName: env.tableName,
      Key: { userEmail },
      UpdateExpression: `SET ${sets.join(', ')}`,
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(userEmail)',
    }),
  );
}
