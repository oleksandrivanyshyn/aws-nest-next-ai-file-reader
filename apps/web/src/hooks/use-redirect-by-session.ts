'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from './use-session';

export function useRedirectBySession(mode: 'require' | 'redirect-if-present') {
  const { email, isReady } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    if (mode === 'require' && !email) {
      router.replace('/login');
    }
    if (mode === 'redirect-if-present' && email) {
      router.replace('/');
    }
  }, [isReady, email, mode, router]);

  return { email, isReady };
}
