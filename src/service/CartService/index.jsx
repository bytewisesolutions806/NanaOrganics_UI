import { shopApiRequest } from "@/lib/graphql/client";

const CART_ORDER_FRAGMENT = `
  fragment CartOrder on Order {
    id
    code
    state
    active
    currencyCode
    totalQuantity
    subTotalWithTax
    totalWithTax
    customer { id emailAddress }
    shippingWithTax
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
      description
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

const TRANSITION_TO_PAYMENT = `
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
  const total = money(order.totalWithTax);
  const discount = (order.discounts || []).reduce(
    (sum, item) => sum + Math.abs(money(item.amountWithTax)),
    0,
  );

  return {
    id: order.id,
    code: order.code,
    state: order.state,
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
      discount_amount: Math.max(
        0,
        money(line.linePriceWithTax - line.discountedLinePriceWithTax),
      ),
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
      shipping: money(order.shippingWithTax),
      product_discount: discount,
      coupon_code: order.couponCodes?.[0] || null,
      coupon_discount_amount: discount,
      total,
    },
    checkout_ready: {
      has_customer: Boolean(order.customer?.id),
      has_shipping_address: Boolean(order.shippingAddress?.streetLine1),
      has_shipping_method: Boolean(order.shippingLines?.length),
    },
  };
}

export const fetchCartApi = async () => {
  const data = await shopApiRequest(ACTIVE_ORDER);
  return mapOrder(data.activeOrder);
};

export const addToCartApi = async ({ variant_id, quantity = 1 }) => {
  const data = await shopApiRequest(ADD_ITEM, {
    productVariantId: variant_id,
    quantity,
  });
  const order = unwrapOrder(data.addItemToOrder, "Add to cart");
  return { cart_id: order.id, cart: mapOrder(order) };
};

export const updateCartItemApi = async ({ item_id, quantity }) => {
  const data = await shopApiRequest(ADJUST_LINE, {
    orderLineId: item_id,
    quantity,
  });
  return mapOrder(unwrapOrder(data.adjustOrderLine, "Update cart"));
};

export const deleteCartItemApi = async (itemId) => {
  const data = await shopApiRequest(REMOVE_LINE, { orderLineId: itemId });
  return mapOrder(unwrapOrder(data.removeOrderLine, "Remove cart item"));
};

export const clearCartApi = async () => {
  const data = await shopApiRequest(REMOVE_ALL_LINES);
  return mapOrder(unwrapOrder(data.removeAllOrderLines, "Clear cart"));
};

export const validateCouponApi = async (code) => {
  if (!code?.trim()) throw new Error("Enter a coupon code.");
  return { success: true };
};

export const applyCouponApi = async ({ coupon_code }) => {
  const data = await shopApiRequest(APPLY_COUPON, {
    couponCode: coupon_code.trim(),
  });
  return mapOrder(unwrapOrder(data.applyCouponCode, "Apply coupon"));
};

export const saveShippingAddress = async (input) => {
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
  const method = (data.eligiblePaymentMethods || []).find(
    (item) => item.code === "cash-on-delivery" && item.isEligible,
  );
  if (!method) {
    throw new Error("Cash on Delivery is not available for this order.");
  }
  return {
    success: true,
    data: { client_secret: method.code, payment_method: method },
  };
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
      throw new Error("The active order is not attached to your customer account. Sign out, sign in again, and retry checkout.");
    }
    if (!activeCart.checkout_ready?.has_shipping_method) {
      throw new Error("The active order does not have a shipping method. Select Standard Delivery and retry.");
    }
    preparedOrder = activeCart;
  }

  if (preparedOrder.state !== "ArrangingPayment") {
    const transitionData = await shopApiRequest(TRANSITION_TO_PAYMENT, {
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
