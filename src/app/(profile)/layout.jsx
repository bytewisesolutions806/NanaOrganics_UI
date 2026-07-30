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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 grid grid-cols-12 gap-3">
          <div className="hidden lg:block lg:col-span-3">
            <ProfileSidebar />
          </div>

          <div className="col-span-12 lg:col-span-9">{children}</div>
        </div>
      </main>

      <Footer />
    </>
  );
}
