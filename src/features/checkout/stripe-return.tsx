"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { resetCartStore } from "@/features/cart/cart-store";
import { stripePromise, stripePublishableKey } from "@/lib/stripe";
import { waitForStripeOrder } from "@/services/api/checkout";

export function StripeReturn({ clientSecret, queryOrderCode }: { clientSecret: string; queryOrderCode: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      const orderCode = queryOrderCode || sessionStorage.getItem("stripe_order_code") || "";
      if (!stripePublishableKey || !stripePromise) { setError("Stripe is not configured in this storefront."); return; }
      if (!clientSecret || !orderCode) { setError("Stripe returned without the payment or order reference."); return; }
      try {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe could not be initialized.");
        const { paymentIntent, error: stripeError } = await stripe.retrievePaymentIntent(clientSecret);
        if (stripeError) throw stripeError;
        if (!paymentIntent || !["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) throw new Error(paymentIntent?.status === "requires_payment_method" ? "The payment was not successful. Return to checkout and try another card." : `The payment is currently ${paymentIntent?.status?.replaceAll("_", " ") || "unavailable"}.`);
        const result = await waitForStripeOrder(orderCode);
        if (!active) return;
        sessionStorage.removeItem("stripe_order_code"); resetCartStore();
        const order = result.order;
        const query = new URLSearchParams({ payment_method: "stripe", payment_status: result.settled ? "settled" : "processing", display_id: order?.code || orderCode, total: String(order?.totalWithTax ?? 0), currency: order?.currencyCode || "INR" });
        router.replace(`/checkout/success?${query}`);
      } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "We could not verify the Stripe payment. Contact support before retrying."); }
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [clientSecret, queryOrderCode, router]);

  if (error) return <main className="grid min-h-[65vh] place-items-center px-5 py-16"><section className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center"><AlertCircle className="mx-auto size-14 text-red-500" aria-hidden="true" /><h1 className="mt-4 font-serif text-3xl font-semibold text-[#26342d]">Payment needs attention</h1><p className="mt-3 text-sm leading-6 text-[#66756c]">{error}</p><button type="button" onClick={() => router.push("/checkout")} className="mt-6 min-h-12 w-full rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white">Return to checkout</button></section></main>;
  return <main className="grid min-h-[65vh] place-items-center px-5 py-16 text-center"><div><div className="mx-auto size-12 animate-spin rounded-full border-4 border-[#d9e8dd] border-t-[#2d6048]" /><h1 className="mt-5 font-serif text-3xl font-semibold text-[#26342d]">Confirming your payment</h1><p className="mt-2 text-sm text-[#66756c]">Please don’t close this page while Stripe and the store confirm your order.</p></div></main>;
}
