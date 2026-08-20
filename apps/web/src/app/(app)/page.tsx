'use client';

import { ChatView } from '@/features/chat/components/chat-view';
import { useRedirectBySession } from '@/hooks/use-redirect-by-session';

export default function HomePage() {
  const { isReady, email } = useRedirectBySession('require');

  if (!isReady || !email) return null;

  return <ChatView />;
}
