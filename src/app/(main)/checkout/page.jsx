"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import useCartStore from "@/store/useCartStore";
import {
  saveShippingAddress,
  setGuestCustomerApi,
  fetchShippingOptionsApi,
  addShippingMethodApi,
  initPaymentApi,
  createStripePaymentIntentApi,
  ensureActiveOrderAddingItemsApi,
  waitForStripeOrderApi,
  placeOrderApi,
} from "@/service/CartService";
import { SHIPPING_COUNTRY_OPTIONS } from "@/constants/shippingCountries";
import { fetchAddressesApi } from "@/service/AddressService";
import { apiAddressToCheckout, pickDefaultAddress } from "@/lib/addressAdapter";
import useOrdersStore from "@/store/useOrdersStore";
import StripePayment from "@/components/StripePayment";
import useAuthStore from '@/store/AuthStore';

/** Match cart page — amounts from API are major units in this project */

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const customer = useAuthStore((state) => state.customer);

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [stripeOrder, setStripeOrder] = useState(null);
  const [initializingStripe, setInitializingStripe] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  /** True after the address is saved and Vendure shipping quotes have loaded. */
  const [shippingRatesLoaded, setShippingRatesLoaded] = useState(false);

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "us",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingSavedAddresses, setLoadingSavedAddresses] = useState(false);
  const [selectedSavedId, setSelectedSavedId] = useState("");
  const shippingPrefillDoneRef = useRef(false);

  const {
    items,
    pricing,
    totalQuantity,
    fetchCart,
    setCartFromApi,
    loading,
    currency_code,
  } = useCartStore();
  const currencySymbol = currency_code?.toLowerCase?.() === "eur" ? "€" : "$";
  const resetCart = useCartStore((s) => s.resetCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    fetchCart();
    // Vendure needs the active order address before calculating shipping quotes.
  }, [fetchCart, isAuthenticated]);

  /** Logged-in: load saved profile addresses once; pre-fill shipping from default + account email. */
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    if (shippingPrefillDoneRef.current) return;
    if (!isAuthenticated) {
      return;
    }

    const customerEmail = customer?.email || "";
    const cf = customer?.first_name || "";
    const cl = customer?.last_name || "";

    setLoadingSavedAddresses(true);
    fetchAddressesApi()
      .then((res) => {
        const list = res?.data?.addresses;
        const arr = Array.isArray(list) ? list : [];
        setSavedAddresses(arr);
        shippingPrefillDoneRef.current = true;
        const def = pickDefaultAddress(arr);
        setAddress((prev) => {
          const base = {
            ...prev,
            email: prev.email || customerEmail,
            firstName: prev.firstName || cf,
            lastName: prev.lastName || cl,
          };
          if (!def) return base;
          const co = apiAddressToCheckout(def, customerEmail);
          return {
            ...base,
            ...co,
            email: co.email || base.email,
            firstName: co.firstName || base.firstName,
            lastName: co.lastName || base.lastName,
          };
        });
        if (def?.id) setSelectedSavedId(def.id);
      })
      .catch(() => {
        setSavedAddresses([]);
        shippingPrefillDoneRef.current = true;
        setAddress((prev) => ({
          ...prev,
          email: prev.email || customerEmail,
          firstName: prev.firstName || cf,
          lastName: prev.lastName || cl,
        }));
      })
      .finally(() => setLoadingSavedAddresses(false));
  }, [customer, isAuthenticated, mounted]);

  const applySavedAddressById = (id) => {
    setSelectedSavedId(id);
    if (!id) return;
    const row = savedAddresses.find((x) => x.id === id);
    if (!row) return;
    const customerEmail = customer?.email || "";
    const co = apiAddressToCheckout(row, customerEmail);
    setAddress((prev) => ({
      ...prev,
      ...co,
      email: co.email || prev.email,
    }));
    setShippingRatesLoaded(false);
    setShippingOptions([]);
    setSelectedShipping(null);
  };

  const startManualAddress = () => {
    setSelectedSavedId("");
    setAddress((previous) => ({
      firstName: "",
      lastName: "",
      email: previous.email,
      phone: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: previous.country || "in",
    }));
    setShippingRatesLoaded(false);
    setShippingOptions([]);
    setSelectedShipping(null);
  };

  /** Save the active order address, then load eligible Vendure shipping methods. */
  const persistAddressAndLoadShippingOptions = async (cartId) => {
    const payload = {
      cart_id: cartId,
      first_name: address.firstName.trim(),
      last_name: address.lastName.trim(),
      email: address.email.trim(),
      phone: address.phone.trim(),
      address_1: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      postal_code: address.zip.trim(),
      country_code: (address.country || "us").toLowerCase(),
    };

    if (!isAuthenticated) {
      await setGuestCustomerApi(payload);
    }

    const addressRes = await saveShippingAddress(payload);
    if (!addressRes?.success) {
      throw new Error(addressRes?.message || "Failed to save shipping address");
    }

    const shippingRes = await fetchShippingOptionsApi(cartId);
    if (!shippingRes?.success) {
      throw new Error(
        shippingRes?.message || shippingRes?.error || "Failed to load shipping options"
      );
    }

    return shippingRes.data?.shipping_options || [];
  };

  /**
   * Selecting a method is what makes Vendure apply shipping promotions.
   * Replace the quoted amount with the recalculated order shipping total so
   * the checkout never displays a stale pre-promotion price.
   */
  const selectShippingMethodAndSync = async (options, optionId) => {
    const addRes = await addShippingMethodApi({ option_id: optionId });
    const updatedCart = addRes?.data?.cart;
    if (!addRes?.success || !updatedCart) {
      throw new Error(addRes?.message || "Failed to add shipping method");
    }

    setCartFromApi(updatedCart);
    const shippingWithTax = Number(updatedCart.pricing?.shipping || 0);
    const shippingWithoutTax = Number(
      updatedCart.pricing?.shipping_excluding_tax ?? shippingWithTax,
    );

    return options.map((option) =>
      option.id === optionId
        ? {
            ...option,
            amount: shippingWithTax,
            amount_without_tax: shippingWithoutTax,
            tax: Math.max(0, shippingWithTax - shippingWithoutTax),
          }
        : option,
    );
  };

  const handleGetShippingOptions = async () => {
    if (!validateAddress()) return;
    const cartId = sessionStorage.getItem("cart_id");
    if (!cartId) return;

    setLoadingShipping(true);
    setErrors((prev) => ({ ...prev, shipping: "" }));
    setPaymentError(null);

    try {
      let options = await persistAddressAndLoadShippingOptions(cartId);
      const defaultShippingId = options[0]?.id ?? null;
      if (defaultShippingId) {
        options = await selectShippingMethodAndSync(options, defaultShippingId);
      }
      setShippingOptions(options);
      setSelectedShipping(defaultShippingId);
      setShippingRatesLoaded(true);
      if (options.length === 0) {
        setErrors((prev) => ({
          ...prev,
          shipping:
            "No shipping options are available for this address. Check the Vendure shipping method configuration.",
        }));
      }
    } catch (err) {
      console.error("Shipping options error:", err);
      setPaymentError(
        err?.response?.data?.message || err?.message || "Could not load shipping options"
      );
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleChange = (name, value) => {
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (
      [
        "firstName",
        "lastName",
        "email",
        "phone",
        "street",
        "city",
        "state",
        "zip",
        "country",
      ].includes(name)
    ) {
      setShippingRatesLoaded(false);
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  };

  const validateAddress = () => {
    const newErrors = {};

    if (!address.firstName.trim()) newErrors.firstName = "First name is required";
    if (!address.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!address.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(address.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-]{8,22}$/.test(address.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!address.street.trim()) newErrors.street = "Street address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";

    if (!address.zip.trim()) {
      newErrors.zip = "Postal code is required";
    } else if (!/^[\sA-Za-z0-9\-]{3,12}$/.test(address.zip.trim())) {
      newErrors.zip = "Invalid postal code";
    }

    if (!address.country) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (!validateAddress()) return;

    const cartId = sessionStorage.getItem("cart_id");
    if (!cartId) return;

    setSubmitting(true);
    setPaymentError(null);
    setErrors((prev) => ({ ...prev, shipping: "" }));

    try {
      let options = shippingOptions;

      if (
        !shippingRatesLoaded ||
        options.length === 0 ||
        !selectedShipping ||
        !options.some((o) => o.id === selectedShipping)
      ) {
        options = await persistAddressAndLoadShippingOptions(cartId);
        setShippingOptions(options);
        setShippingRatesLoaded(true);
      }

      if (options.length === 0) {
        setErrors((prev) => ({
          ...prev,
          shipping:
            "No shipping options are available. Check the address and Vendure shipping configuration.",
        }));
        setSubmitting(false);
        return;
      }

      const nextSelectedShipping =
        selectedShipping && options.some((o) => o.id === selectedShipping)
          ? selectedShipping
          : options[0].id;
      setSelectedShipping(nextSelectedShipping);

      options = await selectShippingMethodAndSync(options, nextSelectedShipping);
      setShippingOptions(options);

      const paymentRes = await initPaymentApi(cartId);

      if (!paymentRes?.success || !paymentRes?.data?.payment_methods?.length) {
        throw new Error(
          paymentRes?.message ||
            paymentRes?.error ||
            "No payment method is available. Please try again."
        );
      }

      setPaymentMethods(paymentRes.data.payment_methods);
      setSelectedPaymentMethod(null);
      setClientSecret(null);
      setStripeOrder(null);
      setStep(2);
    } catch (error) {
      console.error("Checkout error:", error);
      setPaymentError(error?.response?.data?.message || error?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPaymentMethod = async (methodCode) => {
    setSelectedPaymentMethod(methodCode);
    setPaymentError(null);

    if (methodCode !== "stripe" || clientSecret) return;

    setInitializingStripe(true);
    try {
      const paymentRes = await createStripePaymentIntentApi();
      if (!paymentRes?.success || !paymentRes?.data?.client_secret) {
        throw new Error(paymentRes?.message || "Stripe could not initialize the payment.");
      }
      setClientSecret(paymentRes.data.client_secret);
      setStripeOrder(paymentRes.data.order);
      sessionStorage.setItem("stripe_order_code", paymentRes.data.order?.display_id || "");
    } catch (error) {
      setSelectedPaymentMethod(null);
      setPaymentError(
        error?.response?.data?.message ||
          error?.message ||
          "Stripe could not initialize the payment."
      );
    } finally {
      setInitializingStripe(false);
    }
  };

  const handleEditAddress = async () => {
    setPaymentError(null);
    try {
      await ensureActiveOrderAddingItemsApi();
      setClientSecret(null);
      setSelectedPaymentMethod(null);
      setStripeOrder(null);
      setStep(1);
    } catch (error) {
      setPaymentError(error?.message || "This order can no longer return to address editing.");
    }
  };

  const handleStripePaymentSuccess = async () => {
    const orderCode = stripeOrder?.display_id;
    if (!orderCode) {
      setPaymentError(
        "The Stripe payment completed, but the order reference is missing. Please contact support before retrying."
      );
      return;
    }

    setPlacingOrder(true);
    setPaymentError(null);

    try {
      const result = await waitForStripeOrderApi(orderCode);
      const order = result.order;

      try {
        if (isAuthenticated) await useOrdersStore.getState().fetchOrders();
      } catch (refreshError) {
        console.warn("Could not refresh My Orders after Stripe payment", refreshError);
      }

      resetCart();
      sessionStorage.removeItem("stripe_order_code");

      const params = new URLSearchParams({
        payment_method: "stripe",
        payment_status: result.settled ? "settled" : "processing",
      });
      params.set("display_id", order?.code || orderCode);
      if (order?.id || stripeOrder?.id) params.set("order_id", order?.id || stripeOrder.id);
      if (order?.pricing?.total != null || stripeOrder?.total != null)
        params.set("total", String(order?.pricing?.total ?? stripeOrder.total));
      if (order?.currency_code || stripeOrder?.currency_code)
        params.set("currency", order?.currency_code || stripeOrder.currency_code);

      router.push(`/checkout/success?${params.toString()}`);
    } catch (error) {
      setPaymentError(
        error?.response?.data?.message ||
          error?.message ||
          "Your payment may have completed, but order confirmation is delayed. Please contact support with your order reference before retrying."
      );
      setPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = async () => {
    const cartId = sessionStorage.getItem("cart_id");
    if (!cartId) return;

    setPlacingOrder(true);
    setPaymentError(null);

    try {
      // Re-apply checkout details immediately before the state transition.
      // This also repairs older active carts created before the Vendure checkout integration.
      const latestOptions = await persistAddressAndLoadShippingOptions(cartId);
      const shippingId =
        selectedShipping && latestOptions.some((option) => option.id === selectedShipping)
          ? selectedShipping
          : latestOptions[0]?.id;
      if (!shippingId) {
        throw new Error("No eligible shipping method is available for this order.");
      }
      await addShippingMethodApi({ cart_id: cartId, option_id: shippingId });

      const orderRes = await placeOrderApi();

      if (!orderRes?.success) {
        throw new Error(orderRes?.message || "Failed to place order");
      }

      const order = orderRes.data?.order;

      // Make the newly placed order available immediately when the customer
      // opens My Orders. A failure here must not invalidate a completed order.
      try {
        if (isAuthenticated) await useOrdersStore.getState().fetchOrders();
      } catch (refreshError) {
        console.warn("Could not refresh My Orders after checkout", refreshError);
      }

      resetCart();

      const params = new URLSearchParams();
      params.set("payment_method", "cash-on-delivery");
      params.set("payment_status", "confirmed");
      if (order?.id) params.set("order_id", order.id);
      if (order?.display_id != null) params.set("display_id", String(order.display_id));
      if (order?.total != null) params.set("total", String(order.total));
      if (order?.currency_code) params.set("currency", order.currency_code);

      router.push(`/checkout/success?${params.toString()}`);
    } catch (error) {
      console.error("Place order error:", error);
      setPaymentError(
        error?.response?.data?.message ||
          error?.message ||
          "The order could not be placed. No online payment was collected. Please try again."
      );
      setPlacingOrder(false);
    }
  };

  const handlePaymentError = (message) => {
    setPaymentError(message);
  };

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-gray-600">
        <p className="text-lg">Loading checkout…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-gray-600">
        <p className="text-lg">Loading your cart…</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    const cartId = typeof window !== "undefined" ? sessionStorage.getItem("cart_id") : null;
    if (!cartId) {
      return (
        <div className="max-w-5xl mx-auto py-24 text-center">
          <h2 className="text-2xl font-semibold">Your cart is empty 🛒</h2>
        </div>
      );
    }
    return (
      <div className="max-w-5xl mx-auto py-24 text-center text-gray-600">
        <p className="text-lg">Loading your cart…</p>
      </div>
    );
  }

  if (!pricing) return null;

  const selectedOption = shippingOptions.find((o) => o.id === selectedShipping);
  const shippingCost = selectedOption ? Number(selectedOption.amount || 0) : 0;
  const shippingBeforeTax = selectedOption
    ? Number(selectedOption.amount_without_tax ?? selectedOption.amount ?? 0)
    : 0;
  const shippingTax = Math.max(0, shippingCost - shippingBeforeTax);
  const netSubtotalBeforeTax = Number(
    pricing.subtotal_excluding_tax ?? pricing.subtotal ?? 0
  );
  const discountBeforeTax = Number(
    pricing.discount_total_excluding_tax ?? pricing.discount_total ?? 0
  );
  const itemPriceTotal = Number(
    pricing.subtotal_before_discounts ?? netSubtotalBeforeTax + discountBeforeTax
  );
  const productTax = Math.max(
    0,
    Number(pricing.subtotal || 0) - netSubtotalBeforeTax
  );
  const taxTotal = productTax + shippingTax;
  const finalTotal = itemPriceTotal + shippingBeforeTax + taxTotal - discountBeforeTax;

  return (
    <>
      <div className="site-shell mt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-sm font-medium text-[#2C665E] hover:underline"
          >
            ← Back to Cart
          </button>
        </div>

        {!isAuthenticated && (
          <p className="mt-4 text-sm text-gray-600">
            Checking out as a guest. No account is required. Enter your email for order updates.
          </p>
        )}

        <div className="flex items-center gap-3 mt-4">
          <StepBadge
            number={1}
            label="Shipping"
            active={step === 1}
            done={step > 1}
            onClick={() => step > 1 && setStep(1)}
          />
          <div className="h-px flex-1 bg-gray-200" />
          <StepBadge number={2} label="Payment" active={step === 2} done={false} />
        </div>
      </div>

      <div className="site-shell grid grid-cols-1 gap-8 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E6F4F2] p-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>

              {loadingSavedAddresses && (
                <p className="text-sm text-gray-500 mb-4">Loading saved addresses…</p>
              )}

              {savedAddresses.length > 0 && (
                <fieldset className="mb-6 md:col-span-2">
                  <legend className="text-sm font-medium text-gray-700 mb-2">
                    Use a saved address
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
                    <button
                      type="button"
                      onClick={startManualAddress}
                      className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
                        selectedSavedId === ""
                          ? "border-[#1EA766] bg-[#F0FBF6] ring-1 ring-[#1EA766]"
                          : "border-[#C6D8D7] bg-white hover:border-[#6C8F85]"
                      }`}
                    >
                      <span className="font-medium block">Use a new address</span>
                      <span className="text-xs text-gray-500">Enter address manually</span>
                    </button>
                    {savedAddresses.map((savedAddress) => {
                      const label = [savedAddress.first_name, savedAddress.last_name]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                      const locality = [
                        savedAddress.address_1,
                        savedAddress.city,
                        savedAddress.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ");
                      const isDefault = savedAddress.is_default || savedAddress.isDefault;
                      return (
                        <button
                          type="button"
                          key={savedAddress.id}
                          onClick={() => applySavedAddressById(savedAddress.id)}
                          className={`text-left px-4 py-3 rounded-xl border text-sm transition ${
                            selectedSavedId === savedAddress.id
                              ? "border-[#1EA766] bg-[#F0FBF6] ring-1 ring-[#1EA766]"
                              : "border-[#C6D8D7] bg-white hover:border-[#6C8F85]"
                          }`}
                        >
                          <span className="font-medium block">
                            {label || "Saved address"}
                            {isDefault ? " (default)" : ""}
                          </span>
                          <span className="text-xs text-gray-500 block mt-0.5">
                            {locality || "Saved delivery address"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select an address, then load the available shipping options.
                  </p>
                </fieldset>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={address.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={address.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                />
                <Input
                  label="Email"
                  name="email"
                  value={address.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
                <Input
                  label="Street / Area"
                  name="street"
                  value={address.street}
                  onChange={handleChange}
                  error={errors.street}
                  full
                />
                <Input
                  label="City"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  error={errors.city}
                />
                <Input
                  label="State"
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  error={errors.state}
                />
                <Input
                  label="Postal / ZIP code"
                  name="zip"
                  value={address.zip}
                  onChange={handleChange}
                  error={errors.zip}
                />
                <CountrySelect
                  label="Country"
                  value={address.country}
                  onChange={handleChange}
                  error={errors.country}
                />
              </div>

              <hr className="mt-8" />

              <h3 className="mt-8 mb-4 font-medium">Shipping method</h3>

              <p className="text-sm text-gray-600 mb-4">
                Vendure calculates shipping after your address is saved. Fill the form above, then
                click <span className="font-semibold text-[#2C665E]">Get shipping options</span>.
              </p>

              <button
                type="button"
                onClick={handleGetShippingOptions}
                disabled={loadingShipping}
                className={`mb-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all
                  ${
                    loadingShipping
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#2C665E] hover:bg-[#244a45]"
                  }`}
              >
                {loadingShipping ? (
                  <span className="flex items-center gap-2">
                    <SpinnerLarge />
                    Loading…
                  </span>
                ) : (
                  "Get shipping options"
                )}
              </button>

              {shippingOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {shippingOptions.map((opt) => {
                    const amount = opt.amount || opt.calculated_price?.calculated_amount || 0;
                    const priceLabel =
                      amount === 0 ? "FREE" : `${currencySymbol} ${amount.toFixed(2)}`;
                    const deliveryDate = opt.estimated_delivery_date
                      ? new Date(opt.estimated_delivery_date)
                      : null;
                    const deliveryEstimate = deliveryDate && !Number.isNaN(deliveryDate.getTime())
                      ? `Estimated ${deliveryDate.toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : opt.transit_time
                        ? String(opt.transit_time).replaceAll("_", " ").toLowerCase()
                        : null;
                    const description = [opt.description, deliveryEstimate]
                      .filter(Boolean)
                      .join(" · ");

                    return (
                      <ShippingRadio
                        key={opt.id}
                        label={opt.service_name || opt.name}
                        description={description}
                        price={priceLabel}
                        value={opt.id}
                        selected={selectedShipping}
                        onChange={setSelectedShipping}
                      />
                    );
                  })}
                </div>
              ) : shippingRatesLoaded ? (
                <p className="text-sm text-gray-500 py-2">No methods returned for this address.</p>
              ) : (
                <p className="text-sm text-gray-400 py-2 italic">
                  Options appear here after you load them.
                </p>
              )}

              {errors.shipping && (
                <span className="text-xs text-red-500 mt-2 block">{errors.shipping}</span>
              )}

              {paymentError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {paymentError}
                </div>
              )}

              <div className="mt-8 flex justify-between items-center flex-wrap gap-4">
                <p className="text-lg font-semibold">
                  Total Price
                  <span className="block text-2xl">
                    {currencySymbol} {finalTotal.toFixed(2)}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={submitting}
                  className={`px-8 py-3 rounded-xl text-white font-semibold transition-all
                    ${
                      submitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#1EA766] hover:bg-[#178f56] cursor-pointer"
                    }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <SpinnerLarge />
                      Saving...
                    </span>
                  ) : (
                    "Continue to Payment →"
                  )}
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <button
                  type="button"
                  onClick={handleEditAddress}
                  className="text-sm text-[#2C665E] hover:underline"
                >
                  ← Edit Address
                </button>
              </div>

              <div className="bg-[#F1F8F7] rounded-xl p-4 mb-6 text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1">Shipping to:</p>
                <p>
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zip}
                </p>
                <p>
                  {address.email} | {address.phone}
                </p>
                <p className="mt-1 text-[#2C665E] font-medium">
                  {selectedOption?.name || "Shipping"} —{" "}
                  {shippingCost === 0 ? "FREE" : `${currencySymbol}${shippingCost.toFixed(2)}`}
                </p>
              </div>

              {placingOrder && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <SpinnerLarge className="h-10 w-10 text-[#1EA766] mb-4" />
                  <p className="text-lg font-semibold text-gray-800">Creating your order...</p>
                  <p className="text-sm text-gray-500 mt-1">Please don&apos;t close this page.</p>
                </div>
              )}

              {paymentError && !placingOrder && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {paymentError}
                </div>
              )}

              {!placingOrder && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {paymentMethods.map((method) => {
                      const selected = selectedPaymentMethod === method.code;
                      const isStripe = method.code === "stripe";
                      return (
                        <button
                          key={method.id || method.code}
                          type="button"
                          onClick={() => handleSelectPaymentMethod(method.code)}
                          disabled={initializingStripe}
                          className={`rounded-2xl border-2 p-5 text-left transition ${
                            selected
                              ? "border-[#1EA766] bg-[#F1F8F7]"
                              : "border-gray-200 bg-white hover:border-[#C6D8D7]"
                          } disabled:cursor-wait disabled:opacity-70`}
                        >
                          <span className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#1EA766]">
                              {selected && <span className="h-3 w-3 rounded-full bg-[#1EA766]" />}
                            </span>
                            <span>
                              <span className="block font-semibold text-gray-900">
                                {isStripe ? "Pay by Card" : method.name}
                              </span>
                              <span className="mt-1 block text-sm text-gray-600">
                                {isStripe
                                  ? "Secure card payment powered by Stripe."
                                  : method.description ||
                                    `Pay ${currencySymbol}${finalTotal.toFixed(2)} when your order is delivered.`}
                              </span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {initializingStripe && (
                    <div className="flex items-center justify-center gap-3 rounded-xl bg-[#F1F8F7] px-4 py-6 text-sm font-medium text-[#2C665E]">
                      <SpinnerLarge />
                      Opening secure Stripe payment...
                    </div>
                  )}

                  {selectedPaymentMethod === "stripe" &&
                    clientSecret &&
                    stripeOrder?.display_id &&
                    !initializingStripe && (
                      <StripePayment
                        clientSecret={clientSecret}
                        orderCode={stripeOrder.display_id}
                        customerEmail={address.email}
                        totalAmount={finalTotal.toFixed(2)}
                        currencySymbol={currencySymbol}
                        onSuccess={handleStripePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    )}

                  {selectedPaymentMethod === "cash-on-delivery" && (
                    <div className="rounded-2xl border border-[#E6F4F2] bg-[#F1F8F7] p-5">
                      <p className="text-sm text-gray-700">
                        Pay {currencySymbol}
                        {finalTotal.toFixed(2)} in cash when your order is delivered.
                      </p>
                      <button
                        type="button"
                        onClick={handlePaymentSuccess}
                        disabled={placingOrder}
                        className="mt-5 w-full rounded-xl bg-[#1EA766] px-5 py-3 font-semibold text-white transition hover:bg-[#178a54] disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        Place Cash on Delivery Order
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <aside className="bg-[#F1F8F7] rounded-2xl p-6 h-fit">
          <h3 className="font-semibold mb-4">Order Summary</h3>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 bg-white p-3 rounded-xl">
                {item.product?.thumbnail ? (
                  <Image
                    src={item.product.thumbnail}
                    alt={item.title}
                    width={90}
                    height={90}
                    className="rounded-lg object-cover h-20 w-20"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}

                <div className="flex flex-col flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.variant_title} | Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-semibold mt-2">
                    {currencySymbol} {item.final_price != null ? item.final_price.toFixed(2) : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <Row
              label={`Subtotal (${totalQuantity} items)`}
              value={`${currencySymbol} ${itemPriceTotal.toFixed(2)}`}
            />
            <Row
              label="Shipping"
              value={
                shippingBeforeTax === 0
                  ? "FREE"
                  : `${currencySymbol} ${shippingBeforeTax.toFixed(2)}`
              }
            />
            <Row label="Tax" value={`${currencySymbol} ${taxTotal.toFixed(2)}`} />
            {discountBeforeTax > 0 && (
              <Row
                label={
                  pricing.coupon_code
                    ? `Coupon (${pricing.coupon_code})`
                    : "Discount"
                }
                value={`- ${currencySymbol} ${discountBeforeTax.toFixed(2)}`}
              />
            )}
          </div>

          <hr className="my-4" />

          <Row label="Total" value={`${currencySymbol} ${finalTotal.toFixed(2)}`} bold />
        </aside>
      </div>
    </>
  );
}

function StepBadge({ number, label, active, done, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
        ${
          active
            ? "bg-[#1EA766] text-white"
            : done
              ? "bg-[#E6F4F2] text-[#1EA766] cursor-pointer hover:bg-[#d0ebe7]"
              : "bg-gray-100 text-gray-400 cursor-default"
        }`}
    >
      {done ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span>{number}</span>
      )}
      {label}
    </button>
  );
}

function Input({ label, name, value, onChange, error, full }) {
  return (
    <div className={`flex flex-col gap-1 ${full ? "md:col-span-2" : ""}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full px-4 py-3 border rounded-xl text-sm 
          ${error ? "border-red-500" : "border-[#C6D8D7]"}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function CountrySelect({ label, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1 md:col-span-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange("country", e.target.value)}
        className={`w-full px-4 py-3 border rounded-xl text-sm bg-white
          ${error ? "border-red-500" : "border-[#C6D8D7]"}`}
      >
        {SHIPPING_COUNTRY_OPTIONS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function ShippingRadio({ label, description, price, value, selected, onChange }) {
  const checked = selected === value;

  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border-2 transition-all ${
        checked
          ? "border-[#1EA766] bg-[#F1F8F7]"
          : "border-gray-200 bg-white hover:border-[#C6D8D7]"
      }`}
    >
      <input type="radio" checked={checked} onChange={() => onChange(value)} className="sr-only" />
      <span className="w-5 h-5 mt-0.5 rounded-full border-2 border-[#2C665E] flex items-center justify-center flex-shrink-0">
        {checked && <span className="w-3 h-3 rounded-full bg-[#2C665E]" />}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {description && <span className="text-xs text-gray-500 mt-0.5">{description}</span>}
        <span className="text-sm text-[#1EA766] font-semibold mt-1">{price}</span>
      </span>
    </label>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-lg" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SpinnerLarge({ className = "h-5 w-5" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
