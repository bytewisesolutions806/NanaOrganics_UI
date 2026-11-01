import type { Metadata } from "next";
import { Suspense } from "react";
import { WriteReview } from "@/features/account/components/write-review";
export const metadata: Metadata = { title: "Write a review" };
export default function WriteReviewPage() {
  return <Suspense fallback={<p className="py-12 text-center text-sm text-[#69756f]">Loading review form…</p>}><WriteReview /></Suspense>;
}
