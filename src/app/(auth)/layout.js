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

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Restoring your session…
      </main>
    );
  }

  if (isAuthenticated) return null;

  return <main>{children}</main>;
}
