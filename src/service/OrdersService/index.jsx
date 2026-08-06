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
    order(id: $id) { ...CustomerOrderFields }
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
  PaymentAuthorized: 'Order confirmed',
  PaymentSettled: 'Payment confirmed',
  PartiallyShipped: 'Partially shipped',
  Shipped: 'Shipped',
  PartiallyDelivered: 'Partially delivered',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
};

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

function historyMessage(entry) {
  const data = entry?.data || {};
  if (entry.type === 'ORDER_NOTE') {
    return data.note || data.message || data.text || '';
  }
  if (entry.type === 'ORDER_STATE_TRANSITION') {
    return stateLabels[data.to] || '';
  }
  if (entry.type === 'ORDER_PAYMENT_TRANSITION') {
    if (data.to === 'Authorized') return 'Cash on Delivery confirmed';
    if (data.to === 'Settled') return 'Payment received';
    if (data.to === 'Declined') return 'Payment declined';
  }
  if (entry.type === 'ORDER_FULFILLMENT') return 'Shipment created';
  if (entry.type === 'ORDER_FULFILLMENT_TRANSITION') {
    return stateLabels[data.to] || data.to || 'Shipment updated';
  }
  if (entry.type === 'ORDER_CANCELLATION') return 'Order cancelled';
  return '';
}

function buildOrderUpdates(order) {
  const updates = (order.history?.items || [])
    .map((entry) => {
      const message = historyMessage(entry);
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

  if (!updates.some((item) => item.status === 'Order confirmed')) {
    updates.unshift({
      id: `placed-${order.id}`,
      status: 'Order confirmed',
      description: `Order #${order.code} was placed successfully.`,
      date: formatUpdateDate(order.orderPlacedAt || order.createdAt),
      createdAt: order.orderPlacedAt || order.createdAt,
      type: 'ORDER_PLACED',
      completed: true,
    });
  }
  return updates;
}

function uiStatusFor(order, returnRequest) {
  const fulfillmentStates = (order.fulfillments || []).map((item) => item.state);
  if (returnRequest && ['RECEIVED', 'REFUNDED'].includes(returnRequest.status)) return 'returned';
  if (order.state === 'Cancelled' || fulfillmentStates.includes('Cancelled')) return 'cancelled';
  if (order.state === 'Delivered' || fulfillmentStates.includes('Delivered')) return 'delivered';
  if (
    ['PartiallyShipped', 'Shipped', 'PartiallyDelivered'].includes(order.state) ||
    fulfillmentStates.some((state) => ['Shipped', 'Delivered'].includes(state))
  ) return 'on_the_way';
  return 'confirmed';
}

function toUiOrder(order, returnRequest) {
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
    payment_method: order.payments?.[0]?.method || 'cash-on-delivery',
    payment_status: order.payments?.[0]?.state || 'Authorized',
    vendure_state: order.state,
    metadata: returnRequest
      ? {
          returned: ['RECEIVED', 'REFUNDED'].includes(returnRequest.status),
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
  const uiStatus = uiStatusFor(order, returnRequest);
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
  return {
    ...normalized,
    vendureState: order.state,
    uiStatus,
    status: uiStatus,
    updates,
    timeline: updates.map((item) => ({
      label: item.description
        ? `${item.status}: ${item.description}${item.date ? ` — ${item.date}` : ''}`
        : `${item.status}${item.date ? ` — ${item.date}` : ''}`,
    })),
    adminNotes: updates.filter((item) => item.type === 'ORDER_NOTE'),
    tracking: tracking
      ? {
          state: tracking.state,
          method: tracking.method,
          code: tracking.trackingCode,
          updatedAt: tracking.updatedAt,
        }
      : null,
  };
}

function returnedRequestsByOrder(items = []) {
  const result = new Map();
  for (const request of items) {
    if (!['RECEIVED', 'REFUNDED'].includes(request.status)) continue;
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
  const returns = returnedRequestsByOrder(data.myReturnRequests?.items);
  return {
    success: true,
    data: {
      orders: (result?.items || []).map((order) =>
        toUiOrder(order, returns.get(String(order.id))),
      ),
      pagination: { total: result?.totalItems || 0 },
    },
  };
};

export const fetchUserOrderByIdApi = async (orderId) => {
  const data = await shopApiRequest(CUSTOMER_ORDER, { id: orderId });
  const returns = returnedRequestsByOrder(data.myReturnRequests?.items);
  return {
    success: true,
    data: { order: toUiOrder(data.order, returns.get(String(orderId))) },
  };
};
