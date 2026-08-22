"use client";

import {
  CardElement,
  Elements,
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
    fontFamily: '"Playfair Display", Georgia, serif',
  },
};

const cardElementOptions = {
  disableLink: true,
  hidePostalCode: true,
  style: {
    base: {
      color: "#1f2937",
      fontFamily: '"Playfair Display", Georgia, serif',
      fontSize: "16px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: {
      color: "#dc2626",
      iconColor: "#dc2626",
    },
  },
};

function StripeCheckoutForm({
  onSuccess,
  onError,
  totalAmount,
  currencySymbol,
  clientSecret,
  orderCode,
  customerEmail,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || processing) return;

    const card = elements.getElement(CardElement);
    if (!card || !cardComplete) {
      setCardError("Enter complete and valid card details.");
      return;
    }

    setProcessing(true);
    setCardError("");
    onError?.(null);

    sessionStorage.setItem("stripe_order_code", orderCode);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card,
          billing_details: customerEmail ? { email: customerEmail } : undefined,
        },
      },
    );

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

    onError?.("The card payment was not completed. Please check the card details and try again.");
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-[#E6F4F2] bg-white p-5">
        <label className="mb-3 block text-sm font-semibold text-gray-800">
          Card details
        </label>
        <div className={`rounded-xl border bg-white px-4 py-4 transition ${
          cardError ? "border-red-400" : "border-gray-300 focus-within:border-[#1EA766]"
        }`}>
          <CardElement
            options={cardElementOptions}
            onChange={(event) => {
              setCardComplete(event.complete);
              setCardError(event.error?.message || "");
            }}
          />
        </div>
        {cardError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {cardError}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || !cardComplete || processing}
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
        clientSecret={clientSecret}
        orderCode={orderCode}
        customerEmail={customerEmail}
      />
    </Elements>
  );
}
