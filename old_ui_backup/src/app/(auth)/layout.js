'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/AuthStore';

export default function AuthLayout({ children }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace('/');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Render the auth screen immediately. Session hydration may include a
  // network request to recover a remembered HttpOnly-cookie session, and it
  // should not block the form or its server-rendered content from painting.
  if (hasHydrated && isAuthenticated) return null;

  return <main>{children}</main>;
}
