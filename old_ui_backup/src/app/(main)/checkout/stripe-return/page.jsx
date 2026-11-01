"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { stripePromise, stripePublishableKey } from "@/lib/stripe";
import { waitForStripeOrderApi } from "@/service/CartService";
import useCartStore from "@/store/useCartStore";
import useOrdersStore from "@/store/useOrdersStore";
import useAuthStore from "@/store/AuthStore";

function StripeReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetCart = useCartStore((state) => state.resetCart);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [error, setError] = useState("");

  const clientSecret = searchParams.get("payment_intent_client_secret");
  const queryOrderCode = searchParams.get("order_code");

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const orderCode =
        queryOrderCode || sessionStorage.getItem("stripe_order_code");

      if (!stripePublishableKey || !stripePromise) {
        setError("Stripe is not configured in this storefront.");
        return;
      }
      if (!clientSecret || !orderCode) {
        setError("Stripe returned without the payment or order reference.");
        return;
      }

      try {
        const stripe = await stripePromise;
        const { paymentIntent, error: stripeError } =
          await stripe.retrievePaymentIntent(clientSecret);

        if (stripeError) throw stripeError;
        if (!paymentIntent) throw new Error("Stripe payment could not be found.");

        if (
          !["succeeded", "processing", "requires_capture"].includes(
            paymentIntent.status,
          )
        ) {
          throw new Error(
            paymentIntent.status === "requires_payment_method"
              ? "The payment was not successful. Please return to checkout and try again."
              : `The payment is currently ${paymentIntent.status.replaceAll("_", " ")}.`,
          );
        }

        const result = await waitForStripeOrderApi(orderCode);
        if (cancelled) return;

        try {
          if (useAuthStore.getState().isAuthenticated) {
            await useOrdersStore.getState().fetchOrders();
          }
        } catch (refreshError) {
          console.warn("Could not refresh My Orders after Stripe payment", refreshError);
        }

        resetCart();
        sessionStorage.removeItem("stripe_order_code");

        const order = result.order;
        const params = new URLSearchParams({
          payment_method: "stripe",
          payment_status: result.settled ? "settled" : "processing",
          display_id: order?.code || orderCode,
        });
        if (order?.id) params.set("order_id", order.id);
        if (order?.pricing?.total != null)
          params.set("total", String(order.pricing.total));
        if (order?.currency_code)
          params.set("currency", order.currency_code);

        router.replace(`/checkout/success?${params.toString()}`);
      } catch (verificationError) {
        if (!cancelled) {
          setError(
            verificationError?.message ||
              "We could not verify the Stripe payment. Contact support with your order reference before retrying.",
          );
        }
      }
    };

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [clientSecret, queryOrderCode, resetCart, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle size={56} className="mx-auto text-red-500" />
        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Payment needs attention
        </h1>
        <p className="mt-2 text-sm text-gray-600">{error}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="rounded-xl bg-[#1EA766] px-5 py-3 font-semibold text-white"
          >
            Return to checkout
          </button>
          <button
            type="button"
            onClick={() => router.push(isAuthenticated ? "/my-orders" : "/contact-us")}
            className="rounded-xl border border-[#1EA766] px-5 py-3 font-semibold text-[#1EA766]"
          >
            {isAuthenticated ? "Check My Orders" : "Contact Support"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#CDEAE0] border-t-[#1EA766]" />
      <h1 className="mt-5 text-xl font-semibold text-gray-900">
        Confirming your payment
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Please don&apos;t close this page while Stripe and the store confirm your order.
      </p>
    </div>
  );
}

export default function StripeReturnPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Suspense fallback={<p className="text-gray-600">Confirming payment...</p>}>
        <StripeReturnContent />
      </Suspense>
    </div>
  );
}
