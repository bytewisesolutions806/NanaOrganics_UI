"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Box, Check, ChevronRight, PackageCheck, Truck, X } from "lucide-react";

import { type CustomerOrder, formatMoney } from "@/services/api/account";

const statusCopy: Record<CustomerOrder["status"], { label: string; message: string; color: string; dot: string }> = {
  payment_pending: { label: "Payment pending", message: "Complete payment to confirm your order", color: "text-amber-700", dot: "bg-amber-500" },
  payment_failed: { label: "Payment not completed", message: "This order has not been confirmed", color: "text-red-600", dot: "bg-red-500" },
  confirmed: { label: "Order confirmed", message: "Your order is being prepared", color: "text-[#2c665e]", dot: "bg-[#2c665e]" },
  on_the_way: { label: "On the way", message: "Your item is on the way", color: "text-blue-700", dot: "bg-blue-600" },
  delivered: { label: "Delivered", message: "Your item has been delivered", color: "text-emerald-700", dot: "bg-emerald-600" },
  cancelled: { label: "Cancelled", message: "Your item has been cancelled", color: "text-red-600", dot: "bg-red-500" },
};

function formatDate(value: string, includeTime = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    ...(includeTime ? { year: "numeric", hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

export function OrderProgress({ order }: { order: CustomerOrder }) {
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const status = statusCopy[order.status];
  const isPlaced = Boolean(order.orderPlacedAt);
  const isShipped = ["on_the_way", "delivered"].includes(order.status);
  const isDelivered = order.status === "delivered";
  const shippedUpdate = order.updates.find((update) => /ship/i.test(update.label));
  const deliveredUpdate = order.updates.find((update) => /deliver/i.test(update.label));
  const firstLine = order.lines[0];
  const variant = firstLine?.variantName && firstLine.variantName.toLowerCase() !== "default"
    ? ` — ${firstLine.variantName}`
    : "";
  const additionalItems = order.lines.length > 1 ? ` (+${order.lines.length - 1} more)` : "";

  useEffect(() => {
    if (!updatesOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUpdatesOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [updatesOpen]);

  const steps = [
    { label: "Order Placed", date: order.orderPlacedAt, completed: isPlaced, Icon: Box },
    { label: "Shipped", date: shippedUpdate?.date, completed: isShipped, Icon: Truck },
    { label: "Delivered", date: deliveredUpdate?.date, completed: isDelivered, Icon: PackageCheck },
  ];

  return (
    <>
      <section className="rounded-2xl border border-[#cfe3df] bg-white p-5 sm:p-6" aria-label="Order progress">
        <div className="flex items-center gap-4">
          <div className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f2f8f6] sm:size-[90px]">
            {firstLine?.imageUrl
              ? <Image src={firstLine.imageUrl} alt="" width={90} height={90} unoptimized className="size-full object-contain p-2" />
              : <Box size={28} className="text-[#80aaa2]" />}
          </div>
          <div className="min-w-0">
            <h2 className="line-clamp-2 font-semibold text-[#17211f]">
              {firstLine?.productName || `Order #${order.code}`}{variant} — {firstLine?.quantity || order.totalQuantity} qty{additionalItems}
            </h2>
            <p className="mt-1 text-sm text-[#73807a]">Total</p>
            <p className="font-bold text-[#17211f]">{formatMoney(order.totalWithTax, order.currencyCode)}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-[#17211f] pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`flex items-center gap-2 text-sm font-medium ${status.color}`}>
                <span className={`size-2 rounded-full ${status.dot}`} />
                {status.label}
              </p>
              <p className="mt-1 text-xs text-[#68716f]">{status.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setUpdatesOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#2c665e] hover:underline"
              aria-haspopup="dialog"
            >
              See All Updates <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-5 border-t border-[#e3ecea] pt-6">
          <ol className="grid grid-cols-3">
            {steps.map(({ label, date, completed, Icon }, index) => (
              <li key={label} className="relative flex min-w-0 flex-col items-center px-1 text-center">
                {index < steps.length - 1 ? (
                  <span
                    className={`absolute left-1/2 top-6 h-0.5 w-full ${steps[index + 1].completed ? "bg-[#2c665e]" : "bg-[#d9e5e2]"}`}
                    aria-hidden="true"
                  />
                ) : null}
                <span className={`relative z-10 grid size-12 place-items-center rounded-full border-2 ${completed ? "border-[#2c665e] bg-[#2c665e] text-white" : "border-[#b8cbc6] bg-white text-[#91a7a1]"}`}>
                  <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <strong className={`mt-3 text-xs sm:text-sm ${completed ? "text-[#17211f]" : "text-[#71817d]"}`}>{label}</strong>
                {date && formatDate(date) ? <time className="mt-1 text-[11px] leading-4 text-[#68716f] sm:text-xs">{formatDate(date)}</time> : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {updatesOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" role="presentation">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setUpdatesOpen(false)} aria-label="Close order updates" />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-updates-title"
            className="relative z-10 flex max-h-[min(80vh,680px)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <header className="flex items-center justify-between border-b border-[#e3ecea] p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#e4f3ee] text-[#2c665e]"><Truck size={18} /></span>
                <div>
                  <h2 id="order-updates-title" className="font-semibold text-[#17211f]">Order updates</h2>
                  <p className="text-xs text-[#7b8681]">Order #{order.code}</p>
                </div>
              </div>
              <button type="button" onClick={() => setUpdatesOpen(false)} className="grid size-9 place-items-center rounded-full text-[#68716f] hover:bg-[#f1f7f4]" aria-label="Close order updates">
                <X size={18} />
              </button>
            </header>
            {order.trackingCode ? (
              <p className="border-b border-[#e3ecea] bg-[#f1f7f4] px-5 py-3 text-xs text-[#52605a]">
                Tracking: <strong>{order.trackingCode}</strong>
              </p>
            ) : null}
            <ol className="space-y-5 overflow-y-auto bg-[#f7faf9] p-5">
              {(order.updates.length ? order.updates : [{ id: "placed", label: "Order placed", date: order.orderPlacedAt }]).map((update, index, list) => (
                <li key={update.id} className="flex gap-3">
                  <span className="flex shrink-0 flex-col items-center">
                    <span className="grid size-7 place-items-center rounded-full bg-[#e4f3ee] text-[#2c665e]">
                      {index === 0 ? <Box size={15} /> : <Check size={15} />}
                    </span>
                    {index < list.length - 1 ? <span className="mt-1 min-h-5 w-px flex-1 bg-[#cfe3df]" aria-hidden="true" /> : null}
                  </span>
                  <span className="pb-1">
                    <span className="block text-sm font-semibold text-[#17211f]">{update.label}</span>
                    <time className="mt-1 block text-xs text-[#7b8681]">{formatDate(update.date, true)}</time>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </>
  );
}
