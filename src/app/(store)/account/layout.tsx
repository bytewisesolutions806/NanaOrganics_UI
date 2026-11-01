import { Suspense } from "react";
import { AccountSidebar } from "@/features/account/components/account-sidebar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[#fbfdfb] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <Suspense fallback={<div className="min-h-20 animate-pulse rounded-[22px] bg-[#f2f9f8] lg:min-h-[650px]" aria-hidden="true" />}>
          <AccountSidebar />
        </Suspense>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
