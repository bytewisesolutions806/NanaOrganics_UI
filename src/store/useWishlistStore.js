import { create } from 'zustand';
import {
  fetchWishlistApi,
  removeFromWishlistApi,
  addToWishlistApi,
} from '@/service/WishlistService';
import { mapWishlistApiRow } from '@/lib/wishlistAdapter';

function getErrorMessage(err) {
  const d = err?.response?.data;
  if (typeof d?.message === 'string') return d.message;
  if (err?.message) return err.message;
  return 'Something went wrong';
}

const DEFAULT_LIMIT = 10;

const useWishlistStore = create((set, get) => ({
  wishlist: [],
  /** Total items in wishlist (all pages); updated by list fetch and refreshCount */
  wishlistTotal: 0,
  loading: false,
  error: null,
  removingId: null,
  pageLimit: DEFAULT_LIMIT,
  pagination: {
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  },

  fetchWishlist: async (page = 1, limit) => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('accessToken')) {
      set({
        wishlist: [],
        wishlistTotal: 0,
        loading: false,
        error: null,
        pagination: {
          page: 1,
          limit: limit ?? get().pageLimit,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      });
      return;
    }

    const lim = limit ?? get().pageLimit;
    set({ loading: true, error: null });
    try {
      const res = await fetchWishlistApi({ page, limit: lim });
      if (!res?.success) {
        throw new Error(res?.message || 'Failed to load wishlist');
      }
      const rows = res.data?.wishlist || [];
      const items = rows.map(mapWishlistApiRow).filter(Boolean);
      const pag = res.data?.pagination || {};
      const total = pag.total ?? 0;
      set({
        wishlist: items,
        wishlistTotal: total,
        pageLimit: lim,
        pagination: {
          page: pag.page ?? page,
          limit: pag.limit ?? lim,
          total,
          total_pages: pag.total_pages ?? 0,
          has_next: !!pag.has_next,
          has_prev: !!pag.has_prev,
        },
        loading: false,
      });
    } catch (err) {
      set({
        wishlist: [],
        wishlistTotal: 0,
        loading: false,
        error: getErrorMessage(err),
        pagination: {
          page: 1,
          limit: lim,
          total: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
      });
    }
  },

  /** Lightweight total for header badge (does not replace paginated list). */
  refreshWishlistCount: async () => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem('accessToken')) {
      set({ wishlistTotal: 0 });
      return;
    }
    try {
      const res = await fetchWishlistApi({ page: 1, limit: 1 });
      if (res?.success) {
        const total = res.data?.pagination?.total ?? 0;
        set({ wishlistTotal: total });
      }
    } catch {
      set({ wishlistTotal: 0 });
    }
  },

  addProduct: async (productId) => {
    const res = await addToWishlistApi(productId);
    if (!res?.success) {
      throw new Error(res?.message || 'Could not add to wishlist');
    }
    await get().refreshWishlistCount();
    return res;
  },

  /** Remove by product id without reloading paginated /wishlist list (e.g. product page). */
  removeProductById: async (productId) => {
    const res = await removeFromWishlistApi(productId);
    if (!res?.success) {
      throw new Error(res?.message || 'Could not remove from wishlist');
    }
    await get().refreshWishlistCount();
    return res;
  },

  setPage: (page) => get().fetchWishlist(page),

  removeItem: async (productId) => {
    if (!productId) return;
    set({ removingId: productId, error: null });
    try {
      const res = await removeFromWishlistApi(productId);
      if (!res?.success) {
        throw new Error(res?.message || 'Could not remove item');
      }
      const { page, wishlist } = get();
      const nextPage =
        wishlist.length <= 1 && page > 1 ? page - 1 : page;
      await get().fetchWishlist(nextPage);
      set({ removingId: null });
    } catch (err) {
      set({ removingId: null, error: getErrorMessage(err) });
    }
  },
}));

export default useWishlistStore;
