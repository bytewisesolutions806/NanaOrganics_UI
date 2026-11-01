"use client";

import { AlertCircle, CheckCircle, Clock3 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useAuthStore from "@/store/AuthStore";
import { fetchOrderByCodeApi } from "@/service/CartService";

function formatMoney(amount, currencyCode) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currencyCode || "USD").toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${String(currencyCode || "USD").toUpperCase()} ${Number(amount || 0).toFixed(2)}`;
  }
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const displayId = searchParams.get("display_id");
  const orderId = searchParams.get("order_id");
  const total = searchParams.get("total");
  const currency = searchParams.get("currency");
  const paymentMethod = searchParams.get("payment_method");
  const paymentStatus = searchParams.get("payment_status");
  const isStripe = paymentMethod === "stripe";
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!displayId) return undefined;
    let timeoutId;
    let attempts = 0;

    const refreshOrder = async () => {
      try {
        const result = await fetchOrderByCodeApi(displayId);
        if (cancelled) return;
        setOrder(result);
        const stripePayment = result?.payments?.find((payment) => payment.method === "stripe");
        const terminal = ["Settled", "Declined", "Cancelled", "Error"].includes(
          stripePayment?.state,
        );
        attempts += 1;
        if (isStripe && !terminal && attempts < 20) {
          timeoutId = window.setTimeout(refreshOrder, 3000);
        }
      } catch {
        attempts += 1;
        if (!cancelled && isStripe && attempts < 20) {
          timeoutId = window.setTimeout(refreshOrder, 3000);
        }
        // The query-string total remains available if the order refresh is delayed.
      }
    };

    refreshOrder();
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [displayId, isStripe]);

  const stripePayment = order?.payments?.find((payment) => payment.method === "stripe");
  const stripeState = stripePayment?.state;
  const isPaymentFailed = isStripe && ["Declined", "Cancelled", "Error"].includes(stripeState);
  const isSettled = isStripe && (
    stripeState === "Settled" || (!order && paymentStatus === "settled")
  );
  const isProcessing = isStripe && !isSettled && !isPaymentFailed;
  const StatusIcon = isPaymentFailed ? AlertCircle : isProcessing ? Clock3 : CheckCircle;

  const pricing = order?.pricing;
  const currencyCode = order?.currency_code || currency || "USD";
  const subtotal = pricing?.subtotal_before_discounts;
  const shipping = pricing?.shipping_excluding_tax;
  const tax = pricing?.tax;
  const discount = pricing?.discount_total_excluding_tax;
  const orderTotal = pricing?.total ?? (total != null ? Number(total) : null);

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:py-16">
      <section className="w-full max-w-[500px] rounded-3xl border border-[#DDEEEB] bg-white px-6 py-9 text-center sm:px-10 sm:py-11">
        <StatusIcon
          aria-hidden="true"
          className={`mx-auto h-16 w-16 ${
            isPaymentFailed ? "text-red-600" : isProcessing ? "text-amber-600" : "text-[#1EA766]"
          }`}
          strokeWidth={2}
        />

        <h1 className="mt-5 text-2xl font-semibold leading-tight text-gray-900">
          {isPaymentFailed
            ? "Payment Not Completed"
            : isProcessing
              ? "Payment Processing"
              : "Order Placed Successfully"}
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-base leading-6 text-gray-600">
          {isStripe
            ? isPaymentFailed
              ? "Stripe did not complete this payment. Your order has not been confirmed."
              : isProcessing
                ? "We are waiting for Stripe to complete the payment. Your order is not confirmed yet; this page will update automatically."
                : "Your Stripe payment and order have been confirmed successfully."
            : "Your Cash on Delivery order has been confirmed. Please keep the order amount ready when it is delivered."}
        </p>

        {(displayId || orderId || orderTotal != null) && (
          <div className="mt-5 rounded-xl bg-[#F1F8F7] px-5 py-4 text-sm leading-6 text-gray-700">
            {displayId != null && (
              <p className="text-center">
                <span className="font-medium text-[#2C665E]">Order #</span>{" "}
                {displayId}
              </p>
            )}
            {orderId && displayId == null && (
              <p className="break-all text-xs text-gray-500">Ref: {orderId}</p>
            )}
            {orderTotal != null && (
              <div className="mt-3 space-y-1 border-t border-[#D4E5E2] pt-3 text-left">
                {subtotal != null && (
                  <p className="flex justify-between gap-4">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal, currencyCode)}</span>
                  </p>
                )}
                {discount > 0 && (
                  <p className="flex justify-between gap-4 text-green-700">
                    <span>Discount</span>
                    <span>- {formatMoney(discount, currencyCode)}</span>
                  </p>
                )}
                {shipping != null && (
                  <p className="flex justify-between gap-4">
                    <span>Shipping</span>
                    <span>{formatMoney(shipping, currencyCode)}</span>
                  </p>
                )}
                {tax != null && (
                  <p className="flex justify-between gap-4">
                    <span>Tax</span>
                    <span>{formatMoney(tax, currencyCode)}</span>
                  </p>
                )}
                <p className="flex justify-between gap-4 border-t border-[#D4E5E2] pt-2 font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatMoney(orderTotal, currencyCode)}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {isAuthenticated && <Link
            href="/my-orders"
            className="flex h-12 w-full items-center justify-center rounded-lg border border-[#1EA766] bg-[#1EA766] px-5 text-base font-semibold leading-none text-white transition-colors hover:border-[#188A55] hover:bg-[#188A55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1EA766] focus-visible:ring-offset-2"
          >
            View My Orders
          </Link>}
          {!isAuthenticated && (
            <p className="text-sm text-gray-600">
              Keep your order reference for any questions about your guest order.
            </p>
          )}
          <Link
            href="/"
            className="flex h-12 w-full items-center justify-center rounded-lg border border-[#1EA766] bg-white px-5 text-base font-semibold leading-none text-[#1EA766] transition-colors hover:bg-[#F1F8F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1EA766] focus-visible:ring-offset-2"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-gray-600">
          Loading…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
