import { ApiError, client } from '@/services/fetch-client';
import { useSessionStore } from '@/store/session.store';
import type {
  AskResponse,
  DocumentDto,
  DocumentStatus,
  UploadUrlResponse,
} from '../types/chat.types';

interface BackendDocumentResponse {
  documentId: string;
  fileName: string;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: string;
}

interface BackendUploadUrlResponse {
  uploadUrl: string;
  documentId: string;
}

interface BackendAskResponse {
  answer: string;
}

export const documentKeys = {
  current: ['document', 'current'] as const,
};

export const documentsApi = {
  createUploadUrl: async (input: {
    filename: string;
    contentType: string;
    size: number;
  }): Promise<UploadUrlResponse> => {
    const email = useSessionStore.getState().email;
    if (!email) {
      throw new Error('User is not authenticated');
    }

    const response = await client<BackendUploadUrlResponse>(
      '/documents/upload-url',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          fileName: input.filename,
          fileType: input.contentType,
          fileSize: input.size,
        }),
      },
    );

    return {
      documentId: response.documentId,
      uploadUrl: response.uploadUrl,
    };
  },

  uploadToS3: (
    uploadUrl: string,
    file: File,
    options?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
  ): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options?.onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          options?.onProgress?.(100);
          resolve();
        } else {
          reject(new Error(`S3 upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () =>
        reject(new Error('Network error during upload to S3'));
      xhr.onabort = () =>
        reject(new DOMException('Upload cancelled', 'AbortError'));

      if (options?.signal) {
        options.signal.addEventListener('abort', () => xhr.abort());
      }

      xhr.send(file);
    }),

  getCurrent: async (): Promise<DocumentDto | null> => {
    const email = useSessionStore.getState().email;
    if (!email) {
      return null;
    }

    try {
      const doc = await client<BackendDocumentResponse>('/documents', {
        method: 'GET',
        params: { email },
      });

      return {
        id: doc.documentId,
        filename: doc.fileName,
        status: doc.status,
        errorMessage: doc.errorMessage,
        createdAt: doc.createdAt,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  remove: async (): Promise<void> => {
    const email = useSessionStore.getState().email;
    if (!email) {
      return;
    }

    await client<void>('/documents', {
      method: 'DELETE',
      params: { email },
    });
  },

  ask: async (question: string): Promise<AskResponse> => {
    const email = useSessionStore.getState().email;
    if (!email) {
      throw new Error('User is not authenticated');
    }

    const response = await client<BackendAskResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        email,
        question,
      }),
    });

    return {
      answer: response.answer,
    };
  },
};
