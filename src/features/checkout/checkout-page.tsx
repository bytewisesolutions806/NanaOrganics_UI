"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, CreditCard, LockKeyhole, MapPin, PackageCheck, Truck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { resetCartStore, setCartOrder, useCart } from "@/features/cart/cart-store";
import { StripePayment } from "@/features/checkout/stripe-payment";
import { getCustomerAddresses } from "@/services/api/account";
import { getActiveCustomer } from "@/services/api/auth";
import {
  createStripePaymentIntent,
  ensureAddingItems,
  formatCartMoney,
  getEligiblePaymentMethods,
  getEligibleShippingMethods,
  placeCashOnDeliveryOrder,
  setCheckoutAddress,
  setCheckoutCustomer,
  setShippingMethod,
  waitForStripeOrder,
  type PaymentMethod,
  type ShippingMethod,
} from "@/services/api/checkout";

type AddressForm = { firstName: string; lastName: string; email: string; phone: string; streetLine1: string; streetLine2: string; city: string; province: string; postalCode: string; countryCode: string };
const emptyAddress: AddressForm = { firstName: "", lastName: "", email: "", phone: "", streetLine1: "", streetLine2: "", city: "", province: "", postalCode: "", countryCode: "IN" };

function Step({ number, label, active, complete }: { number: number; label: string; active: boolean; complete: boolean }) {
  return <div className={`flex items-center gap-2 ${active || complete ? "text-[#315f48]" : "text-[#95a199]"}`}><span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${active || complete ? "bg-[#315f48] text-white" : "bg-[#e7ece8]"}`}>{complete ? <Check className="size-4" aria-hidden="true" /> : number}</span><span className="hidden text-xs font-semibold uppercase tracking-[0.12em] sm:block">{label}</span></div>;
}

function inputClass() { return "h-12 w-full rounded-lg border border-[#cad8cd] bg-white px-3 text-sm text-[#34483c] outline-none transition focus:border-[#68bd45] focus:ring-2 focus:ring-[#68bd45]/25"; }

export function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const order = cart.order;
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [stripeOrderCode, setStripeOrderCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      Promise.allSettled([getActiveCustomer(), getCustomerAddresses()]).then(([customerResult, addressResult]) => {
        if (!active) return;
        const customer = customerResult.status === "fulfilled" ? customerResult.value : null;
        const saved = addressResult.status === "fulfilled" ? addressResult.value.find((item) => item.isDefault) ?? addressResult.value[0] : null;
        setAddress((current) => ({ ...current, firstName: current.firstName || saved?.firstName || customer?.firstName || "", lastName: current.lastName || saved?.lastName || customer?.lastName || "", email: current.email || customer?.emailAddress || "", phone: current.phone || saved?.phoneNumber || "", streetLine1: current.streetLine1 || saved?.streetLine1 || "", streetLine2: current.streetLine2 || saved?.streetLine2 || "", city: current.city || saved?.city || "", province: current.province || saved?.province || "", postalCode: current.postalCode || saved?.postalCode || "", countryCode: current.countryCode || saved?.countryCode?.toUpperCase() || "IN" }));
      });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  function update(name: keyof AddressForm, value: string) { setAddress((current) => ({ ...current, [name]: value })); setError(""); }

  async function submitAddress(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const contactOrder = await setCheckoutCustomer({ emailAddress: address.email.trim(), firstName: address.firstName.trim(), lastName: address.lastName.trim(), phoneNumber: address.phone.trim() });
      if (contactOrder) setCartOrder(contactOrder);
      const addressedOrder = await setCheckoutAddress({ fullName: `${address.firstName.trim()} ${address.lastName.trim()}`.trim(), streetLine1: address.streetLine1.trim(), streetLine2: address.streetLine2.trim(), city: address.city.trim(), province: address.province.trim(), postalCode: address.postalCode.trim(), countryCode: address.countryCode.toUpperCase(), phoneNumber: address.phone.trim() });
      setCartOrder(addressedOrder);
      const methods = await getEligibleShippingMethods();
      if (!methods.length) throw new Error("No delivery method is available for this address. Check the address and try again.");
      setShippingMethods(methods); setSelectedShipping(methods[0].id); setStep(2);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The delivery details could not be saved."); }
    finally { setBusy(false); }
  }

  async function submitShipping() {
    if (!selectedShipping) return;
    setBusy(true); setError("");
    try {
      const nextOrder = await setShippingMethod(selectedShipping); setCartOrder(nextOrder);
      const methods = await getEligiblePaymentMethods();
      if (!methods.length) throw new Error("No payment method is available for this order.");
      setPaymentMethods(methods); setSelectedPayment(""); setStep(3);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The delivery method could not be selected."); }
    finally { setBusy(false); }
  }

  async function choosePayment(code: string) {
    setSelectedPayment(code); setError(""); setClientSecret("");
    if (code !== "stripe") return;
    setBusy(true);
    try {
      const result = await createStripePaymentIntent();
      setCartOrder(result.order); setClientSecret(result.clientSecret); setStripeOrderCode(result.order.code); sessionStorage.setItem("stripe_order_code", result.order.code);
    } catch (reason) { setSelectedPayment(""); setError(reason instanceof Error ? reason.message : "Stripe could not initialize the payment."); }
    finally { setBusy(false); }
  }

  async function stripeSuccess() {
    setBusy(true); setError("");
    try {
      const result = await waitForStripeOrder(stripeOrderCode);
      sessionStorage.removeItem("stripe_order_code"); resetCartStore();
      const confirmed = result.order;
      const query = new URLSearchParams({ payment_method: "stripe", payment_status: result.settled ? "settled" : "processing", display_id: confirmed?.code || stripeOrderCode, total: String(confirmed?.totalWithTax ?? order?.totalWithTax ?? 0), currency: confirmed?.currencyCode || order?.currencyCode || "INR" });
      router.push(`/checkout/success?${query}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Payment confirmation is delayed. Please do not retry the payment yet."); setBusy(false); }
  }

  async function cashOnDelivery() {
    setBusy(true); setError("");
    try {
      const confirmed = await placeCashOnDeliveryOrder(); resetCartStore();
      const query = new URLSearchParams({ payment_method: "cash-on-delivery", payment_status: "confirmed", display_id: confirmed.code, order_id: confirmed.id, total: String(confirmed.totalWithTax), currency: confirmed.currencyCode });
      router.push(`/checkout/success?${query}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The order could not be placed."); setBusy(false); }
  }

  async function editEarlier(next: 1 | 2) {
    setError("");
    try { const unlocked = await ensureAddingItems(); if (unlocked) setCartOrder(unlocked); setClientSecret(""); setSelectedPayment(""); setStep(next); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "This order can no longer be edited."); }
  }

  if (cart.loaded && !order?.lines.length) return <main className="mx-auto min-h-[65vh] max-w-xl px-5 py-20 text-center"><PackageCheck className="mx-auto size-16 text-[#68bd45]" /><h1 className="mt-5 font-serif text-4xl font-semibold text-[#26342d]">Your cart is empty</h1><p className="mt-3 text-sm text-[#66756c]">Add a product before starting checkout.</p><Link href="/product-listing" className="mt-7 inline-flex rounded-lg bg-[#2d6048] px-6 py-3 text-sm font-semibold text-white">Continue Shopping</Link></main>;

  const currency = order?.currencyCode || "INR";
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:py-14 [font-family:var(--font-plus-jakarta-sans)]">
      <div className="mx-auto flex max-w-2xl items-center justify-between"><Step number={1} label="Address" active={step === 1} complete={step > 1} /><span className="h-px flex-1 bg-[#d7e1d9]" /><Step number={2} label="Delivery" active={step === 2} complete={step > 2} /><span className="h-px flex-1 bg-[#d7e1d9]" /><Step number={3} label="Payment" active={step === 3} complete={false} /></div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section className="rounded-2xl border border-[#dce6de] bg-white p-6 sm:p-8">
          {step === 1 ? <form onSubmit={(event) => void submitAddress(event)}><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#eef7ed] text-[#5eae47]"><MapPin className="size-5" aria-hidden="true" /></span><div><h1 className="font-serif text-3xl font-semibold text-[#26342d]">Delivery address</h1><p className="mt-1 text-xs text-[#718078]">We’ll use these details for delivery updates.</p></div></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#526159]">First name<input required value={address.firstName} onChange={(event) => update("firstName", event.target.value)} autoComplete="given-name" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159]">Last name<input required value={address.lastName} onChange={(event) => update("lastName", event.target.value)} autoComplete="family-name" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159]">Email address<input required type="email" value={address.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159]">Phone number<input required value={address.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159] sm:col-span-2">Address line 1<input required value={address.streetLine1} onChange={(event) => update("streetLine1", event.target.value)} autoComplete="address-line1" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159] sm:col-span-2">Address line 2 <span className="font-normal text-[#8a958e]">(optional)</span><input value={address.streetLine2} onChange={(event) => update("streetLine2", event.target.value)} autoComplete="address-line2" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159]">City<input required value={address.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159]">State / Province<input required value={address.province} onChange={(event) => update("province", event.target.value)} autoComplete="address-level1" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159]">Postal code<input required value={address.postalCode} onChange={(event) => update("postalCode", event.target.value)} autoComplete="postal-code" className={`mt-2 ${inputClass()}`} /></label><label className="text-xs font-semibold text-[#526159]">Country<select value={address.countryCode} onChange={(event) => update("countryCode", event.target.value)} autoComplete="country" className={`mt-2 ${inputClass()}`}><option value="IN">India</option><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option></select></label></div><button type="submit" disabled={busy} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white hover:bg-[#244f3b] disabled:opacity-60">{busy ? "Checking delivery options…" : "Continue to Delivery"}</button></form> : null}

          {step === 2 ? <div><button type="button" onClick={() => void editEarlier(1)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#315f48]"><ChevronLeft className="size-4" aria-hidden="true" />Edit address</button><div className="mt-5 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#eef7ed] text-[#5eae47]"><Truck className="size-5" aria-hidden="true" /></span><div><h1 className="font-serif text-3xl font-semibold text-[#26342d]">Delivery method</h1><p className="mt-1 text-xs text-[#718078]">Choose how you’d like your order delivered.</p></div></div><div className="mt-7 space-y-3">{shippingMethods.map((method) => <button key={method.id} type="button" onClick={() => setSelectedShipping(method.id)} className={`flex w-full items-center justify-between gap-5 rounded-xl border-2 p-5 text-left ${selectedShipping === method.id ? "border-[#68bd45] bg-[#f3f9f1]" : "border-[#dce5de] hover:border-[#b9ccbd]"}`}><span><strong className="block text-sm text-[#34483c]">{method.name}</strong><span className="mt-1 block text-xs leading-5 text-[#718078]">{method.description}</span></span><strong className="shrink-0 text-sm text-[#315f48]">{method.priceWithTax ? formatCartMoney(method.priceWithTax, currency) : "FREE"}</strong></button>)}</div><button type="button" onClick={() => void submitShipping()} disabled={!selectedShipping || busy} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white hover:bg-[#244f3b] disabled:opacity-60">{busy ? "Preparing payment…" : "Continue to Payment"}</button></div> : null}

          {step === 3 ? <div><button type="button" onClick={() => void editEarlier(2)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#315f48]"><ChevronLeft className="size-4" aria-hidden="true" />Edit delivery</button><div className="mt-5 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-[#eef7ed] text-[#5eae47]"><CreditCard className="size-5" aria-hidden="true" /></span><div><h1 className="font-serif text-3xl font-semibold text-[#26342d]">Secure payment</h1><p className="mt-1 text-xs text-[#718078]">Choose your preferred payment method.</p></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2">{paymentMethods.map((method) => <button key={method.id || method.code} type="button" onClick={() => void choosePayment(method.code)} disabled={busy} className={`rounded-xl border-2 p-5 text-left ${selectedPayment === method.code ? "border-[#68bd45] bg-[#f3f9f1]" : "border-[#dce5de] hover:border-[#b9ccbd]"} disabled:opacity-60`}><span className="flex items-start gap-3"><span className={`mt-0.5 size-4 shrink-0 rounded-full border-2 border-[#68bd45] ${selectedPayment === method.code ? "bg-[#68bd45] shadow-[inset_0_0_0_3px_white]" : ""}`} /><span><strong className="block text-sm text-[#34483c]">{method.code === "stripe" ? "Pay securely by card" : method.name}</strong><small className="mt-1 block leading-5 text-[#718078]">{method.code === "stripe" ? "Powered by Stripe. Your card details never touch Nana Organics servers." : method.description}</small></span></span></button>)}</div>{busy && selectedPayment === "stripe" && !clientSecret ? <p className="mt-5 animate-pulse rounded-xl bg-[#edf5ef] p-5 text-center text-sm text-[#315f48]">Opening secure Stripe payment…</p> : null}{selectedPayment === "stripe" && clientSecret && stripeOrderCode ? <StripePayment clientSecret={clientSecret} orderCode={stripeOrderCode} customerEmail={address.email} total={formatCartMoney(order?.totalWithTax ?? 0, currency)} onSuccess={stripeSuccess} onError={setError} /> : null}{selectedPayment === "cash-on-delivery" ? <div className="mt-5 rounded-xl bg-[#edf5ef] p-5"><p className="text-sm leading-6 text-[#526159]">Pay {formatCartMoney(order?.totalWithTax ?? 0, currency)} when your order is delivered.</p><button type="button" onClick={() => void cashOnDelivery()} disabled={busy} className="mt-4 min-h-12 w-full rounded-lg bg-[#2d6048] px-5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Placing order…" : "Place Cash on Delivery Order"}</button></div> : null}</div> : null}
          {error ? <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </section>

        <aside className="rounded-2xl bg-[#edf5ef] p-6 lg:sticky lg:top-28"><h2 className="font-serif text-2xl font-semibold text-[#26342d]">Order Summary</h2><div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">{order?.lines.map((line) => <div key={line.id} className="flex justify-between gap-3 text-xs text-[#526159]"><span className="min-w-0"><strong className="block truncate text-[#34483c]">{line.variant.product.name}</strong><span>{line.quantity} × {formatCartMoney(line.unitPriceWithTax, currency)}</span></span><span className="shrink-0 font-semibold">{formatCartMoney(line.discountedLinePriceWithTax, currency)}</span></div>)}</div><dl className="mt-5 space-y-3 border-t border-[#cfded2] pt-5 text-sm text-[#526159]"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatCartMoney(order?.subTotalWithTax ?? 0, currency)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{order?.shippingWithTax ? formatCartMoney(order.shippingWithTax, currency) : step > 1 ? "FREE" : "Calculated next"}</dd></div><div className="flex justify-between border-t border-[#cfded2] pt-4 font-serif text-xl font-semibold text-[#26342d]"><dt>Total</dt><dd>{formatCartMoney(order?.totalWithTax ?? 0, currency)}</dd></div></dl><p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#65746b]"><LockKeyhole className="size-3.5" aria-hidden="true" />Secure checkout powered by Vendure</p></aside>
      </div>
    </main>
  );
}
