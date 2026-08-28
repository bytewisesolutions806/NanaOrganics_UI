'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/AuthStore';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TopBanner from '@/components/TopBanner';
import ProfileSidebar from '@/components/ProfileSection/ProfileSidebar';

export default function ProfileLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Restoring your session…
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <TopBanner />
      <Header />

      <main className="pt-[220px] mb-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-0">
          <div className="hidden lg:block">
            <ProfileSidebar />
          </div>

          <div className="min-w-0">{children}</div>
        </div>
      </main>

      <Footer />
    </>
  );
}
