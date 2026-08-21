'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { documentKeys, documentsApi } from '../api/chat.api';

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => documentsApi.remove(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.current });
    },
    onError: (error) => {
      toast.add({
        type: 'error',
        title: "Couldn't delete the document",
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
      });
    },
  });
}
