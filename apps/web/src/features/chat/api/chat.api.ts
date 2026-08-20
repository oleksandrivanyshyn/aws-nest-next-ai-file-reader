import type {
  AskResponse,
  DocumentDto,
  UploadUrlResponse,
} from '../types/chat.types';

export const documentKeys = {
  current: ['document', 'current'] as const,
};

let currentDocument: DocumentDto | null = null;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const documentsApi = {
  createUploadUrl: async (input: {
    filename: string;
    contentType: string;
    size: number;
  }): Promise<UploadUrlResponse> => {
    await delay(150);
    const documentId = crypto.randomUUID();
    currentDocument = {
      id: documentId,
      filename: input.filename,
      sizeBytes: input.size,
      status: 'pending',
      currentStep: 'extract',
    };
    return { documentId, uploadUrl: 'placeholder://upload' };
  },

  uploadToS3: (
    uploadUrl: string,
    file: File,
    options?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
  ) =>
    new Promise<void>((resolve, reject) => {
      let percent = 0;
      const interval = setInterval(() => {
        percent = Math.min(100, percent + 20);
        options?.onProgress?.(percent);
        if (percent >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 150);

      options?.signal?.addEventListener('abort', () => {
        clearInterval(interval);
        currentDocument = null;
        reject(new DOMException('Upload cancelled', 'AbortError'));
      });
    }),

  getCurrent: async (): Promise<DocumentDto | null> => {
    await delay(100);
    return currentDocument;
  },

  remove: async (documentId: string): Promise<void> => {
    await delay(100);
    if (currentDocument?.id === documentId) {
      currentDocument = null;
    }
  },

  ask: async (documentId: string, question: string): Promise<AskResponse> => {
    await delay(600);
    return {
      answer: `This is a placeholder answer for "${question}" — the backend isn't wired up yet.`,
      sourceClause: 'clause 1.1',
    };
  },
};

const STEPS: DocumentDto['currentStep'][] = [
  'extract',
  'chunk',
  'embed',
  'index',
];

setInterval(() => {
  if (currentDocument?.status !== 'pending' || !currentDocument.currentStep)
    return;

  const index = STEPS.indexOf(currentDocument.currentStep);
  if (index < STEPS.length - 1) {
    currentDocument = { ...currentDocument, currentStep: STEPS[index + 1] };
  } else {
    currentDocument = {
      ...currentDocument,
      status: 'indexed',
      currentStep: undefined,
      pageCount: 12,
    };
  }
}, 2500);
