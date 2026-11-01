import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderDetails } from "@/features/account/components/orders";
export const metadata: Metadata = { title: "Order details" };
export default function OrderDetailsPage() {
  return <Suspense fallback={<p className="py-12 text-center text-sm text-[#69756f]">Loading order…</p>}><OrderDetails /></Suspense>;
}
