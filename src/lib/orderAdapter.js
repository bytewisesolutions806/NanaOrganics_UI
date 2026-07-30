/**
 * Map Medusa /user/orders API payloads to UI models used by OrderCard & order detail pages.
 */

const PLACEHOLDER_IMAGE = "/AppLogo.svg";

const MONEY_KEYS = ["value", "amount", "minor_amount", "numeric", "val"];

function collectNumericCandidates(value, out, depth = 0) {
  if (depth > 4 || value == null) return;
  if (typeof value === "number" && Number.isFinite(value)) {
    out.push(value);
    return;
  }
  if (typeof value === "bigint") {
    const n = Number(value);
    if (Number.isFinite(n)) out.push(n);
    return;
  }
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) out.push(n);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectNumericCandidates(v, out, depth + 1);
    return;
  }
  if (typeof value === "object") {
    for (const k of MONEY_KEYS) {
      if (k in value) collectNumericCandidates(value[k], out, depth + 1);
    }
    for (const v of Object.values(value)) {
      collectNumericCandidates(v, out, depth + 1);
    }
  }
}

/** Medusa money fields may serialize as { value: "10000" } — Number() would be NaN. */
function coerceMinorToInt(value) {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  if (typeof value === "bigint") {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : 0;
  }
  if (typeof value === "object") {
    for (const k of MONEY_KEYS) {
      if (k in value && value[k] != null) {
        const inner = coerceMinorToInt(value[k]);
        if (inner !== 0) return inner;
      }
    }
    if (typeof value.toNumber === "function") {
      try {
        const n = value.toNumber();
        return Number.isFinite(n) ? Math.round(n) : 0;
      } catch {
        return 0;
      }
    }

    // Fallback: parse nested objects and choose the strongest numeric candidate.
    const candidates = [];
    collectNumericCandidates(value, candidates);
    if (candidates.length) {
      const best = candidates.reduce((a, b) =>
        Math.abs(b) > Math.abs(a) ? b : a
      );
      return Math.round(best);
    }
  }
  return 0;
}

function coerceQuantity(value) {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0)
    return Math.trunc(value);
  if (typeof value === "bigint") {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
  }
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  if (typeof value === "object") {
    if ("value" in value) return coerceQuantity(value.value);
    if ("quantity" in value) return coerceQuantity(value.quantity);
  }
  return 0;
}

function lineItemMinorTotal(item) {
  const fromSub = coerceMinorToInt(item.subtotal);
  const fromTot = coerceMinorToInt(item.total);
  const fromItemSub = coerceMinorToInt(item.item_subtotal);
  const fromItemTot = coerceMinorToInt(item.item_total);
  if (fromSub > 0) return fromSub;
  if (fromTot > 0) return fromTot;
  if (fromItemSub > 0) return fromItemSub;
  if (fromItemTot > 0) return fromItemTot;

  const unit =
    coerceMinorToInt(item.unit_price) || coerceMinorToInt(item.raw_unit_price);
  let qty = coerceQuantity(item.quantity);
  if (qty <= 0) qty = coerceQuantity(item.raw_quantity);
  if (qty <= 0) qty = coerceQuantity(item.detail?.quantity);
  if (qty <= 0 && unit > 0) qty = 1;
  return unit * qty;
}

function formatMoneyMinorUnits(amount, currencyCode = "usd") {
  if (amount == null || Number.isNaN(Number(amount))) return "0.00";
  const n = Number(amount) / 100;
  const sym = String(currencyCode).toLowerCase() === "eur" ? "€" : "$";
  return `${sym}${n.toFixed(2)}`;
}

function formatMoneyMinorUnitsNumber(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return 0;
  return Math.round((Number(amount) / 100) * 100) / 100;
}

function formatShortDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatLongDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/** Ship-to / delivery block from OrderAddress (or similar flat object). */
export function buildDeliveryAddressStr(addr) {
  if (!addr || typeof addr !== "object") return "";
  const lines = [];
  const name = [addr.first_name, addr.last_name].filter(Boolean).join(" ");
  if (name) lines.push(name);
  if (addr.company) lines.push(String(addr.company));
  const street = [addr.address_1, addr.address_2].filter(Boolean).join(", ");
  if (street) lines.push(street);
  const cityLine = [addr.city, addr.province, addr.postal_code]
    .filter(Boolean)
    .join(", ");
  if (cityLine) lines.push(cityLine);
  if (addr.country_code) lines.push(String(addr.country_code).toUpperCase());
  if (addr.phone) lines.push(`Phone: ${addr.phone}`);
  return lines.join("\n");
}

/** UI status keys used by OrderCard */
export function mapOrderUiStatus(order) {
  const oStatus = String(order.status || "").toLowerCase();
  if (oStatus === "canceled" || oStatus === "cancelled") return "cancelled";

  if (order.metadata?.returned === true || order.metadata?.return_status)
    return "returned";

  const fulfillments = order.fulfillments || [];
  const f = order.fulfillment || fulfillments[0];
  if (f?.delivered_at) return "delivered";

  const fStatus = String(f?.status || "").toLowerCase();
  if (fStatus === "delivered") return "delivered";
  if (fStatus === "canceled" || fStatus === "cancelled") return "cancelled";
  if (
    fStatus === "shipped" ||
    fStatus === "partially_shipped" ||
    fStatus === "partially_delivered"
  ) {
    return "on_the_way";
  }

  if (
    oStatus === "completed" ||
    oStatus === "pending" ||
    oStatus === "archived"
  ) {
    return fulfillments.length ? "on_the_way" : "on_the_way";
  }

  return "on_the_way";
}

function buildUpdates(order, uiStatus) {
  const items = [];
  const created = order.created_at;
  if (created) {
    items.push({
      status: "Order Confirmed",
      date: formatLongDate(created),
      description: "Your order has been confirmed.",
      completed: true,
    });
  }

  const f = order.fulfillment || order.fulfillments?.[0];
  if (f?.shipped_at) {
    items.push({
      status: "Shipped",
      date: formatLongDate(f.shipped_at),
      description: "Your package has been shipped.",
      completed: true,
    });
  }

  if (f?.delivered_at) {
    items.push({
      status: "Delivered",
      date: formatLongDate(f.delivered_at),
      description: "Your order has been delivered.",
      completed: true,
    });
  } else if (uiStatus === "on_the_way") {
    items.push({
      status: "Out for Delivery",
      date: "Pending",
      description: "Your order will soon be out for delivery.",
      completed: false,
    });
  }

  if (uiStatus === "cancelled" && order.updated_at) {
    items.push({
      status: "Cancelled",
      date: formatLongDate(order.updated_at),
      description: "Your order has been cancelled.",
      completed: true,
    });
  }

  return items;
}

export function normalizeOrderFromApi(apiOrder) {
  const merged = {
    ...apiOrder,
    fulfillment: apiOrder.fulfillment || apiOrder.fulfillments?.[0],
  };
  const items = merged.items || [];
  const first = items[0];
  const uiStatus = mapOrderUiStatus(merged);
  const f = merged.fulfillment || merged.fulfillments?.[0];
  const currency = merged.currency_code || "usd";

  const name =
    items.length > 1
      ? `${first?.title || "Order"} (+${items.length - 1} more)`
      : first?.title || `Order #${merged.display_id ?? ""}`;

  const thumb = first?.thumbnail;
  const image =
    thumb && (thumb.startsWith("http") || thumb.startsWith("/"))
      ? thumb
      : PLACEHOLDER_IMAGE;

  // Sum line items + shipping in minor units (coerce BigNumber-shaped JSON).
  const computedItemsTotal = items.reduce(
    (sum, item) => sum + lineItemMinorTotal(item),
    0
  );
  const computedShippingTotal = (merged.shipping_methods || []).reduce(
    (sum, sm) => sum + coerceMinorToInt(sm?.amount),
    0
  );
  const lineTotalMinor = computedItemsTotal + computedShippingTotal;
  const serverTotal = coerceMinorToInt(merged.total);
  const graphPartsMinor =
    coerceMinorToInt(merged.subtotal) +
    coerceMinorToInt(merged.shipping_total) +
    coerceMinorToInt(merged.tax_total) -
    coerceMinorToInt(merged.discount_total);

  // Prefer per-order total from API (each order from GET /user/orders has its own total).
  // Do not use payment_collections here — those amounts often match across orders and look "cloned".
  const reliableTotal =
    serverTotal > 0
      ? serverTotal
      : lineTotalMinor > 0
        ? lineTotalMinor
        : graphPartsMinor > 0
          ? graphPartsMinor
          : 0;

  const priceNum = formatMoneyMinorUnitsNumber(reliableTotal);
  const priceLabel = formatMoneyMinorUnits(reliableTotal, currency);

  const deliveredDate = formatShortDate(f?.delivered_at);
  const shippedDate = formatShortDate(f?.shipped_at);
  const confirmedDate = formatShortDate(merged.created_at);
  const cancelDate = formatShortDate(merged.updated_at);
  const expectedDelivery = shippedDate
    ? formatShortDate(
        new Date(
          new Date(f.shipped_at).getTime() + 5 * 24 * 60 * 60 * 1000
        ).toISOString()
      )
    : formatShortDate(
        new Date(
          new Date(merged.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      );

  const timeline = [];
  if (confirmedDate) {
    timeline.push({ label: `Order Confirmed, ${confirmedDate}` });
  }
  if (uiStatus === "cancelled") {
    timeline.push({
      label: `Cancelled on ${cancelDate || "—"}`,
    });
  } else {
    if (shippedDate) {
      timeline.push({ label: `Shipped on ${shippedDate}` });
    }
    if (deliveredDate) {
      timeline.push({ label: `Delivered on ${deliveredDate}` });
    } else if (uiStatus === "on_the_way") {
      timeline.push({
        label: `Expected delivery ${expectedDelivery || "—"}`,
      });
    }
  }

  /** Full shipping block (Medusa OrderAddress — include name, phone). */
  const deliveryAddressStr = buildDeliveryAddressStr(merged.shipping_address);

  return {
    ...merged,
    uiStatus,
    status: uiStatus,
    name,
    weight: first?.quantity ? `${first.quantity} qty` : "",
    price: priceNum,
    priceLabel,
    image,
    currency_code: currency,
    deliveredDate,
    shippedDate,
    confirmedDate,
    cancelDate,
    returnDate: formatShortDate(merged.metadata?.returned_at),
    expectedDelivery,
    updates: buildUpdates(merged, uiStatus),
    items,
    deliveryAddressStr,
    subtotalDisplay: formatMoneyMinorUnits(
      computedItemsTotal || coerceMinorToInt(merged.subtotal),
      currency
    ),
    taxDisplay: formatMoneyMinorUnits(coerceMinorToInt(merged.tax_total), currency),
    shippingDisplay: formatMoneyMinorUnits(
      computedShippingTotal || coerceMinorToInt(merged.shipping_total),
      currency
    ),
    discountDisplay: formatMoneyMinorUnits(coerceMinorToInt(merged.discount_total), currency),
    totalDisplay: formatMoneyMinorUnits(reliableTotal, currency),
    timeline,
  };
}

/** Normalize single-order response { data: { order } } */
export function normalizeOrderDetailPayload(res) {
  const raw = res?.data?.order;
  if (!raw) return null;
  return normalizeOrderFromApi(raw);
}

export function filterOrdersBySelections(orders, selectedFilters) {
  const { status: statusSel = [], orderTime: timeSel = [] } =
    selectedFilters || {};
  let list = [...orders];

  if (statusSel.length) {
    list = list.filter((o) => statusSel.includes(o.uiStatus || o.status));
  }

  if (timeSel.length) {
    const now = new Date();
    const currentYear = now.getFullYear();
    list = list.filter((o) => {
      const d = new Date(o.created_at);
      return timeSel.some((t) => {
        if (t === "this_week") {
          const start = new Date(now);
          start.setDate(now.getDate() - 7);
          return d >= start;
        }
        if (t === "last_30_days") {
          const start = new Date(now);
          start.setDate(now.getDate() - 30);
          return d >= start;
        }
        if (t.startsWith("year_")) {
          const yy = parseInt(t.replace("year_", ""), 10);
          if (!Number.isNaN(yy)) return d.getFullYear() === yy;
        }
        if (t === "older") return d.getFullYear() < currentYear;
        return true;
      });
    });
  }

  return list;
}
