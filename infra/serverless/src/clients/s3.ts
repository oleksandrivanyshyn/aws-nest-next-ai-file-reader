import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const client = new S3Client({});

export async function getBytes(bucket: string, key: string): Promise<Uint8Array> {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

  if (!response.Body) {
    throw new Error(`Empty body for s3://${bucket}/${key}`);
  }

  return response.Body.transformToByteArray();
}

export async function getText(bucket: string, key: string): Promise<string> {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

  if (!response.Body) {
    throw new Error(`Empty body for s3://${bucket}/${key}`);
  }

  return response.Body.transformToString();
}

export async function getJson<T>(bucket: string, key: string): Promise<T> {
  return JSON.parse(await getText(bucket, key)) as T;
}

export async function putText(bucket: string, key: string, body: string): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'text/plain; charset=utf-8',
    }),
  );
}

export async function putJson(bucket: string, key: string, value: unknown): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(value),
      ContentType: 'application/json',
    }),
  );
}

export function parseUploadKey(key: string): { documentId: string; userEmail: string } {
  const parts = decodeURIComponent(key).split('/');
  const userEmail = parts[1];
  const documentId = parts[2]?.replace(/\.pdf$/, '');

  if (!userEmail || !documentId) {
    throw new Error(
      `Invalid S3 key format: ${key}. Expected uploads/{userEmail}/{documentId}.pdf`,
    );
  }

  return { documentId, userEmail };
}
