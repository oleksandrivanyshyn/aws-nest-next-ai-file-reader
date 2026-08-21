'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { documentsApi } from '../api/chat.api';
import type { ChatMessage } from '../types/chat.types';

export function useChat(documentId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const mutation = useMutation({
    mutationFn: (question: string) => {
      if (!documentId) {
        return Promise.reject(new Error('No document to ask about yet.'));
      }
      return documentsApi.ask(question);
    },
    onMutate: (question) => {
      setMessages((prev) => [...prev, { role: 'user', content: question }]);
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sourceClause: data.sourceClause,
        },
      ]);
    },
    onError: (error) => {
      toast.add({
        type: 'error',
        title: "Couldn't get an answer",
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
      });
    },
  });

  return { messages, ask: mutation.mutate, isAsking: mutation.isPending };
}
