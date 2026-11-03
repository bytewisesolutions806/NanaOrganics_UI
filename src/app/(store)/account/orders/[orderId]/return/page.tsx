import type { Metadata } from "next";
import { Suspense } from "react";

import { ReturnOrder } from "@/features/account/components/return-order";

export const metadata: Metadata = { title: "Return an order" };

export default function ReturnOrderPage() {
  return <Suspense fallback={<p className="py-12 text-center text-sm text-[#69756f]">Loading return form…</p>}><ReturnOrder /></Suspense>;
}
