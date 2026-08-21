export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
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
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
