"use client";

interface GraphQLError { message: string }
interface GraphQLResponse<T> { data?: T; errors?: GraphQLError[] }

export interface CartAddress {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
}

export interface CheckoutContact {
  emailAddress: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  unitPriceWithTax: number;
  linePriceWithTax: number;
  discountedLinePriceWithTax: number;
  imageUrl: string;
  variant: {
    id: string;
    name: string;
    sku: string;
    options: Array<{ id: string; name: string; code: string }>;
    product: { id: string; name: string; slug: string };
  };
}

export interface CartOrder {
  id: string;
  code: string;
  state: string;
  active: boolean;
  currencyCode: string;
  totalQuantity: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  discountWithTax: number;
  couponCodes: string[];
  customer?: { id: string; emailAddress: string } | null;
  shippingAddress?: CartAddress | null;
  shippingLines: Array<{
    id: string;
    priceWithTax: number;
    shippingMethod: { id: string; code: string; name: string; description: string };
  }>;
  payments: Array<{ id: string; method: string; state: string; amount: number; transactionId?: string | null }>;
  lines: CartLine[];
}

export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  priceWithTax: number;
  metadata?: Record<string, unknown> | null;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  isEligible: boolean;
  eligibilityMessage?: string | null;
}

const ORDER_FRAGMENT = `
  fragment CheckoutOrder on Order {
    id code state active currencyCode totalQuantity
    subTotalWithTax shippingWithTax totalWithTax
    customer { id emailAddress }
    shippingAddress { fullName streetLine1 streetLine2 city province postalCode countryCode phoneNumber }
    shippingLines { id priceWithTax shippingMethod { id code name description } }
    payments { id method state amount transactionId }
    couponCodes
    discounts { amountWithTax }
    lines {
      id quantity unitPriceWithTax linePriceWithTax discountedLinePriceWithTax
      featuredAsset { preview }
      productVariant {
        id name sku options { id name code }
        product { id name slug featuredAsset { preview } }
      }
    }
  }
`;

function endpoint() {
  const value = process.env.NEXT_PUBLIC_VENDURE_API_URL;
  if (!value) throw new Error("NEXT_PUBLIC_VENDURE_API_URL is not configured.");
  return value;
}

function headers() {
  const token = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  return { "content-type": "application/json", ...(token ? { "vendure-token": token } : {}) };
}

async function request<T>(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(endpoint(), {
    method: "POST",
    credentials: "include",
    headers: headers(),
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json() as GraphQLResponse<T>;
  if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.[0]?.message || `Store API error (${response.status}).`);
  if (!payload.data) throw new Error("The store API returned an empty response.");
  return payload.data;
}

function assetUrl(value?: string | null) {
  if (!value) return "";
  if (/^https?:/i.test(value)) return value.replaceAll("\\", "/");
  try { return new URL(value.replaceAll("\\", "/"), endpoint()).toString(); } catch { return value; }
}

type OrderResult = (CartOrder & { __typename: "Order" }) | { __typename: string; errorCode?: string; message?: string };

function orderResult(result: OrderResult | null | undefined, action: string): CartOrder {
  if (!result) throw new Error(`${action} returned no order.`);
  if (!("lines" in result)) throw new Error(result.message || `${action} failed.`);
  return normalizeOrder(result);
}

function normalizeOrder(order: CartOrder): CartOrder {
  return {
    ...order,
    discountWithTax: Math.abs((order as CartOrder & { discounts?: Array<{ amountWithTax: number }> }).discounts?.reduce((sum, discount) => sum + discount.amountWithTax, 0) ?? order.discountWithTax ?? 0),
    couponCodes: order.couponCodes ?? [],
    shippingLines: order.shippingLines ?? [],
    payments: order.payments ?? [],
    lines: (order.lines ?? []).map((line) => ({
      ...line,
      imageUrl: assetUrl(line.imageUrl || (line as CartLine & { featuredAsset?: { preview?: string }; productVariant?: CartLine["variant"] & { product: CartLine["variant"]["product"] & { featuredAsset?: { preview?: string } } } }).featuredAsset?.preview || (line as CartLine & { productVariant?: { product?: { featuredAsset?: { preview?: string } } } }).productVariant?.product?.featuredAsset?.preview),
      variant: (line as CartLine & { productVariant?: CartLine["variant"] }).productVariant ?? line.variant,
    })),
  };
}

const ACTIVE_ORDER = `${ORDER_FRAGMENT} query ActiveOrder { activeOrder { ...CheckoutOrder } }`;
const TRANSITION = `${ORDER_FRAGMENT} mutation TransitionOrder($state: String!) { transitionOrderToState(state: $state) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`;

export async function getActiveOrder() {
  const data = await request<{ activeOrder: CartOrder | null }>(ACTIVE_ORDER);
  return data.activeOrder ? normalizeOrder(data.activeOrder) : null;
}

export async function ensureAddingItems() {
  const order = await getActiveOrder();
  if (!order || order.state === "AddingItems") return order;
  if (order.state !== "ArrangingPayment") throw new Error(`This order can no longer be modified because it is in the “${order.state}” state.`);
  const data = await request<{ transitionOrderToState: OrderResult }>(TRANSITION, { state: "AddingItems" });
  return orderResult(data.transitionOrderToState, "Return order to cart");
}

async function editableMutation(field: string, query: string, variables: Record<string, unknown> = {}) {
  let data = await request<Record<string, OrderResult>>(query, variables);
  const result = data[field];
  if (!("lines" in result) && result.errorCode === "ORDER_MODIFICATION_ERROR") {
    await ensureAddingItems();
    data = await request<Record<string, OrderResult>>(query, variables);
  }
  return orderResult(data[field], field);
}

export function addCartItem(productVariantId: string, quantity: number) {
  return editableMutation("addItemToOrder", `${ORDER_FRAGMENT} mutation AddCartItem($productVariantId: ID!, $quantity: Int!) { addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { productVariantId, quantity });
}

export function adjustCartLine(orderLineId: string, quantity: number) {
  return editableMutation("adjustOrderLine", `${ORDER_FRAGMENT} mutation AdjustCartLine($orderLineId: ID!, $quantity: Int!) { adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { orderLineId, quantity });
}

export function removeCartLine(orderLineId: string) {
  return editableMutation("removeOrderLine", `${ORDER_FRAGMENT} mutation RemoveCartLine($orderLineId: ID!) { removeOrderLine(orderLineId: $orderLineId) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { orderLineId });
}

export function clearCart() {
  return editableMutation("removeAllOrderLines", `${ORDER_FRAGMENT} mutation ClearCart { removeAllOrderLines { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`);
}

export function applyCoupon(couponCode: string) {
  return editableMutation("applyCouponCode", `${ORDER_FRAGMENT} mutation ApplyCoupon($couponCode: String!) { applyCouponCode(couponCode: $couponCode) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { couponCode: couponCode.trim().toUpperCase() });
}

export async function removeCoupon(couponCode: string) {
  const data = await request<{ removeCouponCode: CartOrder }>(`${ORDER_FRAGMENT} mutation RemoveCoupon($couponCode: String!) { removeCouponCode(couponCode: $couponCode) { ...CheckoutOrder } }`, { couponCode });
  return normalizeOrder(data.removeCouponCode);
}

export async function setCheckoutCustomer(contact: CheckoutContact) {
  await ensureAddingItems();
  const data = await request<{ setCustomerForOrder: OrderResult | null }>(`${ORDER_FRAGMENT} mutation SetCheckoutCustomer($input: CreateCustomerInput!) { setCustomerForOrder(input: $input) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { input: contact });
  if (data.setCustomerForOrder?.__typename === "AlreadyLoggedInError") return getActiveOrder();
  if (data.setCustomerForOrder?.__typename === "EmailAddressConflictError") throw new Error("This email belongs to an existing account. Sign in to continue or use another email for guest checkout.");
  return orderResult(data.setCustomerForOrder, "Save contact details");
}

export async function setCheckoutAddress(address: CartAddress) {
  await ensureAddingItems();
  const data = await request<{ shipping: OrderResult; billing: OrderResult }>(`${ORDER_FRAGMENT} mutation SetCheckoutAddresses($input: CreateAddressInput!) { shipping: setOrderShippingAddress(input: $input) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } billing: setOrderBillingAddress(input: $input) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { input: address });
  orderResult(data.shipping, "Save shipping address");
  return orderResult(data.billing, "Save billing address");
}

export async function getEligibleShippingMethods() {
  const data = await request<{ eligibleShippingMethods: ShippingMethod[] }>(`query EligibleShippingMethods { eligibleShippingMethods { id code name description price priceWithTax metadata } }`);
  return data.eligibleShippingMethods ?? [];
}

export async function setShippingMethod(shippingMethodId: string) {
  const data = await request<{ setOrderShippingMethod: OrderResult }>(`${ORDER_FRAGMENT} mutation SetShippingMethod($shippingMethodId: [ID!]!) { setOrderShippingMethod(shippingMethodId: $shippingMethodId) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { shippingMethodId: [shippingMethodId] });
  return orderResult(data.setOrderShippingMethod, "Set shipping method");
}

export async function getEligiblePaymentMethods() {
  const data = await request<{ eligiblePaymentMethods: PaymentMethod[] }>(`query EligiblePaymentMethods { eligiblePaymentMethods { id code name description isEligible eligibilityMessage } }`);
  return (data.eligiblePaymentMethods ?? []).filter((method) => method.isEligible && ["stripe", "cash-on-delivery"].includes(method.code));
}

export async function createStripePaymentIntent() {
  const current = await getActiveOrder();
  if (!current?.lines.length) throw new Error("Your cart is empty.");
  if (!current.customer?.id) throw new Error("Enter your contact details before continuing.");
  if (!current.shippingLines.length) throw new Error("Select a shipping method before starting payment.");
  let order = current;
  if (order.state !== "ArrangingPayment") {
    const transition = await request<{ transitionOrderToState: OrderResult }>(TRANSITION, { state: "ArrangingPayment" });
    order = orderResult(transition.transitionOrderToState, "Prepare Stripe payment");
  }
  try {
    const data = await request<{ createStripePaymentIntent: string }>(`mutation CreateStripePaymentIntent { createStripePaymentIntent }`);
    if (!data.createStripePaymentIntent) throw new Error("Stripe did not return a payment session.");
    return { clientSecret: data.createStripePaymentIntent, order };
  } catch (error) {
    try { await ensureAddingItems(); } catch { /* Preserve the Stripe initialization error. */ }
    throw error;
  }
}

export async function placeCashOnDeliveryOrder() {
  const current = await getActiveOrder();
  if (!current?.lines.length) throw new Error("Your cart is empty.");
  if (current.state !== "ArrangingPayment") {
    const transition = await request<{ transitionOrderToState: OrderResult }>(TRANSITION, { state: "ArrangingPayment" });
    orderResult(transition.transitionOrderToState, "Prepare order for payment");
  }
  const data = await request<{ addPaymentToOrder: OrderResult }>(`${ORDER_FRAGMENT} mutation AddCashOnDeliveryPayment($input: PaymentInput!) { addPaymentToOrder(input: $input) { __typename ... on Order { ...CheckoutOrder } ... on ErrorResult { errorCode message } } }`, { input: { method: "cash-on-delivery", metadata: { source: "storefront-checkout" } } });
  return orderResult(data.addPaymentToOrder, "Place cash on delivery order");
}

export async function getOrderByCode(code: string) {
  const data = await request<{ orderByCode: CartOrder | null }>(`${ORDER_FRAGMENT} query OrderByCode($code: String!) { orderByCode(code: $code) { ...CheckoutOrder } }`, { code });
  return data.orderByCode ? normalizeOrder(data.orderByCode) : null;
}

export async function waitForStripeOrder(code: string, attempts = 15) {
  let order: CartOrder | null = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    order = await getOrderByCode(code);
    const payment = order?.payments.find((candidate) => candidate.method === "stripe");
    if (payment?.state === "Settled") return { order, settled: true };
    if (["Declined", "Cancelled", "Error"].includes(payment?.state ?? "")) throw new Error("Stripe reported that the payment was not completed.");
    if (attempt < attempts - 1) await new Promise((resolve) => window.setTimeout(resolve, 800));
  }
  return { order, settled: false };
}

export function formatCartMoney(amount: number, currencyCode = "INR") {
  try { return new Intl.NumberFormat(currencyCode === "INR" ? "en-IN" : "en-US", { style: "currency", currency: currencyCode }).format(amount / 100); }
  catch { return `${currencyCode} ${(amount / 100).toFixed(2)}`; }
}
