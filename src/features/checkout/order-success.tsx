"use client";

import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatCartMoney, getOrderByCode, type CartOrder } from "@/services/api/checkout";

export function OrderSuccess({ displayId, total, currency, paymentMethod, paymentStatus }: { displayId: string; total: number; currency: string; paymentMethod: string; paymentStatus: string }) {
  const [order, setOrder] = useState<CartOrder | null>(null);
  const stripe = paymentMethod === "stripe";

  useEffect(() => {
    if (!displayId) return;
    let active = true;
    let timeout = 0;
    let attempts = 0;
    const refresh = async () => {
      try {
        const result = await getOrderByCode(displayId);
        if (!active) return;
        setOrder(result);
        const state = result?.payments.find((payment) => payment.method === "stripe")?.state;
        attempts += 1;
        if (stripe && !["Settled", "Declined", "Cancelled", "Error"].includes(state ?? "") && attempts < 20) timeout = window.setTimeout(() => void refresh(), 3000);
      } catch { attempts += 1; if (active && stripe && attempts < 20) timeout = window.setTimeout(() => void refresh(), 3000); }
    };
    const start = window.setTimeout(() => void refresh(), 0);
    return () => { active = false; window.clearTimeout(start); window.clearTimeout(timeout); };
  }, [displayId, stripe]);

  const stripeState = order?.payments.find((payment) => payment.method === "stripe")?.state;
  const failed = stripe && ["Declined", "Cancelled", "Error"].includes(stripeState ?? "");
  const settled = stripe && (stripeState === "Settled" || (!order && paymentStatus === "settled"));
  const processing = stripe && !failed && !settled;
  const Icon = failed ? AlertCircle : processing ? Clock3 : CheckCircle2;
  const amount = order?.totalWithTax ?? total;
  const currencyCode = order?.currencyCode || currency || "INR";

  return <main className="grid min-h-[70vh] place-items-center px-5 py-16 [font-family:var(--font-plus-jakarta-sans)]"><section className="w-full max-w-lg rounded-3xl border border-[#dce8df] bg-white p-8 text-center shadow-[0_16px_45px_rgba(42,82,55,0.08)] sm:p-10"><Icon className={`mx-auto size-16 ${failed ? "text-red-600" : processing ? "text-amber-600" : "text-[#5eb345]"}`} aria-hidden="true" /><h1 className="mt-5 font-serif text-3xl font-semibold text-[#26342d]">{failed ? "Payment not completed" : processing ? "Payment processing" : "Order placed successfully"}</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#66756c]">{failed ? "Stripe did not complete this payment. Your order has not been confirmed." : processing ? "We’re waiting for Stripe to confirm your payment. This page updates automatically." : stripe ? "Your Stripe payment and order have been confirmed." : "Your Cash on Delivery order has been confirmed."}</p>{displayId ? <div className="mt-6 rounded-xl bg-[#edf5ef] p-5 text-sm"><p><span className="font-semibold text-[#315f48]">Order #</span> {displayId}</p>{amount ? <p className="mt-3 border-t border-[#d3e0d6] pt-3 text-lg font-semibold text-[#26342d]">Total: {formatCartMoney(amount, currencyCode)}</p> : null}</div> : null}<div className="mt-7 flex flex-col gap-3"><Link href="/account/orders" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white hover:bg-[#244f3b]">View My Orders</Link><Link href="/product-listing" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#315f48] px-5 text-sm font-semibold text-[#315f48] hover:bg-[#edf5ef]">Continue Shopping</Link></div></section></main>;
}
