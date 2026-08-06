"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { stripePromise, stripePublishableKey } from "@/lib/stripe";

const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#1EA766",
    colorText: "#1f2937",
    colorDanger: "#dc2626",
    borderRadius: "12px",
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  },
};

function StripeCheckoutForm({
  onSuccess,
  onError,
  totalAmount,
  currencySymbol,
  orderCode,
  customerEmail,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || processing) return;

    setProcessing(true);
    onError?.(null);

    const returnUrl = new URL("/checkout/stripe-return", window.location.origin);
    returnUrl.searchParams.set("order_code", orderCode);
    sessionStorage.setItem("stripe_order_code", orderCode);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl.toString(),
        payment_method_data: customerEmail
          ? { billing_details: { email: customerEmail } }
          : undefined,
      },
      redirect: "if_required",
    });

    if (error) {
      onError?.(error.message || "Stripe could not process the payment.");
      setProcessing(false);
      return;
    }

    if (
      paymentIntent &&
      ["succeeded", "processing", "requires_capture"].includes(
        paymentIntent.status,
      )
    ) {
      await onSuccess?.(paymentIntent);
      return;
    }

    onError?.("The payment was not completed. Please try another payment method.");
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-[#E6F4F2] bg-white p-5">
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: customerEmail
              ? { billingDetails: { email: customerEmail } }
              : undefined,
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="w-full rounded-xl bg-[#1EA766] py-4 font-semibold text-white transition hover:bg-[#178a54] disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {processing
          ? "Processing secure payment..."
          : `Pay ${currencySymbol}${totalAmount} & Place Order`}
      </button>
      <p className="text-center text-xs text-gray-500">
        Your payment details are encrypted and handled securely by Stripe.
      </p>
    </form>
  );
}

export default function StripePayment({
  clientSecret,
  orderCode,
  onSuccess,
  onError,
  totalAmount,
  currencySymbol = "$",
  customerEmail = "",
}) {
  if (!stripePublishableKey || !stripePromise) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Stripe is not configured in this storefront. Set
        {" "}
        <code className="font-semibold">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
        {" "}
        and restart the UI.
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance }}
      key={clientSecret}
    >
      <StripeCheckoutForm
        onSuccess={onSuccess}
        onError={onError}
        totalAmount={totalAmount}
        currencySymbol={currencySymbol}
        orderCode={orderCode}
        customerEmail={customerEmail}
      />
    </Elements>
  );
}
