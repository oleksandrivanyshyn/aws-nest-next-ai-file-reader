'use client';

import { useSyncExternalStore } from 'react';
import { useSessionStore } from '@/store/session.store';

function useIsHydrated() {
  return useSyncExternalStore(
    (callback) => useSessionStore.persist.onFinishHydration(callback),
    () => useSessionStore.persist.hasHydrated(),
    () => false,
  );
}

export function useSession() {
  const email = useSessionStore((state) => state.email);
  const setEmail = useSessionStore((state) => state.setEmail);
  const clear = useSessionStore((state) => state.clear);
  const isReady = useIsHydrated();

  return { email, isReady, setEmail, clear };
}
