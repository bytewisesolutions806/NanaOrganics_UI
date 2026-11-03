"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function BenefitsFooter({
  benefits,
  children,
}: {
  benefits: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAccountPage =
    pathname === "/account" || pathname?.startsWith("/account/");

  return (
    <>
      {isAccountPage ? null : benefits}
      {children}
    </>
  );
}
