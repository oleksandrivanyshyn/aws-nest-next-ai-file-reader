export type DocumentStatus = 'pending' | 'indexed' | 'error';

export type ProcessingStep = 'extract' | 'chunk' | 'embed' | 'index';

export interface DocumentDto {
  id: string;
  filename: string;
  sizeBytes: number;
  status: DocumentStatus;
  currentStep?: ProcessingStep;
  errorMessage?: string;
  pageCount?: number;
}

export interface UploadUrlResponse {
  documentId: string;
  uploadUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sourceClause?: string;
}

export interface AskResponse {
  answer: string;
  sourceClause?: string;
}
