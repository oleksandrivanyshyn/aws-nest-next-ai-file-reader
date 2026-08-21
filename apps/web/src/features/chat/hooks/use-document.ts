'use client';

import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '@/store/session.store';
import { documentKeys, documentsApi } from '../api/chat.api';

export function useDocument() {
  const email = useSessionStore((state) => state.email);

  return useQuery({
    queryKey: documentKeys.current(email),
    queryFn: () => (email ? documentsApi.getCurrent() : null),
    enabled: Boolean(email),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 2000 : false;
    },
  });
}

