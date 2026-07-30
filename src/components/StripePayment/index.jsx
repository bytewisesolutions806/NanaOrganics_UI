"use client";

import { useState } from "react";

export default function StripePayment({
  onSuccess,
  onError,
  totalAmount,
  currencySymbol = "$",
}) {
  const [processing, setProcessing] = useState(false);
  const [cardholder, setCardholder] = useState("Demo Customer");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cardholder.trim() || !cardNumber.trim()) {
      onError?.("Complete the demo payment fields.");
      return;
    }
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSuccess?.({ id: `mock_payment_${Date.now()}`, status: "succeeded" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-[#E6F4F2] rounded-xl p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">Demo payment details</p>
        <label className="block text-sm text-gray-600">
          Cardholder name
          <input
            value={cardholder}
            onChange={(event) => setCardholder(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#C6D8D7] px-4 py-3"
          />
        </label>
        <label className="block text-sm text-gray-600">
          Card number
          <input
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#C6D8D7] px-4 py-3"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input value="12/30" readOnly className="rounded-xl border border-[#C6D8D7] px-4 py-3" />
          <input value="123" readOnly className="rounded-xl border border-[#C6D8D7] px-4 py-3" />
        </div>
      </div>
      <button
        type="submit"
        disabled={processing}
        className="w-full rounded-xl bg-[#1EA766] py-4 font-semibold text-white disabled:bg-gray-400"
      >
        {processing
          ? "Placing demo order..."
          : `Pay ${currencySymbol}${totalAmount} & Place Order`}
      </button>
      <p className="text-center text-xs text-gray-400">
        Demo checkout only. No payment information is transmitted.
      </p>
    </form>
  );
}
