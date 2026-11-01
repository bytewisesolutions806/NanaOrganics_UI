"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  addCartItem as addCartItemRequest,
  adjustCartLine as adjustCartLineRequest,
  applyCoupon as applyCouponRequest,
  clearCart as clearCartRequest,
  getActiveOrder,
  removeCartLine as removeCartLineRequest,
  removeCoupon as removeCouponRequest,
  type CartOrder,
} from "@/services/api/checkout";
import { AUTH_STATE_CHANGED_EVENT } from "@/services/api/auth";

interface CartSnapshot { order: CartOrder | null; loading: boolean; loaded: boolean; error: string }
const serverSnapshot: CartSnapshot = { order: null, loading: false, loaded: false, error: "" };
let snapshot = serverSnapshot;
let promise: Promise<CartOrder | null> | null = null;
let authAttached = false;
const listeners = new Set<() => void>();

function publish(next: CartSnapshot) { snapshot = next; listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }
function currentSnapshot() { return snapshot; }
function errorText(error: unknown) { return error instanceof Error ? error.message : "The cart could not be updated."; }

export async function refreshCart() {
  if (promise) return promise;
  publish({ ...snapshot, loading: true, error: "" });
  promise = getActiveOrder()
    .then((order) => { publish({ order, loading: false, loaded: true, error: "" }); return order; })
    .catch((error: unknown) => { publish({ ...snapshot, loading: false, loaded: true, error: errorText(error) }); throw error; })
    .finally(() => { promise = null; });
  return promise;
}

async function mutate(action: () => Promise<CartOrder>) {
  publish({ ...snapshot, loading: true, error: "" });
  try {
    const order = await action();
    publish({ order, loading: false, loaded: true, error: "" });
    return order;
  } catch (error) {
    publish({ ...snapshot, loading: false, error: errorText(error) });
    throw error;
  }
}

export const addItemToCart = (variantId: string, quantity: number) => mutate(() => addCartItemRequest(variantId, quantity));
export const updateCartLine = (lineId: string, quantity: number) => mutate(() => adjustCartLineRequest(lineId, quantity));
export const removeItemFromCart = (lineId: string) => mutate(() => removeCartLineRequest(lineId));
export const emptyCart = () => mutate(clearCartRequest);
export const applyCartCoupon = (code: string) => mutate(() => applyCouponRequest(code));
export const removeCartCoupon = (code: string) => mutate(() => removeCouponRequest(code));
export function setCartOrder(order: CartOrder | null) { publish({ order, loading: false, loaded: true, error: "" }); }
export function resetCartStore() { promise = null; publish({ ...serverSnapshot }); }

function initialize() {
  if (!snapshot.loaded && !promise) void refreshCart().catch(() => undefined);
  if (!authAttached) {
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, () => { resetCartStore(); void refreshCart().catch(() => undefined); });
    authAttached = true;
  }
}

export function useCart() {
  const value = useSyncExternalStore(subscribe, currentSnapshot, () => serverSnapshot);
  useEffect(() => { const timer = window.setTimeout(initialize, 0); return () => window.clearTimeout(timer); }, []);
  return { ...value, count: value.order?.totalQuantity ?? 0 };
}
