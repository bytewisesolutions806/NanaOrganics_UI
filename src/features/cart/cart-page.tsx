"use client";

import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Minus, PackageOpen, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  applyCartCoupon,
  emptyCart,
  removeCartCoupon,
  removeItemFromCart,
  updateCartLine,
  useCart,
} from "@/features/cart/cart-store";
import { formatCartMoney } from "@/services/api/checkout";

export function CartPage() {
  const cart = useCart();
  const order = cart.order;
  const [coupon, setCoupon] = useState("");
  const [message, setMessage] = useState("");

  async function action(task: () => Promise<unknown>, success = "") {
    setMessage("");
    try { await task(); if (success) setMessage(success); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The cart could not be updated."); }
  }

  if (!cart.loaded && cart.loading) {
    return <main className="mx-auto min-h-[60vh] max-w-[1240px] animate-pulse px-5 py-12 sm:px-8"><div className="h-10 w-52 rounded bg-[#e8efe9]" /><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"><div className="h-80 rounded-2xl bg-[#f0f5f1]" /><div className="h-72 rounded-2xl bg-[#e4eee7]" /></div></main>;
  }

  if (!order?.lines.length) {
    return (
      <main className="grid min-h-[65vh] place-items-center px-5 py-16 text-center [font-family:var(--font-plus-jakarta-sans)]">
        <div><span className="mx-auto grid size-24 place-items-center rounded-full bg-[#eef7ed] text-[#5eae47]"><ShoppingBasket className="size-11" aria-hidden="true" /></span><h1 className="mt-6 font-serif text-4xl font-semibold text-[#26342d]">Your cart is empty</h1><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#66756c]">Explore the Nana Organics collection and add something naturally good to your day.</p><Link href="/product-listing" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#2d6048] px-7 text-sm font-semibold text-white hover:bg-[#244f3b]">Continue Shopping</Link>{cart.error ? <p className="mt-4 text-sm text-red-700">{cart.error}</p> : null}</div>
      </main>
    );
  }

  const currency = order.currencyCode;
  const appliedCoupon = order.couponCodes[0];

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 lg:py-14 [font-family:var(--font-plus-jakarta-sans)]">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#67b84d]">Your selections</p><h1 className="mt-2 font-serif text-4xl font-semibold text-[#26342d]">Shopping Cart</h1><p className="mt-2 text-sm text-[#66756c]">{order.totalQuantity} item{order.totalQuantity === 1 ? "" : "s"} ready for checkout</p></div><button type="button" onClick={() => void action(emptyCart, "Your cart has been cleared.")} disabled={cart.loading} className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800 disabled:opacity-50"><Trash2 className="size-4" aria-hidden="true" />Clear cart</button></div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section aria-label="Cart items" className="overflow-hidden rounded-2xl border border-[#dce6de] bg-white">
          {order.lines.map((line, index) => (
            <article key={line.id} className={`grid gap-5 p-5 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:p-6 ${index ? "border-t border-[#e4ebe6]" : ""}`}>
              <Link href={`/products/${line.variant.product.slug}?variant=${encodeURIComponent(line.variant.id)}`} className="relative aspect-square overflow-hidden rounded-xl bg-[#f3f7f3]">
                {line.imageUrl ? <Image src={line.imageUrl} alt={line.variant.product.name} fill unoptimized sizes="140px" className="object-contain p-3" /> : <span className="grid size-full place-items-center text-[#84968a]"><PackageOpen className="size-9" aria-hidden="true" /></span>}
              </Link>
              <div className="min-w-0"><Link href={`/products/${line.variant.product.slug}?variant=${encodeURIComponent(line.variant.id)}`} className="font-serif text-xl font-semibold text-[#26342d] hover:text-[#5ba744]">{line.variant.product.name}</Link><p className="mt-1 text-xs text-[#718078]">{line.variant.options.map((option) => option.name).join(" · ") || line.variant.name}</p><p className="mt-3 text-sm font-semibold text-[#34483c]">{formatCartMoney(line.unitPriceWithTax, currency)} each</p><div className="mt-4 flex items-center gap-3"><div className="flex h-10 items-center rounded-lg border border-[#cbd9cf]"><button type="button" aria-label={`Decrease ${line.variant.product.name} quantity`} onClick={() => void action(() => updateCartLine(line.id, Math.max(0, line.quantity - 1)))} disabled={cart.loading} className="grid size-9 place-items-center text-[#315f48] disabled:opacity-40"><Minus className="size-3.5" aria-hidden="true" /></button><output className="min-w-8 text-center text-sm font-semibold tabular-nums">{line.quantity}</output><button type="button" aria-label={`Increase ${line.variant.product.name} quantity`} onClick={() => void action(() => updateCartLine(line.id, line.quantity + 1))} disabled={cart.loading} className="grid size-9 place-items-center text-[#315f48] disabled:opacity-40"><Plus className="size-3.5" aria-hidden="true" /></button></div><button type="button" onClick={() => void action(() => removeItemFromCart(line.id))} disabled={cart.loading} className="text-xs font-semibold text-red-700 underline-offset-4 hover:underline disabled:opacity-40">Remove</button></div></div>
              <div className="text-left sm:text-right"><strong className="text-lg text-[#26342d]">{formatCartMoney(line.discountedLinePriceWithTax, currency)}</strong>{line.discountedLinePriceWithTax < line.linePriceWithTax ? <span className="mt-1 block text-xs text-[#98a29c] line-through">{formatCartMoney(line.linePriceWithTax, currency)}</span> : null}</div>
            </article>
          ))}
        </section>

        <aside className="rounded-2xl bg-[#edf5ef] p-6 shadow-[0_12px_35px_rgba(41,84,56,0.08)]">
          <h2 className="font-serif text-2xl font-semibold text-[#26342d]">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm text-[#526159]"><div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{formatCartMoney(order.subTotalWithTax + order.discountWithTax, currency)}</dd></div>{order.discountWithTax > 0 ? <div className="flex justify-between gap-4 text-[#4f9840]"><dt>Discount</dt><dd>− {formatCartMoney(order.discountWithTax, currency)}</dd></div> : null}<div className="flex justify-between gap-4"><dt>Shipping</dt><dd>Calculated at checkout</dd></div></dl>
          <div className="mt-5 border-t border-[#cfded2] pt-5"><div className="flex justify-between gap-4 font-serif text-xl font-semibold text-[#26342d]"><span>Total</span><span>{formatCartMoney(order.totalWithTax, currency)}</span></div><p className="mt-1 text-right text-[11px] text-[#7b8880]">Inclusive of applicable taxes</p></div>
          <div className="mt-6"><label htmlFor="coupon" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#526159]">Promo code</label><div className="mt-2 flex gap-2"><input id="coupon" value={appliedCoupon || coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} disabled={Boolean(appliedCoupon) || cart.loading} placeholder="ENTER CODE" className="min-w-0 flex-1 rounded-lg border border-[#bfd0c3] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#68bd45] disabled:bg-[#f3f5f3]" /><button type="button" disabled={cart.loading || (!appliedCoupon && !coupon.trim())} onClick={() => void action(appliedCoupon ? () => removeCartCoupon(appliedCoupon) : () => applyCartCoupon(coupon), appliedCoupon ? "Coupon removed." : "Coupon applied.")} className={`rounded-lg px-4 py-3 text-xs font-semibold ${appliedCoupon ? "border border-red-200 bg-white text-red-700" : "bg-[#668b76] text-white"} disabled:opacity-50`}>{appliedCoupon ? "Remove" : "Apply"}</button></div></div>
          {(message || cart.error) ? <p role="status" className={`mt-3 text-xs ${/could not|failed|invalid|error/i.test(message || cart.error) ? "text-red-700" : "text-[#4f9840]"}`}>{message || cart.error}</p> : null}
          <Link href="/checkout" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(45,96,72,0.18)] hover:bg-[#244f3b]">Proceed to Checkout</Link>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#65746b]"><LockKeyhole className="size-3.5" aria-hidden="true" />Your information is securely protected</p>
        </aside>
      </div>
    </main>
  );
}
