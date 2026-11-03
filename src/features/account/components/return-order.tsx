"use client";

/* eslint-disable @next/next/no-img-element -- Vendure assets use environment-specific hosts. */

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Box, CheckCircle2 } from "lucide-react";

import { EmptyState, LoadingCards } from "./account-ui";
import {
  type CustomerOrder,
  getCustomerOrder,
  getOrderLineReturnDeadline,
  isOrderLineReturnEligible,
  requestOrderReturn,
} from "@/services/api/account";

export function ReturnOrder() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    getCustomerOrder(params.orderId)
      .then((value) => {
        if (!active) return;
        setOrder(value);
        if (value) {
          setQuantities(Object.fromEntries(value.lines.map((line) => [line.id, 1])));
        }
      })
      .catch((caught: unknown) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load the order.";
        if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login");
        else setError(message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.orderId, router]);

  const eligibleLines = useMemo(
    () => order?.lines.filter((line) => isOrderLineReturnEligible(order, line)) ?? [],
    [order],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    const items = eligibleLines
      .filter((line) => selected[line.id])
      .map((line) => ({
        orderLineId: line.id,
        quantity: Math.min(line.quantity, Math.max(1, quantities[line.id] ?? 1)),
      }));
    if (!items.length) { setError("Select at least one product to return."); return; }
    if (!reason.trim()) { setError("Choose a reason for the return."); return; }
    setSubmitting(true);
    setError("");
    try {
      await requestOrderReturn({ orderId: order.id, items, reason, note: note.trim() || undefined });
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit the return request.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingCards count={2} />;
  if (!order) return <EmptyState title="Order not found" message={error || "This order could not be found."} />;
  if (submitted) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"><CheckCircle2 className="mx-auto size-10 text-emerald-700" /><h1 className="mt-3 text-2xl font-semibold text-emerald-950">Return request submitted</h1><p className="mt-2 text-sm text-emerald-800">We’ll review your request and update you on its status.</p><Link href={`/account/orders/${order.id}`} className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#2c665e] px-5 text-sm font-semibold text-white">Back to order</Link></div>;
  if (order.returnRequest) return <EmptyState title="Return already requested" message="A return request has already been submitted for this order. Check My Orders for its current status." />;
  if (!eligibleLines.length) return <EmptyState title="Return unavailable" message="This order has no products that are currently within their return window." />;

  return (
    <section>
      <Link href={`/account/orders/${order.id}`} className="text-sm font-semibold text-[#2c665e] hover:underline">← Back to Order #{order.code}</Link>
      <div className="mt-4 rounded-2xl border border-[#cfe3df] bg-white p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2c665e]">My account</p>
        <h1 className="mt-1 text-3xl font-semibold">Return order</h1>
        <p className="mt-2 text-sm text-[#66736e]">Select the eligible products you want to return.</p>
        {error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mt-6 space-y-6">
          <div className="divide-y divide-[#e4ece9] rounded-xl border border-[#d9e7e3]">
            {eligibleLines.map((line) => {
              const deadline = getOrderLineReturnDeadline(order, line);
              return <label key={line.id} className="flex cursor-pointer gap-4 p-4">
                <input type="checkbox" checked={Boolean(selected[line.id])} onChange={(event) => setSelected((current) => ({ ...current, [line.id]: event.target.checked }))} className="mt-7 size-4 accent-[#2c665e]" />
                <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f2f8f6]">{line.imageUrl ? <img src={line.imageUrl} alt="" className="size-full object-contain p-2" /> : <Box size={26} className="text-[#80aaa2]" />}</div>
                <div className="min-w-0 flex-1"><h2 className="font-semibold text-[#26332e]">{line.productName}</h2><p className="mt-1 text-sm text-[#73807a]">{line.variantName}</p><p className="mt-1 text-xs text-[#2c665e]">{line.returnWindowDays}-day return window · eligible through {deadline?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                {line.quantity > 1 ? <select aria-label={`Return quantity for ${line.productName}`} value={quantities[line.id] ?? 1} onChange={(event) => setQuantities((current) => ({ ...current, [line.id]: Number(event.target.value) }))} disabled={!selected[line.id]} className="h-10 rounded-lg border border-[#cfe3df] bg-white px-2 text-sm disabled:opacity-50">{Array.from({ length: line.quantity }, (_, index) => <option key={index + 1} value={index + 1}>Qty {index + 1}</option>)}</select> : null}
              </label>;
            })}
          </div>
          <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">Reason *<select value={reason} onChange={(event) => setReason(event.target.value)} className="h-11 rounded-lg border border-[#cfe3df] bg-white px-3 text-sm"><option value="">Select a reason</option><option>Damaged or defective</option><option>Wrong item received</option><option>Product not as described</option><option>Quality issue</option><option>Other</option></select></label>
          <label className="grid gap-1.5 text-xs font-medium text-[#66736e]">Additional details (optional)<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={2000} rows={5} placeholder="Tell us more about the issue" className="rounded-lg border border-[#cfe3df] p-3 text-sm outline-none focus:border-[#2c665e]" /></label>
          <div className="flex justify-end gap-3"><Link href={`/account/orders/${order.id}`} className="inline-flex min-h-11 items-center rounded-lg border px-5 text-sm font-semibold">Cancel</Link><button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-[#2c665e] px-6 text-sm font-semibold text-white disabled:opacity-50">{submitting ? "Submitting…" : "Submit return request"}</button></div>
        </form>
      </div>
    </section>
  );
}
