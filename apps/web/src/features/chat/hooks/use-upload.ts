'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { documentKeys, documentsApi } from '../api/chat.api';

export function useUpload() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function upload(file: File) {
    setIsUploading(true);
    setProgress(0);
    abortRef.current = new AbortController();

    let uploadUrlCreated = false;
    try {
      const { uploadUrl } = await documentsApi.createUploadUrl({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      uploadUrlCreated = true;

      await documentsApi.uploadToS3(uploadUrl, file, {
        onProgress: setProgress,
        signal: abortRef.current.signal,
      });

      await queryClient.invalidateQueries({ queryKey: documentKeys.current });
    } catch (error) {
      if (uploadUrlCreated) {
        await documentsApi.remove().catch(() => {});
        await queryClient.invalidateQueries({ queryKey: documentKeys.current });
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      toast.add({
        type: 'error',
        title: 'Upload failed',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setIsUploading(false);
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return { upload, cancel, progress, isUploading };
}
