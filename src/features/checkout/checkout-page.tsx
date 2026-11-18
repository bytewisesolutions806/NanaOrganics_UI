"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, PackageCheck, PackageOpen } from "lucide-react";
import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";

import { resetCartStore, setCartOrder, useCart } from "@/features/cart/cart-store";
import { StripePayment } from "@/features/checkout/stripe-payment";
import { isSupportedCountry, normalizePostalCode, supportedCountries, validatePostalCode } from "@/lib/address-validation";
import { createCustomerAddress, getCustomerAddresses, type CustomerAddress } from "@/services/api/account";
import { getActiveCustomer } from "@/services/api/auth";
import {
  clearShippingMethod,
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
  type CartAddress,
  type PaymentMethod,
  type ShippingMethod,
} from "@/services/api/checkout";

type AddressForm = { firstName: string; lastName: string; email: string; phone: string; streetLine1: string; streetLine2: string; city: string; province: string; postalCode: string; countryCode: string };
const emptyAddress: AddressForm = { firstName: "", lastName: "", email: "", phone: "", streetLine1: "", streetLine2: "", city: "", province: "", postalCode: "", countryCode: "US" };
const inputClass = "mt-2 h-11 w-full rounded border border-[#d1dfdc] bg-white px-3 text-sm text-[#273b32] outline-none focus:border-[#315f48] focus:ring-2 focus:ring-[#315f48]/15";

function shippingAddress(address: AddressForm): CartAddress | null {
  if (![address.firstName, address.lastName, address.phone, address.streetLine1, address.city, address.province, address.postalCode, address.countryCode].every((value) => value.trim()) || validatePostalCode(address.countryCode, address.postalCode)) return null;
  return {
    fullName: `${address.firstName.trim()} ${address.lastName.trim()}`,
    streetLine1: address.streetLine1.trim(),
    streetLine2: address.streetLine2.trim(),
    city: address.city.trim(),
    province: address.province.trim(),
    postalCode: normalizePostalCode(address.countryCode, address.postalCode),
    countryCode: address.countryCode.toUpperCase(),
    phoneNumber: address.phone.trim(),
  };
}

function getAddressKey(address: AddressForm) {
  const value = shippingAddress(address);
  return value ? JSON.stringify(value) : "";
}

export function CheckoutPage() {
  const [visit, setVisit] = useState(0);

  // Next.js preserves hidden routes; a new checkout visit must start at delivery.
  useLayoutEffect(() => () => {
    setVisit((current) => current + 1);
  }, []);

  return <CheckoutVisit key={visit} />;
}

function CheckoutVisit() {
  const router = useRouter();
  const cart = useCart();
  const order = cart.order;
  const [step, setStep] = useState<"delivery" | "payment">("delivery");
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [ratedAddressKey, setRatedAddressKey] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [shippingBusy, setShippingBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [stripeOrderCode, setStripeOrderCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const shippingQueue = useRef<Promise<void>>(Promise.resolve());
  const revision = useRef(0);
  const postalCodeError = validatePostalCode(address.countryCode, address.postalCode);
  const addressKey = getAddressKey(address);
  const ratesCurrent = Boolean(addressKey && ratedAddressKey === addressKey);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      Promise.allSettled([getActiveCustomer(), getCustomerAddresses()]).then(([customerResult, addressResult]) => {
        if (!active) return;
        const customer = customerResult.status === "fulfilled" ? customerResult.value : null;
        const addresses = addressResult.status === "fulfilled" ? addressResult.value : [];
        setAuthenticated(Boolean(customer));
        setSavedAddresses(addresses);
        const supported = addresses.filter((item) => isSupportedCountry(item.countryCode));
        const saved = supported.find((item) => item.isDefault) ?? supported[0] ?? null;
        if (saved) setSelectedAddressId(saved.id);
        if (customer && addressResult.status === "rejected") setError(addressResult.reason instanceof Error ? addressResult.reason.message : "Could not load your saved addresses.");
        setAddress((current) => ({ ...current, firstName: current.firstName || saved?.firstName || customer?.firstName || "", lastName: current.lastName || saved?.lastName || customer?.lastName || "", email: current.email || customer?.emailAddress || "", phone: current.phone || saved?.phoneNumber || "", streetLine1: current.streetLine1 || saved?.streetLine1 || "", streetLine2: current.streetLine2 || saved?.streetLine2 || "", city: current.city || saved?.city || "", province: current.province || saved?.province || "", postalCode: current.postalCode || saved?.postalCode || "", countryCode: saved?.countryCode?.toUpperCase() || current.countryCode }));
        setAddressesLoading(false);
      });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!addressKey || !order?.id || !order.lines.length || step !== "delivery") return;
    const revisionRef = revision;
    const currentRevision = ++revision.current;
    const isCurrent = () => revision.current === currentRevision;
    const timer = window.setTimeout(() => {
      setShippingBusy(true);
      setShippingError("");
      shippingQueue.current = shippingQueue.current.then(async () => {
        if (!isCurrent()) return;
        try {
          await clearShippingMethod();
          if (!isCurrent()) return;
          const addressedOrder = await setCheckoutAddress(JSON.parse(addressKey) as CartAddress);
          if (!isCurrent()) return;
          setCartOrder(addressedOrder);
          const methods = await getEligibleShippingMethods();
          if (!isCurrent()) return;
          if (!methods.length) throw new Error("No shipping options are available for this address. Check the address and try again.");
          const nextOrder = await setShippingMethod(methods[0].id);
          if (!isCurrent()) return;
          setCartOrder(nextOrder);
          setShippingMethods(methods);
          setSelectedShipping(methods[0].id);
          setRatedAddressKey(addressKey);
        } catch (reason) {
          if (isCurrent()) setShippingError(reason instanceof Error ? reason.message : "Could not load shipping options.");
        } finally {
          if (isCurrent()) setShippingBusy(false);
        }
      });
    }, 500);
    return () => { window.clearTimeout(timer); revisionRef.current++; };
  }, [addressKey, order?.id, order?.lines.length, retry, step]);

  function invalidateShipping() {
    revision.current++;
    setRatedAddressKey("");
    setSelectedShipping("");
    setShippingMethods([]);
    setShippingBusy(false);
    setShippingError("");
  }

  function update(name: keyof AddressForm, value: string) {
    if (getAddressKey({ ...address, [name]: value }) !== addressKey) invalidateShipping();
    if (name !== "email" && address[name] !== value) setSelectedAddressId("");
    setAddress((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function chooseSavedAddress(saved: CustomerAddress) {
    if (!isSupportedCountry(saved.countryCode)) {
      setError("Addresses are currently supported only in the United States and Canada.");
      return;
    }
    const nextAddress = { ...address, firstName: saved.firstName, lastName: saved.lastName, phone: saved.phoneNumber, streetLine1: saved.streetLine1, streetLine2: saved.streetLine2, city: saved.city, province: saved.province, postalCode: saved.postalCode, countryCode: saved.countryCode.toUpperCase() };
    if (getAddressKey(nextAddress) !== addressKey) invalidateShipping();
    setSelectedAddressId(saved.id);
    setAddress(nextAddress);
    setError("");
  }

  function useNewAddress() {
    invalidateShipping();
    setSelectedAddressId("");
    setAddress((current) => ({ ...emptyAddress, email: current.email }));
    setError("");
  }

  async function chooseShipping(id: string) {
    if (!ratesCurrent || shippingBusy || busy || id === selectedShipping) return;
    const currentRevision = revision.current;
    setShippingBusy(true);
    setShippingError("");
    shippingQueue.current = shippingQueue.current.then(async () => {
      if (revision.current !== currentRevision) return;
      try {
        const nextOrder = await setShippingMethod(id);
        if (revision.current !== currentRevision) return;
        setCartOrder(nextOrder);
        setSelectedShipping(id);
      } catch (reason) {
        if (revision.current === currentRevision) setShippingError(reason instanceof Error ? reason.message : "Could not select the shipping option.");
      } finally {
        if (revision.current === currentRevision) setShippingBusy(false);
      }
    });
    await shippingQueue.current;
  }

  async function submitAddress(event: FormEvent) {
    event.preventDefault();
    if (postalCodeError) {
      setError(postalCodeError);
      document.getElementById("checkout-postal-code")?.focus();
      return;
    }
    if (!ratesCurrent || !selectedShipping || shippingBusy || shippingError) return;
    setBusy(true);
    setError("");
    try {
      if (authenticated && !selectedAddressId) {
        const saved = await createCustomerAddress({ firstName: address.firstName, lastName: address.lastName, phoneNumber: address.phone, streetLine1: address.streetLine1, streetLine2: address.streetLine2, city: address.city, province: address.province, postalCode: normalizePostalCode(address.countryCode, address.postalCode), countryCode: address.countryCode.toLowerCase(), isDefault: false });
        setSavedAddresses((current) => [...current, saved]);
        setSelectedAddressId(saved.id);
      }
      const contactOrder = await setCheckoutCustomer({ emailAddress: address.email.trim(), firstName: address.firstName.trim(), lastName: address.lastName.trim(), phoneNumber: address.phone.trim() });
      if (contactOrder) setCartOrder(contactOrder);
      const shippingOrder = await setShippingMethod(selectedShipping);
      setCartOrder(shippingOrder);
      const methods = await getEligiblePaymentMethods();
      if (!methods.length) throw new Error("No payment method is available for this order.");
      setPaymentMethods(methods);
      setSelectedPayment("");
      setStep("payment");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The delivery details could not be saved."); }
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

  async function editDelivery() {
    setBusy(true); setError("");
    try {
      const unlocked = await ensureAddingItems();
      if (unlocked) setCartOrder(unlocked);
      invalidateShipping();
      setClientSecret("");
      setSelectedPayment("");
      setStep("delivery");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "This order can no longer be edited."); }
    finally { setBusy(false); }
  }

  if (cart.loaded && !order?.lines.length) return <main className="mx-auto min-h-[65vh] max-w-xl px-5 py-20 text-center"><PackageCheck className="mx-auto size-16 text-[#68bd45]" /><h1 className="mt-5 font-serif text-4xl font-semibold text-[#26342d]">Your cart is empty</h1><p className="mt-3 text-sm text-[#66756c]">Add a product before starting checkout.</p><Link href="/product-listing" className="mt-7 inline-flex rounded-lg bg-[#2d6048] px-6 py-3 text-sm font-semibold text-white">Continue Shopping</Link></main>;

  const currency = order?.currencyCode || "INR";
  const showShipping = step === "payment" || (ratesCurrent && !shippingBusy && !shippingError && Boolean(selectedShipping));
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 lg:py-14 [font-family:var(--font-plus-jakarta-sans)]">
      <div className="flex items-center justify-between gap-4"><h1 className="font-serif text-3xl font-semibold text-[#202b27]">Checkout</h1><Link href="/cart" className="inline-flex items-center gap-2 text-sm text-[#315f48] hover:underline"><ArrowLeft className="size-4" aria-hidden="true" /> Back to Cart</Link></div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div>
          {step === "delivery" ? <form onSubmit={(event) => void submitAddress(event)}>
            <div className="rounded border border-[#e0ece9] bg-white p-5 sm:p-7">
              <h2 className="font-serif text-xl font-semibold text-[#202b27]">Shipping Address</h2>
              <p className="mt-2 text-xs text-[#718078]">{authenticated ? "Choose a saved address or add a new one." : "Enter your contact and delivery details to continue as a guest."}</p>
              {authenticated && savedAddresses.length ? <fieldset disabled={busy} className="mt-5 space-y-3"><legend className="mb-2 text-sm font-semibold text-[#34483c]">Your saved addresses</legend>{savedAddresses.map((saved) => <label key={saved.id} className={`block rounded border p-3 ${!isSupportedCountry(saved.countryCode) ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${selectedAddressId === saved.id ? "border-[#315f48] bg-[#f4f8f5]" : "border-[#dce5de]"}`}><span className="flex items-start gap-3"><input type="radio" name="savedAddress" disabled={!isSupportedCountry(saved.countryCode)} checked={selectedAddressId === saved.id} onChange={() => chooseSavedAddress(saved)} className="mt-1 accent-[#315f48]" /><span className="text-sm leading-6 text-[#526159]"><strong className="block text-[#34483c]">{saved.firstName} {saved.lastName}{saved.isDefault ? " · Default" : ""}</strong>{saved.streetLine1}{saved.streetLine2 ? `, ${saved.streetLine2}` : ""}, {saved.city}, {saved.province} {saved.postalCode}<br />{saved.countryName} · {saved.phoneNumber}{!isSupportedCountry(saved.countryCode) ? <span className="block text-red-700">Delivery is available only in the United States and Canada.</span> : null}</span></span></label>)}<button type="button" onClick={useNewAddress} className="text-sm font-semibold text-[#315f48] hover:underline">+ Add a new address</button></fieldset> : null}
              <fieldset disabled={busy || addressesLoading} className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium text-[#273b32]">First Name<input required value={address.firstName} onChange={(event) => update("firstName", event.target.value)} autoComplete="given-name" placeholder="Enter first name" className={inputClass} /></label>
                  <label className="text-xs font-medium text-[#273b32]">Last Name<input required value={address.lastName} onChange={(event) => update("lastName", event.target.value)} autoComplete="family-name" placeholder="Enter last name" className={inputClass} /></label>
                <label className="text-xs font-medium text-[#273b32]">Email<input required type="email" value={address.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" placeholder="Enter email" className={inputClass} /></label>
                  <label className="text-xs font-medium text-[#273b32]">Phone<input required value={address.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" placeholder="Enter phone number" className={inputClass} /></label>
                  <label className="text-xs font-medium text-[#273b32]">Street / Area<input required value={address.streetLine1} onChange={(event) => update("streetLine1", event.target.value)} autoComplete="address-line1" placeholder="Enter street / area" className={inputClass} /></label>
                  <label className="text-xs font-medium text-[#273b32]">City<input required value={address.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" placeholder="Enter city" className={inputClass} /></label>
                  <label className="text-xs font-medium text-[#273b32]">State / Province<input required value={address.province} onChange={(event) => update("province", event.target.value)} autoComplete="address-level1" placeholder="Enter state / province" className={inputClass} /></label>
                  <label className="text-xs font-medium text-[#273b32]">ZIP / Postal Code<input id="checkout-postal-code" required value={address.postalCode} onChange={(event) => update("postalCode", event.target.value)} autoComplete="postal-code" placeholder="Enter postal code" aria-describedby={address.postalCode && postalCodeError ? "checkout-postal-error" : undefined} aria-invalid={Boolean(address.postalCode && postalCodeError)} className={inputClass} />{address.postalCode && postalCodeError ? <span id="checkout-postal-error" className="mt-1 block text-red-700">{postalCodeError}</span> : null}</label>
                  <label className="text-xs font-medium text-[#273b32]">Address line 2 <span className="font-normal text-[#8a958e]">(optional)</span><input value={address.streetLine2} onChange={(event) => update("streetLine2", event.target.value)} autoComplete="address-line2" placeholder="Apartment, suite, etc." className={inputClass} /></label>
                  <label className="text-xs font-medium text-[#273b32]">Country<select value={address.countryCode} onChange={(event) => update("countryCode", event.target.value)} autoComplete="country" className={inputClass}>{supportedCountries.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}</select></label>
              </fieldset>
              <fieldset disabled={busy || shippingBusy || !ratesCurrent} className="mt-7 border-t border-[#e3e9e6] pt-6">
                <legend className="sr-only">Choose Shipping Option</legend><h2 className="font-serif text-lg font-semibold text-[#202b27]">Choose Shipping Option</h2>
                {!addressKey ? <p className="mt-4 text-sm text-[#718078]">Complete your shipping address to see available options.</p> : null}
                {addressKey && !ratesCurrent && !shippingError ? <p className="mt-4 text-sm text-[#718078]" role="status">Checking shipping options for your address…</p> : null}
                {ratesCurrent ? <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{shippingMethods.map((method) => <label key={method.id} className="flex cursor-pointer items-start gap-2 text-xs text-[#526159]"><input type="radio" name="shippingMethod" value={method.id} checked={selectedShipping === method.id} onChange={() => void chooseShipping(method.id)} className="mt-0.5 accent-[#315f48]" /><span><span className="block font-medium text-[#273b32]">{method.name}</span>{method.description ? <span className="mt-1 block leading-5 text-[#718078]">{method.description}</span> : null}<span className="mt-1 block font-semibold text-[#315f48]">{method.priceWithTax ? formatCartMoney(method.priceWithTax, currency) : "Free"}</span></span></label>)}</div> : null}
              </fieldset>
              {shippingError ? <div role="alert" className="mt-4 text-sm text-red-700">{shippingError} <button type="button" disabled={busy} onClick={() => { invalidateShipping(); setRetry((value) => value + 1); }} className="font-semibold underline">Try again</button></div> : null}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-[#526159]">Total Price</p><p className="text-xl font-semibold text-[#315f48]">{showShipping ? formatCartMoney(order?.totalWithTax ?? 0, currency) : "Calculated after shipping"}</p></div><button type="submit" disabled={busy || addressesLoading || !ratesCurrent || shippingBusy || !selectedShipping || Boolean(shippingError)} className="inline-flex min-h-12 items-center justify-center gap-3 rounded bg-[#2d6048] px-6 text-sm font-semibold text-white hover:bg-[#244f3b] disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Preparing payment…" : "Payment & Confirm"} <ArrowRight className="size-4" aria-hidden="true" /></button></div>
          </form> : <section className="rounded border border-[#e0ece9] bg-white p-5 sm:p-7"><button type="button" disabled={busy} onClick={() => void editDelivery()} className="inline-flex items-center gap-2 text-sm font-semibold text-[#315f48] disabled:opacity-60"><ArrowLeft className="size-4" aria-hidden="true" /> Edit delivery</button><h2 className="mt-6 font-serif text-xl font-semibold text-[#202b27]">Secure payment</h2><p className="mt-2 text-sm text-[#718078]">Choose your preferred payment method.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{paymentMethods.map((method) => <button key={method.id || method.code} type="button" onClick={() => void choosePayment(method.code)} disabled={busy} className={`rounded border p-4 text-left ${selectedPayment === method.code ? "border-[#315f48] bg-[#f4f8f5]" : "border-[#dce5de]"} disabled:opacity-60`}><strong className="block text-sm text-[#34483c]">{method.code === "stripe" ? "Pay securely by card" : method.name}</strong><span className="mt-1 block text-xs leading-5 text-[#718078]">{method.code === "stripe" ? "Powered by Stripe. Your card details never touch Nana Organics servers." : method.description}</span></button>)}</div>{busy && selectedPayment === "stripe" && !clientSecret ? <p role="status" className="mt-5 text-sm text-[#315f48]">Opening secure Stripe payment…</p> : null}{selectedPayment === "stripe" && clientSecret && stripeOrderCode ? <StripePayment clientSecret={clientSecret} orderCode={stripeOrderCode} customerEmail={address.email} total={formatCartMoney(order?.totalWithTax ?? 0, currency)} onSuccess={stripeSuccess} onError={setError} /> : null}{selectedPayment === "cash-on-delivery" ? <div className="mt-5 rounded bg-[#edf5ef] p-5"><p className="text-sm leading-6 text-[#526159]">Pay {formatCartMoney(order?.totalWithTax ?? 0, currency)} when your order is delivered.</p><button type="button" onClick={() => void cashOnDelivery()} disabled={busy} className="mt-4 min-h-12 w-full rounded bg-[#2d6048] px-5 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Placing order…" : "Place Cash on Delivery Order"}</button></div> : null}</section>}
          {error ? <p id="checkout-error" role="alert" className="mt-5 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </div>
        <aside className="rounded bg-[#f6f7f5] p-5 sm:p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-xl font-semibold text-[#202b27]">Order Summary</h2>
          <div className="mt-5 max-h-96 space-y-3 overflow-y-auto">{order?.lines.map((line) => <div key={line.id} className="flex gap-3 rounded-lg bg-white p-3"><div className="relative size-20 shrink-0">{line.imageUrl ? <Image src={line.imageUrl} alt={line.variant.product.name} fill unoptimized sizes="80px" className="object-contain" /> : <span className="grid size-full place-items-center text-[#84968a]"><PackageOpen className="size-7" aria-hidden="true" /></span>}</div><div className="min-w-0"><strong className="block text-sm text-[#202b27]">{line.variant.product.name}</strong><span className="mt-1 block text-xs text-[#718078]">{line.variant.name} · Qty: {line.quantity}</span><span className="mt-2 block text-sm font-semibold text-[#315f48]">{formatCartMoney(line.discountedLinePriceWithTax, currency)} {line.discountedLinePriceWithTax < line.linePriceWithTax ? <span className="text-xs font-normal text-[#98a29c] line-through">{formatCartMoney(line.linePriceWithTax, currency)}</span> : null}</span></div></div>)}</div>
          <dl className="mt-7 space-y-3 border-t border-[#dce5de] pt-5 text-sm text-[#526159]"><div className="flex justify-between gap-4"><dt>Subtotal ({order?.totalQuantity ?? 0} items)</dt><dd>{formatCartMoney((order?.subTotalWithTax ?? 0) + (order?.discountWithTax ?? 0), currency)}</dd></div>{order && order.discountWithTax > 0 ? <div className="flex justify-between gap-4"><dt>Discount</dt><dd>− {formatCartMoney(order.discountWithTax, currency)}</dd></div> : null}<div className="flex justify-between gap-4"><dt>Shipping</dt><dd>{showShipping ? order?.shippingWithTax ? formatCartMoney(order.shippingWithTax, currency) : "Free" : "Calculated after address"}</dd></div><div className="flex justify-between gap-4 border-t border-[#dce5de] pt-4 font-semibold text-[#202b27]"><dt>Total</dt><dd>{showShipping ? formatCartMoney(order?.totalWithTax ?? 0, currency) : "—"}</dd></div></dl>
          <p className="mt-5 flex items-center gap-1.5 text-xs text-[#65746b]"><LockKeyhole className="size-3.5" aria-hidden="true" />Secure checkout by Nana Organics</p>
        </aside>
      </div>
    </main>
  );
}
