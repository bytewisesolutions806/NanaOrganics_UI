"use client";

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";

import { stripePromise, stripePublishableKey } from "@/lib/stripe";

function PaymentForm({ orderCode, customerEmail, clientSecret, total, onSuccess, onError }: { orderCode: string; customerEmail: string; clientSecret: string; total: string; onSuccess: () => Promise<void>; onError: (message: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements || processing) return;
    setProcessing(true);
    onError("");
    sessionStorage.setItem("stripe_order_code", orderCode);
    const card = elements.getElement(CardElement);
    if (!card) { onError("The secure card field is not ready. Please reload and try again."); setProcessing(false); return; }
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card, billing_details: { email: customerEmail || undefined } },
      return_url: `${window.location.origin}/checkout/stripe-return?order_code=${encodeURIComponent(orderCode)}`,
    });
    if (error) {
      onError(error.message || "Stripe could not process the payment.");
      setProcessing(false);
      return;
    }
    if (paymentIntent && ["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) {
      await onSuccess();
      return;
    }
    onError("The payment was not completed. Please check your card details and try again.");
    setProcessing(false);
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-5 rounded-2xl border border-[#d8e5da] bg-white p-5 sm:p-6">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#526159]">Card details</label>
      <div className="rounded-lg border border-[#cad8cd] px-4 py-4 focus-within:border-[#68bd45] focus-within:ring-2 focus-within:ring-[#68bd45]/25">
        <CardElement onChange={(event) => { setComplete(event.complete); if (event.error) onError(event.error.message); }} options={{ hidePostalCode: true, style: { base: { color: "#34483c", fontFamily: "Arial, sans-serif", fontSize: "16px", "::placeholder": { color: "#95a199" } }, invalid: { color: "#b42318" } } }} />
      </div>
      <button type="submit" disabled={!stripe || !elements || !complete || processing} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white hover:bg-[#244f3b] disabled:cursor-wait disabled:bg-[#9eaca3]">{processing ? "Confirming secure payment…" : `Pay ${total}`}</button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#6c7971]"><LockKeyhole className="size-3.5" aria-hidden="true" />Payment details are encrypted and handled securely by Stripe.</p>
    </form>
  );
}

export function StripePayment(props: { clientSecret: string; orderCode: string; customerEmail: string; total: string; onSuccess: () => Promise<void>; onError: (message: string) => void }) {
  if (!stripePublishableKey || !stripePromise) return <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Stripe is not configured in this storefront. Set <code className="font-semibold">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.</p>;
  return <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#2d6048", borderRadius: "8px", fontFamily: "Arial, sans-serif" } } }} key={props.clientSecret}><PaymentForm {...props} /></Elements>;
}
