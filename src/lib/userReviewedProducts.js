import { fetchUserReviewsApi } from '@/service/ReviewsService';

/**
 * @returns {Promise<{ orderIds: Set<string>, legacyProductIds: Set<string> }>}
 * `orderIds` — reviews submitted with `order_id` (preferred).
 * `legacyProductIds` — old reviews with no `order_id` (product-level only).
 */
export async function loadOrderReviewLookup() {
  try {
    const res = await fetchUserReviewsApi({ limit: 500, offset: 0 });
    if (!res?.success) {
      return { orderIds: new Set(), legacyProductIds: new Set() };
    }
    const orderIds = new Set();
    const legacyProductIds = new Set();
    for (const r of res.data?.reviews || []) {
      if (r.order_id) {
        orderIds.add(String(r.order_id));
      } else if (r.product_id) {
        legacyProductIds.add(String(r.product_id));
      }
    }
    return { orderIds, legacyProductIds };
  } catch {
    return { orderIds: new Set(), legacyProductIds: new Set() };
  }
}
