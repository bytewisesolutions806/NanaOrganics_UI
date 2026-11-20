"use client";

import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import { LockKeyhole } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

import { stripePromise, stripePublishableKey } from "@/lib/stripe";

type PaymentProps = {
  clientSecret: string;
  orderCode: string;
  customerEmail: string;
  total: string;
  onSuccess: () => Promise<void>;
  onError: (message: string) => void;
  onProcessingChange: (processing: boolean) => void;
};

function PaymentForm({ orderCode, customerEmail, total, onSuccess, onError, onProcessingChange }: PaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const processingRef = useRef(false);
  const walletOpenRef = useRef(false);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [walletsAvailable, setWalletsAvailable] = useState(false);

  async function confirmPayment(walletEvent?: StripeExpressCheckoutElementConfirmEvent) {
    if (!stripe || !elements || processingRef.current || (walletOpenRef.current && !walletEvent)) {
      walletEvent?.paymentFailed({ message: "Payment is not ready. Please try again." });
      if (walletEvent && walletOpenRef.current && !processingRef.current) {
        walletOpenRef.current = false;
        setProcessing(false);
        onProcessingChange(false);
      }
      return;
    }

    walletOpenRef.current = false;
    processingRef.current = true;
    setProcessing(true);
    onProcessingChange(true);
    onError("");

    const fail = (message: string) => {
      walletEvent?.paymentFailed({ message });
      onError(message);
      processingRef.current = false;
      setProcessing(false);
      onProcessingChange(false);
    };

    let confirmationStarted = false;
    try {
      sessionStorage.setItem("stripe_order_code", orderCode);
      const { error: submitError } = await elements.submit();
      if (submitError) {
        fail(submitError.message || "Please check your payment details and try again.");
        return;
      }

      confirmationStarted = true;
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/stripe-return?order_code=${encodeURIComponent(orderCode)}`,
          payment_method_data: { billing_details: { email: customerEmail || undefined } },
        },
        redirect: "if_required",
      });
      if (error) {
        fail(error.message || "Stripe could not process the payment.");
        return;
      }
      if (paymentIntent && ["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) {
        await onSuccess();
        return;
      }
      fail("The payment was not completed. Please check your payment details and try again.");
    } catch (reason) {
      if (confirmationStarted) {
        const message = "Payment confirmation could not be verified. Please do not retry; contact support to check your order.";
        walletEvent?.paymentFailed({ message });
        onError(message);
      } else {
        fail(reason instanceof Error ? reason.message : "Stripe could not confirm the payment. Please check your order before retrying.");
      }
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void confirmPayment();
  }

  return (
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-[#d8e5da] bg-white p-5 sm:p-6">
      <div className={walletsAvailable ? "mb-5" : ""}>
        <ExpressCheckoutElement
          onReady={(event) => setWalletsAvailable(Boolean(event.availablePaymentMethods && Object.values(event.availablePaymentMethods).some(Boolean)))}
          onClick={(event) => {
            if (processingRef.current || walletOpenRef.current) { event.reject(); return; }
            walletOpenRef.current = true;
            setProcessing(true);
            onProcessingChange(true);
            event.resolve();
          }}
          onCancel={() => {
            if (walletOpenRef.current && !processingRef.current) {
              walletOpenRef.current = false;
              setProcessing(false);
              onProcessingChange(false);
            }
          }}
          onConfirm={(event) => void confirmPayment(event)}
          onLoadError={(event) => onError(event.error.message || "Express checkout could not be loaded. Please use another payment method.")}
        />
        {walletsAvailable ? <p className="mt-4 text-center text-xs text-[#718078]">Or pay using the options below</p> : null}
      </div>
      <PaymentElement
        options={{ defaultValues: { billingDetails: { email: customerEmail } } }}
        onChange={(event) => setComplete(event.complete)}
        onLoadError={(event) => onError(event.error.message || "The secure payment form could not be loaded. Please reload and try again.")}
      />
      <button type="submit" disabled={!stripe || !elements || !complete || processing} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white hover:bg-[#244f3b] disabled:cursor-wait disabled:bg-[#9eaca3]">{processing ? "Confirming secure payment…" : `Pay ${total}`}</button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#6c7971]"><LockKeyhole className="size-3.5" aria-hidden="true" />Payment details are encrypted and handled securely by Stripe.</p>
    </form>
  );
}

export function StripePayment(props: PaymentProps) {
  if (!stripePublishableKey || !stripePromise) return <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Stripe is not configured in this storefront. Set <code className="font-semibold">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.</p>;
  return <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#2d6048", borderRadius: "8px", fontFamily: "Arial, sans-serif" } } }} key={props.clientSecret}><PaymentForm {...props} /></Elements>;
}
