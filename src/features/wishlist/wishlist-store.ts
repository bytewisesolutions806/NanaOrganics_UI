"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  addWishlistProduct,
  clearWishlist,
  getWishlistProductIds,
  removeWishlistProduct,
} from "@/services/api/account";
import { AUTH_STATE_CHANGED_EVENT } from "@/services/api/auth";

interface WishlistSnapshot {
  productIds: ReadonlySet<string>;
  pendingIds: ReadonlySet<string>;
  count: number;
  loaded: boolean;
  error: string;
}

const emptyIds = new Set<string>();
const serverSnapshot: WishlistSnapshot = {
  productIds: emptyIds,
  pendingIds: emptyIds,
  count: 0,
  loaded: false,
  error: "",
};

let snapshot = serverSnapshot;
let loadPromise: Promise<void> | null = null;
let authListenerAttached = false;
const listeners = new Set<() => void>();

function publish(next: WishlistSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not update your wishlist.";
}

export async function refreshWishlist() {
  if (loadPromise) return loadPromise;
  loadPromise = getWishlistProductIds()
    .then((productIds) => {
      publish({
        productIds,
        pendingIds: new Set(),
        count: productIds.size,
        loaded: true,
        error: "",
      });
    })
    .catch((error: unknown) => {
      publish({
        productIds: new Set(),
        pendingIds: new Set(),
        count: 0,
        loaded: true,
        error: errorMessage(error),
      });
    })
    .finally(() => {
      loadPromise = null;
    });
  return loadPromise;
}

function setPending(productId: string, pending: boolean) {
  const pendingIds = new Set(snapshot.pendingIds);
  if (pending) pendingIds.add(productId);
  else pendingIds.delete(productId);
  publish({ ...snapshot, pendingIds, error: "" });
}

export async function toggleWishlistProduct(productId: string) {
  const normalizedId = String(productId);
  if (snapshot.pendingIds.has(normalizedId)) return;
  const wasSaved = snapshot.productIds.has(normalizedId);
  const optimisticIds = new Set(snapshot.productIds);
  if (wasSaved) optimisticIds.delete(normalizedId);
  else optimisticIds.add(normalizedId);
  publish({
    ...snapshot,
    productIds: optimisticIds,
    pendingIds: new Set([...snapshot.pendingIds, normalizedId]),
    count: optimisticIds.size,
    error: "",
  });
  try {
    if (wasSaved) await removeWishlistProduct(normalizedId);
    else await addWishlistProduct(normalizedId);
    setPending(normalizedId, false);
  } catch (error) {
    const revertedIds = new Set(snapshot.productIds);
    if (wasSaved) revertedIds.add(normalizedId);
    else revertedIds.delete(normalizedId);
    publish({
      ...snapshot,
      productIds: revertedIds,
      pendingIds: new Set([...snapshot.pendingIds].filter((id) => id !== normalizedId)),
      count: revertedIds.size,
      error: errorMessage(error),
    });
    throw error;
  }
}

export async function removeProductFromSharedWishlist(productId: string) {
  const normalizedId = String(productId);
  if (!snapshot.productIds.has(normalizedId)) {
    await removeWishlistProduct(normalizedId);
    await refreshWishlist();
    return;
  }
  await toggleWishlistProduct(normalizedId);
}

export async function clearSharedWishlist() {
  const previousIds = snapshot.productIds;
  publish({ ...snapshot, productIds: new Set(), count: 0, error: "" });
  try {
    await clearWishlist();
  } catch (error) {
    publish({ ...snapshot, productIds: previousIds, count: previousIds.size, error: errorMessage(error) });
    throw error;
  }
}

export function resetWishlist() {
  loadPromise = null;
  publish({ ...serverSnapshot, productIds: new Set(), pendingIds: new Set() });
}

function ensureWishlistInitialized() {
  if (!snapshot.loaded && !loadPromise) void refreshWishlist();
  if (!authListenerAttached) {
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthChange);
    authListenerAttached = true;
  }
}

function handleAuthChange() {
  resetWishlist();
  void refreshWishlist();
}

export function useWishlist() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  useEffect(() => {
    const start = window.setTimeout(ensureWishlistInitialized, 0);
    return () => window.clearTimeout(start);
  }, []);
  return current;
}
