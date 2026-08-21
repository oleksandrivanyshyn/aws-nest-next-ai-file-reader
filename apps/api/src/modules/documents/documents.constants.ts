export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPE = 'application/pdf';

export const PRESIGNED_URL_TTL_SECONDS = 300;

export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
} as const;

export type DocumentStatus =
  (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export interface DocumentRow {
  userEmail: string;
  documentId: string;
  fileName: string;
  s3Key: string;
  status: DocumentStatus;
  chunkCount?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
