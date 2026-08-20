'use client';

import { LoginForm } from '@/features/auth/components/login-form';
import { useRedirectBySession } from '@/hooks/use-redirect-by-session';

export default function LoginPage() {
  const { isReady } = useRedirectBySession('redirect-if-present');

  if (!isReady) return null;

  return <LoginForm />;
}
