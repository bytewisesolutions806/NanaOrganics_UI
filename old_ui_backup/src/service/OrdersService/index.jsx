import { shopApiRequest } from '@/lib/graphql/client';
import { normalizeOrderFromApi } from '@/lib/orderAdapter';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

const ORDER_FIELDS = `
  fragment CustomerOrderFields on Order {
    id
    code
    state
    createdAt
    updatedAt
    orderPlacedAt
    currencyCode
    subTotal
    subTotalWithTax
    shipping
    shippingWithTax
    total
    totalWithTax
    totalQuantity
    discounts { amount amountWithTax description }
    taxSummary { description taxRate taxBase taxTotal }
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
      priceWithTax
      shippingMethod { id code name }
    }
    fulfillments {
      id
      state
      method
      trackingCode
      createdAt
      updatedAt
    }
    history(options: { take: 100, sort: { createdAt: ASC } }) {
      totalItems
      items {
        id
        createdAt
        updatedAt
        type
        data
      }
    }
    payments { id method state amount transactionId metadata }
    lines {
      id
      quantity
      unitPriceWithTax
      linePriceWithTax
      discountedLinePriceWithTax
      featuredAsset { preview }
      productVariant {
        id
        name
        sku
        product { id name slug featuredAsset { preview } }
      }
    }
  }
`;

const CUSTOMER_ORDERS = `
  ${ORDER_FIELDS}
  query CustomerOrders($options: OrderListOptions) {
    customerReturnPolicy { returnWindowDays }
    activeCustomer {
      orders(options: $options) {
        totalItems
        items { ...CustomerOrderFields }
      }
    }
    myReturnRequests(skip: 0, take: 100) {
      items { orderId status updatedAt }
    }
  }
`;

const CUSTOMER_ORDER = `
  ${ORDER_FIELDS}
  query CustomerOrder($id: ID!) {
    customerReturnPolicy { returnWindowDays }
    order(id: $id) { ...CustomerOrderFields }
    fedExTracking(orderId: $id) {
      trackingNumber
      statusCode
      statusDescription
      carrierCode
      estimatedDeliveryAt
      actualDeliveryAt
      updatedAt
      trackingUrl
      events {
        timestamp
        statusCode
        statusDescription
        location
      }
    }
    myReturnRequests(skip: 0, take: 100) {
      items { orderId status updatedAt }
    }
  }
`;

function address(address) {
  if (!address) return null;
  const names = String(address.fullName || '').trim().split(/\s+/);
  return {
    first_name: names.shift() || '',
    last_name: names.join(' '),
    address_1: address.streetLine1,
    address_2: address.streetLine2,
    city: address.city,
    province: address.province,
    postal_code: address.postalCode,
    country_code: address.countryCode,
    phone: address.phoneNumber,
  };
}

const stateLabels = {
  PaymentSettled: 'Payment confirmed',
  PartiallyShipped: 'Partially shipped',
  Shipped: 'Shipped',
  PartiallyDelivered: 'Partially delivered',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

const FAILED_PAYMENT_STATES = new Set(['Declined', 'Cancelled', 'Error']);
const FULFILLMENT_ORDER_STATES = new Set([
  'PartiallyShipped',
  'Shipped',
  'PartiallyDelivered',
  'Delivered',
]);

function paymentStatusFor(order) {
  const payments = order.payments || [];
  const settledPayment = payments.find((payment) => payment.state === 'Settled');
  if (settledPayment || order.state === 'PaymentSettled') {
    return { kind: 'settled', payment: settledPayment || null, confirmed: true };
  }

  const codPayment = payments.find(
    (payment) => payment.method === 'cash-on-delivery' && payment.state === 'Authorized',
  );
  if (codPayment) {
    return { kind: 'cod_confirmed', payment: codPayment, confirmed: true };
  }

  if (FULFILLMENT_ORDER_STATES.has(order.state)) {
    return { kind: 'settled', payment: payments[0] || null, confirmed: true };
  }

  const allPaymentsFailed = payments.length > 0 && payments.every(
    (payment) => FAILED_PAYMENT_STATES.has(payment.state),
  );
  if (allPaymentsFailed) {
    return { kind: 'failed', payment: payments[payments.length - 1], confirmed: false };
  }

  return { kind: 'pending', payment: payments[payments.length - 1] || null, confirmed: false };
}

function formatUpdateDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function historyMessage(entry, paymentStatus) {
  const data = entry?.data || {};
  if (entry.type === 'ORDER_NOTE') {
    return data.note || data.message || data.text || '';
  }
  if (entry.type === 'ORDER_STATE_TRANSITION') {
    if (data.to === 'PaymentAuthorized') {
      return paymentStatus.kind === 'cod_confirmed' ? 'Order confirmed' : 'Payment authorized';
    }
    return stateLabels[data.to] || '';
  }
  if (entry.type === 'ORDER_PAYMENT_TRANSITION') {
    if (data.to === 'Authorized') {
      return paymentStatus.kind === 'cod_confirmed'
        ? 'Cash on Delivery confirmed'
        : 'Payment authorized';
    }
    if (data.to === 'Settled') return 'Payment received';
    if (FAILED_PAYMENT_STATES.has(data.to)) return 'Payment not completed';
  }
  if (entry.type === 'ORDER_FULFILLMENT') return 'Shipment created';
  if (entry.type === 'ORDER_FULFILLMENT_TRANSITION') {
    return stateLabels[data.to] || data.to || 'Shipment updated';
  }
  if (entry.type === 'ORDER_CANCELLATION') return 'Order cancelled';
  return '';
}

function buildOrderUpdates(order) {
  const paymentStatus = paymentStatusFor(order);
  const updates = (order.history?.items || [])
    .map((entry) => {
      const message = historyMessage(entry, paymentStatus);
      if (!message) return null;
      const isNote = entry.type === 'ORDER_NOTE';
      return {
        id: entry.id,
        status: isNote ? 'Update from seller' : message,
        description: isNote ? message : '',
        date: formatUpdateDate(entry.createdAt),
        createdAt: entry.createdAt,
        type: entry.type,
        completed: true,
      };
    })
    .filter(Boolean);

  if (
    paymentStatus.confirmed &&
    !updates.some((item) => ['Order confirmed', 'Payment confirmed'].includes(item.status))
  ) {
    updates.unshift({
      id: `placed-${order.id}`,
      status: 'Order confirmed',
      description: `Order #${order.code} was placed successfully.`,
      date: formatUpdateDate(order.orderPlacedAt || order.createdAt),
      createdAt: order.orderPlacedAt || order.createdAt,
      type: 'ORDER_PLACED',
      completed: true,
    });
  } else if (
    paymentStatus.kind === 'pending' &&
    !updates.some((item) => item.status === 'Payment pending')
  ) {
    updates.push({
      id: `payment-pending-${order.id}`,
      status: 'Payment pending',
      description: 'The order will be confirmed after payment is completed.',
      date: formatUpdateDate(order.updatedAt || order.createdAt),
      createdAt: order.updatedAt || order.createdAt,
      type: 'PAYMENT_PENDING',
      completed: false,
    });
  } else if (
    paymentStatus.kind === 'failed' &&
    !updates.some((item) => item.status === 'Payment not completed')
  ) {
    updates.push({
      id: `payment-failed-${order.id}`,
      status: 'Payment not completed',
      description: 'The payment failed or was cancelled, so this order is not confirmed.',
      date: formatUpdateDate(order.updatedAt || order.createdAt),
      createdAt: order.updatedAt || order.createdAt,
      type: 'PAYMENT_FAILED',
      completed: true,
    });
  }
  return updates;
}

function uiStatusFor(order, returnRequest, liveTracking) {
  const fulfillmentStates = (order.fulfillments || []).map((item) => item.state);
  if (returnRequest?.status === 'REFUND_COMPLETED') return 'returned';
  if (order.state === 'Cancelled' || fulfillmentStates.includes('Cancelled')) return 'cancelled';
  const liveStatus = `${liveTracking?.statusCode || ''} ${liveTracking?.statusDescription || ''}`;
  if (/\bDL\b|delivered/i.test(liveStatus)) return 'delivered';
  if (/\b(IT|OD|PU|AR|DP)\b|in transit|out for delivery|picked up|on the way/i.test(liveStatus)) {
    return 'on_the_way';
  }
  if (order.state === 'Delivered' || fulfillmentStates.includes('Delivered')) return 'delivered';
  if (
    ['PartiallyShipped', 'Shipped', 'PartiallyDelivered'].includes(order.state) ||
    fulfillmentStates.some((state) => ['Shipped', 'Delivered'].includes(state))
  ) return 'on_the_way';
  const paymentStatus = paymentStatusFor(order);
  if (paymentStatus.kind === 'failed') return 'payment_failed';
  if (!paymentStatus.confirmed) return 'payment_pending';
  return 'confirmed';
}

function toUiOrder(order, returnRequest, liveTracking = null, returnWindowDays = 7) {
  if (!order) return null;
  const cancelled = /cancel/i.test(order.state);
  const discountTotal = (order.discounts || []).reduce(
    (sum, discount) => sum + Math.abs(Number(discount.amount || 0)),
    0,
  );
  const taxTotalFromSummary = (order.taxSummary || []).reduce(
    (sum, tax) => sum + Number(tax.taxTotal || 0),
    0,
  );
  const taxTotal = taxTotalFromSummary || Math.max(
    0,
    Number(order.totalWithTax || 0) - Number(order.total || 0),
  );
  const legacy = {
    id: String(order.id),
    display_id: order.code,
    status: cancelled ? 'cancelled' : 'pending',
    created_at: order.orderPlacedAt || order.createdAt,
    updated_at: order.updatedAt,
    currency_code: String(order.currencyCode || '').toLowerCase(),
    subtotal: Number(order.subTotal || 0) + discountTotal,
    net_subtotal: order.subTotal,
    subtotal_with_tax: order.subTotalWithTax,
    shipping_total: order.shipping,
    shipping_total_with_tax: order.shippingWithTax,
    total: order.totalWithTax,
    total_excluding_tax: order.total,
    tax_total: taxTotal,
    tax_lines: (order.taxSummary || [])
      .filter((tax) => Number(tax.taxTotal || 0) !== 0)
      .map((tax) => ({
        description: tax.description,
        rate: Number(tax.taxRate || 0),
        base: Number(tax.taxBase || 0),
        amount: Number(tax.taxTotal || 0),
      })),
    discount_total: discountTotal,
    discount_total_with_tax: (order.discounts || []).reduce(
      (sum, discount) => sum + Math.abs(Number(discount.amountWithTax || 0)),
      0,
    ),
    shipping_address: address(order.shippingAddress),
    shipping_methods: (order.shippingLines || []).map((line) => ({
      id: line.id,
      name: line.shippingMethod?.name,
      amount: line.priceWithTax,
    })),
    payment_method: order.payments?.[0]?.method || null,
    payment_status: order.payments?.[0]?.state || 'Pending',
    vendure_state: order.state,
    metadata: returnRequest
      ? {
          returned: returnRequest.status === 'REFUND_COMPLETED',
          return_status: returnRequest.status,
          returned_at: returnRequest.updatedAt,
        }
      : undefined,
    fulfillments: (order.fulfillments || []).map((fulfillment) => ({
      id: fulfillment.id,
      status: fulfillment.state,
      method: fulfillment.method,
      tracking_code: fulfillment.trackingCode,
      created_at: fulfillment.createdAt,
      updated_at: fulfillment.updatedAt,
      shipped_at: fulfillment.state === 'Shipped' ? fulfillment.updatedAt : null,
      delivered_at: fulfillment.state === 'Delivered' ? fulfillment.updatedAt : null,
    })),
    items: (order.lines || []).map((line) => ({
      id: line.id,
      title: line.productVariant?.product?.name || line.productVariant?.name,
      variant_title: line.productVariant?.name,
      variant_id: line.productVariant?.id,
      product_id: line.productVariant?.product?.id,
      quantity: line.quantity,
      unit_price: line.unitPriceWithTax,
      subtotal: line.discountedLinePriceWithTax ?? line.linePriceWithTax,
      total: line.discountedLinePriceWithTax ?? line.linePriceWithTax,
      thumbnail:
        line.featuredAsset?.preview ||
        line.productVariant?.product?.featuredAsset?.preview ||
        DEFAULT_IMAGE,
    })),
  };
  const normalized = normalizeOrderFromApi(legacy);
  const updates = buildOrderUpdates(order);
  for (const [index, event] of (liveTracking?.events || []).entries()) {
    if (!event.statusDescription) continue;
    updates.push({
      id: `fedex-${event.timestamp || index}-${event.statusCode || index}`,
      status: event.statusDescription,
      description: event.location || '',
      date: formatUpdateDate(event.timestamp),
      createdAt: event.timestamp,
      type: 'FEDEX_TRACKING',
      completed: true,
    });
  }
  updates.sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
    return leftTime - rightTime;
  });
  const uiStatus = uiStatusFor(order, returnRequest, liveTracking);
  if (uiStatus === 'returned' && !updates.some((item) => item.status === 'Returned')) {
    updates.push({
      id: `return-${order.id}`,
      status: 'Returned',
      description: 'Your returned order has been received.',
      date: formatUpdateDate(returnRequest.updatedAt),
      createdAt: returnRequest.updatedAt,
      type: 'ORDER_RETURNED',
      completed: true,
    });
  }
  const tracking = (order.fulfillments || []).find((item) => item.trackingCode) ||
    order.fulfillments?.[0] || null;
  const deliveredTimes = (order.fulfillments || [])
    .filter((item) => item.state === 'Delivered' && item.updatedAt)
    .map((item) => new Date(item.updatedAt).getTime())
    .filter(Number.isFinite);
  const deliveredAt = deliveredTimes.length
    ? new Date(Math.max(...deliveredTimes))
    : order.state === 'Delivered' ? new Date(order.updatedAt) : null;
  const returnDeadline = deliveredAt
    ? new Date(deliveredAt.getTime() + Number(returnWindowDays || 7) * 86400000)
    : null;
  const canReturn = uiStatus === 'delivered' && !returnRequest &&
    Boolean(returnDeadline && Date.now() <= returnDeadline.getTime());
  return {
    ...normalized,
    vendureState: order.state,
    uiStatus,
    status: uiStatus,
    canReturn,
    returnWindowDays: Number(returnWindowDays || 7),
    returnDeadline: returnDeadline?.toISOString() || null,
    returnRequestStatus: returnRequest?.status || null,
    updates,
    timeline: updates.map((item) => ({
      label: item.description
        ? `${item.status}: ${item.description}${item.date ? ` — ${item.date}` : ''}`
        : `${item.status}${item.date ? ` — ${item.date}` : ''}`,
    })),
    adminNotes: updates.filter((item) => item.type === 'ORDER_NOTE'),
    tracking: tracking || liveTracking
      ? {
          state: liveTracking?.statusDescription || tracking?.state,
          statusCode: liveTracking?.statusCode || null,
          method: tracking?.method || liveTracking?.carrierCode || 'FedEx',
          code: liveTracking?.trackingNumber || tracking?.trackingCode,
          updatedAt: liveTracking?.updatedAt || tracking?.updatedAt,
          estimatedDeliveryAt: liveTracking?.estimatedDeliveryAt || null,
          actualDeliveryAt: liveTracking?.actualDeliveryAt || null,
          trackingUrl: liveTracking?.trackingUrl || null,
          events: liveTracking?.events || [],
        }
      : null,
  };
}

function returnRequestsByOrder(items = []) {
  const result = new Map();
  for (const request of items) {
    const key = String(request.orderId);
    const current = result.get(key);
    if (!current || new Date(request.updatedAt) > new Date(current.updatedAt)) {
      result.set(key, request);
    }
  }
  return result;
}

export const fetchUserOrdersApi = async ({ take = 100, skip = 0 } = {}) => {
  const data = await shopApiRequest(CUSTOMER_ORDERS, {
    options: { take, skip, sort: { orderPlacedAt: 'DESC' } },
  });
  const result = data.activeCustomer?.orders;
  const returns = returnRequestsByOrder(data.myReturnRequests?.items);
  const returnWindowDays = data.customerReturnPolicy?.returnWindowDays || 7;
  return {
    success: true,
    data: {
      orders: (result?.items || []).map((order) =>
        toUiOrder(order, returns.get(String(order.id)), null, returnWindowDays),
      ),
      pagination: { total: result?.totalItems || 0 },
    },
  };
};

export const fetchUserOrderByIdApi = async (orderId) => {
  const data = await shopApiRequest(CUSTOMER_ORDER, { id: orderId });
  const returns = returnRequestsByOrder(data.myReturnRequests?.items);
  return {
    success: true,
    data: {
      order: toUiOrder(
        data.order,
        returns.get(String(orderId)),
        data.fedExTracking,
        data.customerReturnPolicy?.returnWindowDays || 7,
      ),
    },
  };
};
