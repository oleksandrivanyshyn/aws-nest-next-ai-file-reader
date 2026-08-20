'use client';

import { useQuery } from '@tanstack/react-query';
import { documentKeys, documentsApi } from '../api/chat.api';

export function useDocument() {
  return useQuery({
    queryKey: documentKeys.current,
    queryFn: documentsApi.getCurrent,
    refetchInterval: (query) =>
      query.state.data?.status === 'pending' ? 2000 : false,
  });
}
