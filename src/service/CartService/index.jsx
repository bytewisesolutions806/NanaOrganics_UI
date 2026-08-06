import { shopApiRequest } from "@/lib/graphql/client";

const CART_ORDER_FRAGMENT = `
  fragment CartOrder on Order {
    id
    code
    state
    active
    currencyCode
    totalQuantity
    subTotal
    subTotalWithTax
    total
    totalWithTax
    customer { id emailAddress }
    shipping
    shippingWithTax
    taxSummary {
      description
      taxRate
      taxBase
      taxTotal
    }
    shippingAddress {
      fullName
      streetLine1
      streetLine2
      city
      province
      postalCode
      countryCode
      phoneNumber
    }
    shippingLines {
      id
      shippingMethod { id code name description }
      priceWithTax
    }
    payments {
      id
      method
      state
      amount
      transactionId
      metadata
    }
    couponCodes
    discounts {
      adjustmentSource
      type
      description
      amount
      amountWithTax
    }
    lines {
      id
      quantity
      unitPriceWithTax
      linePriceWithTax
      discountedLinePriceWithTax
      featuredAsset {
        preview
      }
      productVariant {
        id
        name
        sku
        product {
          id
          name
          slug
          featuredAsset {
            preview
          }
        }
      }
    }
  }
`;

const ACTIVE_ORDER = `
  ${CART_ORDER_FRAGMENT}
  query ActiveCart {
    activeOrder {
      ...CartOrder
    }
  }
`;

const ADD_ITEM = `
  ${CART_ORDER_FRAGMENT}
  mutation AddItemToCart($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      __typename
      ... on Order {
        ...CartOrder
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

const ADJUST_LINE = `
  ${CART_ORDER_FRAGMENT}
  mutation AdjustCartLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      __typename
      ... on Order {
        ...CartOrder
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

const REMOVE_LINE = `
  ${CART_ORDER_FRAGMENT}
  mutation RemoveCartLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      __typename
      ... on Order {
        ...CartOrder
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

const REMOVE_ALL_LINES = `
  ${CART_ORDER_FRAGMENT}
  mutation ClearCart {
    removeAllOrderLines {
      __typename
      ... on Order {
        ...CartOrder
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

const APPLY_COUPON = `
  ${CART_ORDER_FRAGMENT}
  mutation ApplyCartCoupon($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      __typename
      ... on Order {
        ...CartOrder
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

const REMOVE_COUPON = `
  ${CART_ORDER_FRAGMENT}
  mutation RemoveCartCoupon($couponCode: String!) {
    removeCouponCode(couponCode: $couponCode) {
      ...CartOrder
    }
  }
`;

const SET_CHECKOUT_ADDRESSES = `
  ${CART_ORDER_FRAGMENT}
  mutation SetCheckoutAddresses($input: CreateAddressInput!) {
    shipping: setOrderShippingAddress(input: $input) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
    billing: setOrderBillingAddress(input: $input) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const ELIGIBLE_SHIPPING_METHODS = `
  query EligibleShippingMethods {
    eligibleShippingMethods {
      id
      code
      name
      description
      price
      priceWithTax
    }
  }
`;

const SET_SHIPPING_METHOD = `
  ${CART_ORDER_FRAGMENT}
  mutation SetShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const ELIGIBLE_PAYMENT_METHODS = `
  query EligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      code
      name
      description
      isEligible
      eligibilityMessage
    }
  }
`;

const CREATE_STRIPE_PAYMENT_INTENT = `
  mutation CreateStripePaymentIntent {
    createStripePaymentIntent
  }
`;

const ORDER_BY_CODE = `
  ${CART_ORDER_FRAGMENT}
  query CheckoutOrderByCode($code: String!) {
    orderByCode(code: $code) {
      ...CartOrder
    }
  }
`;

const TRANSITION_ORDER_TO_STATE = `
  ${CART_ORDER_FRAGMENT}
  mutation TransitionToPayment($state: String!) {
    transitionOrderToState(state: $state) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const PREPARE_COD_ORDER = `
  ${CART_ORDER_FRAGMENT}
  mutation PrepareCashOnDeliveryOrder(
    $address: CreateAddressInput!
    $shippingMethodId: [ID!]!
  ) {
    shipping: setOrderShippingAddress(input: $address) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
    billing: setOrderBillingAddress(input: $address) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
    shippingMethod: setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
    transition: transitionOrderToState(state: "ArrangingPayment") {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const ADD_COD_PAYMENT = `
  ${CART_ORDER_FRAGMENT}
  mutation AddCashOnDeliveryPayment($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      __typename
      ... on Order { ...CartOrder }
      ... on ErrorResult { errorCode message }
    }
  }
`;

const money = (value) => Number(value || 0) / 100;

function unwrapOrder(result, operation) {
  if (!result) throw new Error(`${operation} returned no order.`);
  if (result.__typename && result.__typename !== "Order") {
    throw new Error(result.message || `${operation} failed.`);
  }
  return result;
}

function mapOrder(order) {
  if (!order) return null;

  const subtotal = money(order.subTotalWithTax);
  const subtotalExcludingTax = money(order.subTotal);
  const total = money(order.totalWithTax);
  const totalExcludingTax = money(order.total);
  const discount = (order.discounts || []).reduce(
    (sum, item) => sum + Math.abs(money(item.amountWithTax)),
    0
  );
  const discountExcludingTax = (order.discounts || []).reduce(
    (sum, item) => sum + Math.abs(money(item.amount)),
    0
  );
  const hasCouponDiscount = Boolean(order.couponCodes?.length);

  return {
    id: order.id,
    code: order.code,
    state: order.state,
    active: order.active,
    currency_code: order.currencyCode,
    item_count: order.lines.length,
    total_quantity: order.totalQuantity,
    items: order.lines.map((line) => ({
      id: line.id,
      variant_id: line.productVariant.id,
      title: line.productVariant.product.name,
      variant_title: line.productVariant.name,
      sku: line.productVariant.sku,
      quantity: line.quantity,
      unit_price: money(line.unitPriceWithTax),
      total_price: money(line.linePriceWithTax),
      final_price: money(line.discountedLinePriceWithTax),
      discount_amount: Math.max(0, money(line.linePriceWithTax - line.discountedLinePriceWithTax)),
      product: {
        id: line.productVariant.product.id,
        slug: line.productVariant.product.slug,
        thumbnail:
          line.featuredAsset?.preview ||
          line.productVariant.product.featuredAsset?.preview ||
          "/AppLogo.svg",
      },
    })),
    pricing: {
      subtotal,
      subtotal_excluding_tax: subtotalExcludingTax,
      subtotal_before_discounts_with_tax: subtotal + discount,
      subtotal_before_discounts: subtotalExcludingTax + discountExcludingTax,
      shipping: money(order.shippingWithTax),
      shipping_excluding_tax: money(order.shipping),
      tax: Math.max(0, total - totalExcludingTax),
      tax_lines: (order.taxSummary || [])
        .filter((tax) => Number(tax.taxTotal || 0) !== 0)
        .map((tax) => ({
          description: tax.description,
          rate: Number(tax.taxRate || 0),
          base: money(tax.taxBase),
          amount: money(tax.taxTotal),
        })),
      product_discount: hasCouponDiscount ? 0 : discount,
      product_discount_excluding_tax: hasCouponDiscount ? 0 : discountExcludingTax,
      coupon_code: order.couponCodes?.[0] || null,
      coupon_discount_amount: hasCouponDiscount ? discount : 0,
      coupon_discount_excluding_tax: hasCouponDiscount ? discountExcludingTax : 0,
      discount_total: discount,
      discount_total_excluding_tax: discountExcludingTax,
      total_excluding_tax: totalExcludingTax,
      total,
    },
    checkout_ready: {
      has_customer: Boolean(order.customer?.id),
      has_shipping_address: Boolean(order.shippingAddress?.streetLine1),
      has_shipping_method: Boolean(order.shippingLines?.length),
    },
    payments: (order.payments || []).map((payment) => ({
      id: payment.id,
      method: payment.method,
      state: payment.state,
      amount: money(payment.amount),
      transaction_id: payment.transactionId,
      metadata: payment.metadata,
    })),
  };
}

export const fetchCartApi = async () => {
  const data = await shopApiRequest(ACTIVE_ORDER);
  return mapOrder(data.activeOrder);
};

export const ensureActiveOrderAddingItemsApi = async () => {
  const activeCart = await fetchCartApi();
  if (!activeCart || activeCart.state === "AddingItems") return activeCart;
  if (activeCart.state !== "ArrangingPayment") {
    throw new Error(
      `This order can no longer be modified because it is in the "${activeCart.state}" state.`
    );
  }

  const transitionData = await shopApiRequest(TRANSITION_ORDER_TO_STATE, {
    state: "AddingItems",
  });
  return mapOrder(unwrapOrder(transitionData.transitionOrderToState, "Return order to cart"));
};

const isLockedCartError = (result) =>
  result?.errorCode === "ORDER_MODIFICATION_ERROR" && result?.message?.includes('"AddingItems"');

async function runModifiableOrderMutation(document, variables, resultField, operation) {
  let data = await shopApiRequest(document, variables);
  if (isLockedCartError(data[resultField])) {
    await ensureActiveOrderAddingItemsApi();
    data = await shopApiRequest(document, variables);
  }
  return unwrapOrder(data[resultField], operation);
}

export const addToCartApi = async ({ variant_id, quantity = 1 }) => {
  const order = await runModifiableOrderMutation(
    ADD_ITEM,
    { productVariantId: variant_id, quantity },
    "addItemToOrder",
    "Add to cart"
  );
  return { cart_id: order.id, cart: mapOrder(order) };
};

export const updateCartItemApi = async ({ item_id, quantity }) => {
  const order = await runModifiableOrderMutation(
    ADJUST_LINE,
    { orderLineId: item_id, quantity },
    "adjustOrderLine",
    "Update cart"
  );
  return mapOrder(order);
};

export const deleteCartItemApi = async (itemId) => {
  const order = await runModifiableOrderMutation(
    REMOVE_LINE,
    { orderLineId: itemId },
    "removeOrderLine",
    "Remove cart item"
  );
  return mapOrder(order);
};

export const clearCartApi = async () => {
  const order = await runModifiableOrderMutation(
    REMOVE_ALL_LINES,
    undefined,
    "removeAllOrderLines",
    "Clear cart"
  );
  return mapOrder(order);
};

export const applyCouponApi = async ({ coupon_code }) => {
  const couponCode = coupon_code?.trim().toUpperCase();
  if (!couponCode) throw new Error("Enter a coupon code.");
  const order = await runModifiableOrderMutation(
    APPLY_COUPON,
    { couponCode },
    "applyCouponCode",
    "Apply coupon"
  );
  return mapOrder(order);
};

export const removeCouponApi = async (couponCode) => {
  const normalizedCode = couponCode?.trim();
  if (!normalizedCode) throw new Error("No coupon code is applied.");
  const order = await runModifiableOrderMutation(
    REMOVE_COUPON,
    { couponCode: normalizedCode },
    "removeCouponCode",
    "Remove coupon"
  );
  return mapOrder(order);
};

export const saveShippingAddress = async (input) => {
  await ensureActiveOrderAddingItemsApi();
  const address = {
    fullName: [input.first_name, input.last_name].filter(Boolean).join(" "),
    streetLine1: input.address_1,
    city: input.city,
    province: input.state,
    postalCode: input.postal_code,
    countryCode: String(input.country_code || "").toUpperCase(),
    phoneNumber: input.phone,
  };
  const data = await shopApiRequest(SET_CHECKOUT_ADDRESSES, { input: address });
  unwrapOrder(data.shipping, "Save shipping address");
  unwrapOrder(data.billing, "Save billing address");
  return { success: true };
};

export const fetchShippingOptionsApi = async () => {
  const data = await shopApiRequest(ELIGIBLE_SHIPPING_METHODS);
  return {
    success: true,
    data: {
      shipping_options: (data.eligibleShippingMethods || []).map((method) => ({
        id: method.id,
        code: method.code,
        name: method.name,
        description: method.description,
        amount: money(method.priceWithTax ?? method.price),
        amount_without_tax: money(method.price),
        tax: Math.max(0, money(method.priceWithTax) - money(method.price)),
      })),
    },
  };
};

export const addShippingMethodApi = async ({ option_id }) => {
  const data = await shopApiRequest(SET_SHIPPING_METHOD, {
    shippingMethodId: [option_id],
  });
  return {
    success: true,
    data: { cart: mapOrder(unwrapOrder(data.setOrderShippingMethod, "Set shipping method")) },
  };
};

export const initPaymentApi = async () => {
  const data = await shopApiRequest(ELIGIBLE_PAYMENT_METHODS);
  const supportedCodes = new Set(["stripe", "cash-on-delivery"]);
  const methods = (data.eligiblePaymentMethods || []).filter(
    (item) => item.isEligible && supportedCodes.has(item.code)
  );
  if (methods.length === 0) {
    throw new Error("No payment method is available for this order.");
  }
  return {
    success: true,
    data: { payment_methods: methods },
  };
};

export const createStripePaymentIntentApi = async () => {
  const activeCart = await fetchCartApi();
  if (!activeCart) throw new Error("No active order was found.");
  if (!activeCart.items.length) throw new Error("Your active order is empty.");
  if (!activeCart.checkout_ready?.has_customer) {
    throw new Error(
      "The active order is not attached to your customer account. Sign out, sign in again, and retry checkout."
    );
  }
  if (!activeCart.checkout_ready?.has_shipping_method) {
    throw new Error("Select a shipping method before starting payment.");
  }

  let order = activeCart;
  if (order.state !== "ArrangingPayment") {
    const transitionData = await shopApiRequest(TRANSITION_ORDER_TO_STATE, {
      state: "ArrangingPayment",
    });
    order = mapOrder(
      unwrapOrder(transitionData.transitionOrderToState, "Prepare order for Stripe payment")
    );
  }

  let data;
  try {
    data = await shopApiRequest(CREATE_STRIPE_PAYMENT_INTENT);
    if (!data.createStripePaymentIntent) {
      throw new Error("Stripe did not return a payment session.");
    }
  } catch (error) {
    // No payment can be confirmed without a client secret, so unlock the cart
    // if Stripe initialization fails after the state transition.
    try {
      await ensureActiveOrderAddingItemsApi();
    } catch {
      // Preserve the original Stripe error; the next cart mutation can retry
      // recovery and surface a state error if the order has progressed.
    }
    throw error;
  }

  return {
    success: true,
    data: {
      client_secret: data.createStripePaymentIntent,
      order: {
        id: order.id,
        display_id: order.code,
        total: order.pricing.total,
        currency_code: order.currency_code,
      },
    },
  };
};

export const fetchOrderByCodeApi = async (code) => {
  if (!code) throw new Error("An order code is required.");
  const data = await shopApiRequest(ORDER_BY_CODE, { code });
  return mapOrder(data.orderByCode);
};

export const waitForStripeOrderApi = async (code, { attempts = 15, intervalMs = 800 } = {}) => {
  let latestOrder = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    latestOrder = await fetchOrderByCodeApi(code);
    const stripePayment = latestOrder?.payments?.find((payment) => payment.method === "stripe");
    if (stripePayment?.state === "Settled") {
      return { order: latestOrder, settled: true };
    }
    if (stripePayment?.state === "Declined" || stripePayment?.state === "Cancelled") {
      throw new Error("Stripe reported that the payment was not completed.");
    }
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return { order: latestOrder, settled: false };
};

export const placeOrderApi = async ({ address, shippingMethodId } = {}) => {
  let preparedOrder;
  if (address && shippingMethodId) {
    const prepareData = await shopApiRequest(PREPARE_COD_ORDER, {
      address,
      shippingMethodId: [shippingMethodId],
    });
    unwrapOrder(prepareData.shipping, "Save shipping address");
    unwrapOrder(prepareData.billing, "Save billing address");
    unwrapOrder(prepareData.shippingMethod, "Set shipping method");
    preparedOrder = unwrapOrder(prepareData.transition, "Prepare order for payment");
  } else {
    const activeCart = await fetchCartApi();
    if (!activeCart) throw new Error("No active order was found.");
    if (!activeCart.items.length) throw new Error("Your active order is empty.");
    if (!activeCart.checkout_ready?.has_customer) {
      throw new Error(
        "The active order is not attached to your customer account. Sign out, sign in again, and retry checkout."
      );
    }
    if (!activeCart.checkout_ready?.has_shipping_method) {
      throw new Error(
        "The active order does not have a shipping method. Select Standard Delivery and retry."
      );
    }
    preparedOrder = activeCart;
  }

  if (preparedOrder.state !== "ArrangingPayment") {
    const transitionData = await shopApiRequest(TRANSITION_ORDER_TO_STATE, {
      state: "ArrangingPayment",
    });
    unwrapOrder(transitionData.transitionOrderToState, "Prepare order for payment");
  }

  const paymentData = await shopApiRequest(ADD_COD_PAYMENT, {
    input: {
      method: "cash-on-delivery",
      metadata: { source: "storefront-checkout" },
    },
  });
  const order = unwrapOrder(paymentData.addPaymentToOrder, "Place Cash on Delivery order");
  const cart = mapOrder(order);
  return {
    success: true,
    data: {
      order: {
        id: cart.id,
        display_id: cart.code,
        state: cart.state,
        payment_method: "Cash on Delivery",
        total: cart.pricing.total || 0,
        currency_code: cart.currency_code,
      },
    },
  };
};
