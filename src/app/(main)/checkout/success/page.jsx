"use client";

import { Button } from "primereact/button";
import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayId = searchParams.get("display_id");
  const orderId = searchParams.get("order_id");
  const total = searchParams.get("total");
  const currency = searchParams.get("currency");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full rounded-3xl border border-[#E6F4F2] p-8 text-center">
        <CheckCircle size={64} className="mx-auto text-[#1EA766]" />

        <h1 className="text-2xl font-semibold mt-4 text-gray-900">
          Order Placed Successfully
        </h1>

        <p className="text-gray-600 mt-2">
          Your Cash on Delivery order has been confirmed. Please keep the order
          amount ready when it is delivered.
        </p>

        {(displayId || orderId) && (
          <div className="mt-4 rounded-xl bg-[#F1F8F7] px-4 py-3 text-sm text-gray-700">
            {displayId != null && (
              <p>
                <span className="font-medium text-[#2C665E]">Order #</span>{" "}
                {displayId}
              </p>
            )}
            {orderId && displayId == null && (
              <p className="break-all text-xs text-gray-500">Ref: {orderId}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            label="View My Orders"
            className="w-full bg-[#1EA766] border-[#1EA766] text-white"
            onClick={() => router.push("/my-orders")}
          />
          <Button
            label="Continue Shopping"
            className="w-full border border-[#1EA766] text-[#1EA766]"
            outlined
            onClick={() => router.push("/")}
          />
        </div>
      </div>
    </div>
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
