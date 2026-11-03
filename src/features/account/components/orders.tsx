"use client";

/* eslint-disable @next/next/no-img-element -- Vendure assets use environment-specific hosts. */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Box, ChevronRight, Download, MapPin, RefreshCw, RotateCcw, Star } from "lucide-react";

import { AccountHeading, EmptyState, LoadingCards, Pagination } from "./account-ui";
import { OrderProgress } from "./order-progress";
import { type CustomerOrder, type CustomerReturnStatus, formatMoney, getCustomerOrder, getCustomerOrders, isOrderLineReturnEligible } from "@/services/api/account";

const PAGE_SIZE = 8;
const statusLabels: Record<CustomerOrder["status"], string> = {
  payment_pending: "Payment pending", payment_failed: "Payment not completed",
  confirmed: "Order confirmed", on_the_way: "On the way", delivered: "Delivered", cancelled: "Cancelled",
};
const statusStyles: Record<CustomerOrder["status"], string> = {
  payment_pending: "bg-amber-50 text-amber-800", payment_failed: "bg-red-50 text-red-700",
  confirmed: "bg-teal-50 text-[#2c665e]", on_the_way: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-800", cancelled: "bg-red-50 text-red-700",
};
const returnStatusLabels: Record<CustomerReturnStatus, string> = {
  REQUESTED: "Return requested",
  APPROVED: "Return approved",
  REJECTED: "Return rejected",
  INSPECTION: "Return inspection",
  REFUND_CREATED: "Refund created",
  REFUND_COMPLETED: "Refund completed",
  CANCELLED: "Return cancelled",
};

function OrderStatusBadge({ order }: { order: CustomerOrder }) {
  if (order.returnRequest) {
    return <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">{returnStatusLabels[order.returnRequest.status]}</span>;
  }
  return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[order.status]}`}>{statusLabels[order.status]}</span>;
}

function ReturnOrderAction({ order }: { order: CustomerOrder }) {
  if (order.returnRequest) {
    return <button type="button" disabled className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg bg-[#d9e7e3] px-4 text-sm font-semibold text-[#65716c]" aria-label={returnStatusLabels[order.returnRequest.status]}><RotateCcw size={16} /> {returnStatusLabels[order.returnRequest.status]}</button>;
  }
  const canReturn = order.lines.some((line) => isOrderLineReturnEligible(order, line));
  return canReturn ? <Link href={`/account/orders/${order.id}/return`} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#2c665e] px-4 text-sm font-semibold text-white"><RotateCcw size={16} /> Return order</Link> : null;
}

export function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("all");
  const [periodReference, setPeriodReference] = useState({ timestamp: 0, year: 0 });
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setOrders(await getCustomerOrders()); }
    catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not load orders.";
      if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login"); else setError(message);
    } finally { setLoading(false); }
  }, [router]);
  useEffect(() => {
    let active = true;
    getCustomerOrders()
      .then((items) => { if (active) setOrders(items); })
      .catch((caught: unknown) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load orders.";
        if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login");
        else setError(message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      const age = periodReference.timestamp - new Date(order.createdAt).getTime();
      if (period === "week" && age > 7 * 86400000) return false;
      if (period === "month" && age > 30 * 86400000) return false;
      if (period === "year" && new Date(order.createdAt).getFullYear() !== periodReference.year) return false;
      return true;
    });
  }, [orders, period, periodReference, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateFilter = (setter: (value: string) => void) => (event: ChangeEvent<HTMLSelectElement>) => { setter(event.target.value); setPage(1); };
  const updatePeriod = (event: ChangeEvent<HTMLSelectElement>) => {
    const now = new Date();
    setPeriod(event.target.value);
    setPeriodReference({ timestamp: now.getTime(), year: now.getFullYear() });
    setPage(1);
  };

  return (
    <section>
      <AccountHeading title="My Orders" count={orders.length} action={<button type="button" onClick={load} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#8aaba4] px-4 text-sm font-semibold text-[#2c665e] disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>} />
      <div className="mb-5 flex flex-wrap gap-3 rounded-xl border border-[#d9e7e3] bg-white p-3">
        <label className="flex items-center gap-2 text-sm text-[#53605b]">Status<select value={status} onChange={updateFilter(setStatus)} className="h-10 rounded-lg border border-[#cfe3df] bg-white px-3 text-[#26332e]"><option value="all">All orders</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="flex items-center gap-2 text-sm text-[#53605b]">Placed<select value={period} onChange={updatePeriod} className="h-10 rounded-lg border border-[#cfe3df] bg-white px-3 text-[#26332e]"><option value="all">Any time</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="year">This year</option></select></label>
      </div>
      {error ? <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <LoadingCards count={4} /> : visible.length === 0 ? <EmptyState title={orders.length ? "No matching orders" : "No orders yet"} message={orders.length ? "Try changing the selected filters." : "Your orders will appear here after checkout."} /> : (
        <div className="space-y-4">
          {visible.map((order) => <OrderCard key={order.id} order={order} />)}
          <Pagination page={currentPage} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setPage} />
        </div>
      )}
    </section>
  );
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const first = order.lines[0];
  const placed = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(order.orderPlacedAt));
  return (
    <article className="rounded-2xl border border-[#d8e7e4] bg-white p-4 transition hover:border-[#9fc8c1] hover:shadow-[0_8px_24px_rgba(44,102,94,0.10)] sm:p-5">
      <Link href={`/account/orders/${order.id}`} className="group block">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f2f8f6]">
            {first?.imageUrl ? <img src={first.imageUrl} alt="" className="size-full object-contain p-2" /> : <Box size={28} className="text-[#80aaa2]" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-semibold text-[#26332e]">{first?.productName || `Order #${order.code}`}{order.lines.length > 1 ? ` (+${order.lines.length - 1} more)` : ""}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#89928e]">Order #{order.code} · {placed}</p>
            <p className="mt-2 text-lg font-bold">{formatMoney(order.totalWithTax, order.currencyCode)}</p>
            <p className="text-xs text-[#6f7b76]">{order.totalQuantity} {order.totalQuantity === 1 ? "item" : "items"}</p>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[#e5eeeb] pt-4 sm:min-w-48 sm:justify-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <OrderStatusBadge order={order} />
            <ChevronRight size={20} className="text-[#9eaaa5] transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
      {order.returnRequest || order.lines.some((line) => isOrderLineReturnEligible(order, line)) ? <div className="mt-4 flex justify-end border-t border-[#e5eeeb] pt-4"><ReturnOrderAction order={order} /></div> : null}
    </article>
  );
}

export function OrderDetails() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getCustomerOrder(params.orderId).then((value) => { if (active) setOrder(value); }).catch((caught) => {
      if (!active) return;
      const message = caught instanceof Error ? caught.message : "Could not load the order.";
      if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) router.replace("/login"); else setError(message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.orderId, router]);

  if (loading) return <LoadingCards count={3} />;
  if (error) return <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  if (!order) return <EmptyState title="Order not found" message="This order could not be found in your account." />;
  const address = order.shippingAddress;
  return (
    <section>
      <div className="mb-4"><Link href="/account/orders" className="text-sm font-semibold text-[#2c665e] hover:underline">← Back to My Orders</Link></div>
      <AccountHeading title={`Order #${order.code}`} action={<div className="flex flex-wrap gap-2"><ReturnOrderAction order={order} />{order.status === "delivered" ? <Link href={`/account/orders/${order.id}/review`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#8aaba4] px-4 text-sm font-semibold text-[#2c665e]"><Star size={16} /> Write a Review</Link> : null}<button type="button" onClick={() => downloadInvoice(order)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#8aaba4] px-4 text-sm font-semibold text-[#2c665e]"><Download size={16} /> Download Invoice</button></div>} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-5">
          <OrderProgress order={order} />
          <div className="rounded-2xl border border-[#cfe3df] bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Items</h2><OrderStatusBadge order={order} /></div>
            <div className="divide-y divide-[#e4ece9]">{order.lines.map((line) => <div key={line.id} className="flex gap-4 py-4 first:pt-0 last:pb-0"><div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f2f8f6]">{line.imageUrl ? <img src={line.imageUrl} alt="" className="size-full object-contain p-2" /> : <Box size={26} className="text-[#80aaa2]" />}</div><div className="min-w-0 flex-1"><h3 className="font-semibold text-[#26332e]">{line.productName}</h3><p className="mt-1 text-sm text-[#73807a]">{line.variantName} · SKU {line.sku}</p><p className="mt-2 text-sm">Qty {line.quantity} × {formatMoney(line.unitPriceWithTax, order.currencyCode)}</p></div><p className="font-semibold">{formatMoney(line.linePriceWithTax, order.currencyCode)}</p></div>)}</div>
          </div>
          <div className="rounded-2xl border border-[#cfe3df] bg-white p-5"><h2 className="mb-4 text-lg font-semibold">Price details</h2><dl className="space-y-3 text-sm"><PriceRow label="Subtotal" value={formatMoney(order.subTotalWithTax, order.currencyCode)} /><PriceRow label="Shipping" value={formatMoney(order.shippingWithTax, order.currencyCode)} /><div className="border-t border-[#e2ebe8] pt-3"><PriceRow label="Total" value={formatMoney(order.totalWithTax, order.currencyCode)} strong /></div></dl></div>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#cfe3df] bg-white p-5"><div className="mb-3 flex items-center gap-2"><MapPin size={18} className="text-[#2c665e]" /><h2 className="font-semibold">Delivery address</h2></div>{address ? <address className="text-sm not-italic leading-6 text-[#65716c]">{address.fullName}<br />{address.streetLine1}{address.streetLine2 ? `, ${address.streetLine2}` : ""}<br />{address.city}, {address.province} {address.postalCode}<br />{address.countryCode}<br />{address.phoneNumber}</address> : <p className="text-sm text-[#77827e]">Address unavailable</p>}</div>
        </div>
      </div>
    </section>
  );
}

function PriceRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) { return <div className={`flex justify-between gap-4 ${strong ? "text-base font-bold" : "text-[#596660]"}`}><dt>{label}</dt><dd>{value}</dd></div>; }
function downloadInvoice(order: CustomerOrder) {
  const rows = [["Nana Organics Invoice"], ["Order", order.code], ["Date", order.orderPlacedAt], [], ["Product", "Quantity", "Unit price", "Line total"], ...order.lines.map((line) => [line.productName, String(line.quantity), formatMoney(line.unitPriceWithTax, order.currencyCode), formatMoney(line.linePriceWithTax, order.currencyCode)]), [], ["Subtotal", formatMoney(order.subTotalWithTax, order.currencyCode)], ["Shipping", formatMoney(order.shippingWithTax, order.currencyCode)], ["Total", formatMoney(order.totalWithTax, order.currencyCode)]];
  const url = URL.createObjectURL(new Blob([rows.map((row) => row.join("\t")).join("\n")], { type: "application/vnd.ms-excel" }));
  const link = document.createElement("a"); link.href = url; link.download = `invoice-${order.code}.xls`; link.click(); URL.revokeObjectURL(url);
}
