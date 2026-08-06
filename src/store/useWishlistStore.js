import { create } from 'zustand';
import {
  addToWishlistApi,
  clearWishlistApi,
  fetchAllWishlistProductIds,
  fetchWishlistApi,
  removeFromWishlistApi,
} from '@/service/WishlistService';
import { mapWishlistApiRow } from '@/lib/wishlistAdapter';

function getErrorMessage(error) {
  const graphqlMessage = error?.response?.errors?.[0]?.message;
  if (graphqlMessage) return graphqlMessage;
  if (error?.message) return error.message;
  return 'Something went wrong';
}

const DEFAULT_LIMIT = 10;
let productIdsRequest = null;

const emptyPagination = (limit = DEFAULT_LIMIT) => ({
  page: 1,
  limit,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
});

const hasAccessToken = () =>
  typeof window !== 'undefined' && !!sessionStorage.getItem('accessToken');

const useWishlistStore = create((set, get) => ({
  wishlist: [],
  wishlistTotal: 0,
  wishlistProductIds: new Set(),
  wishlistIdsLoaded: false,
  wishlistIdsLoading: false,
  loading: false,
  clearing: false,
  error: null,
  removingId: null,
  pageLimit: DEFAULT_LIMIT,
  pagination: emptyPagination(),

  resetWishlist: () => {
    productIdsRequest = null;
    set({
      wishlist: [],
      wishlistTotal: 0,
      wishlistProductIds: new Set(),
      wishlistIdsLoaded: false,
      wishlistIdsLoading: false,
      loading: false,
      clearing: false,
      error: null,
      removingId: null,
      pagination: emptyPagination(get().pageLimit),
    });
  },

  fetchWishlistProductIds: async ({ force = false } = {}) => {
    if (!hasAccessToken()) {
      get().resetWishlist();
      return new Set();
    }
    if (get().wishlistIdsLoaded && !force) return get().wishlistProductIds;
    if (productIdsRequest) return productIdsRequest;

    set({ wishlistIdsLoading: true });
    productIdsRequest = fetchAllWishlistProductIds()
      .then((ids) => {
        set({
          wishlistProductIds: ids,
          wishlistIdsLoaded: true,
          wishlistIdsLoading: false,
        });
        return ids;
      })
      .catch((error) => {
        set({ wishlistIdsLoading: false });
        throw error;
      })
      .finally(() => {
        productIdsRequest = null;
      });
    return productIdsRequest;
  },

  fetchWishlist: async (page = 1, limit) => {
    const normalizedLimit = limit ?? get().pageLimit;
    if (!hasAccessToken()) {
      get().resetWishlist();
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetchWishlistApi({ page, limit: normalizedLimit });
      const rows = response.data?.wishlist || [];
      const items = rows.map(mapWishlistApiRow).filter(Boolean);
      const pagination = response.data?.pagination || emptyPagination(normalizedLimit);
      set({
        wishlist: items,
        wishlistTotal: pagination.total ?? 0,
        pageLimit: normalizedLimit,
        pagination,
        loading: false,
      });
    } catch (error) {
      set({
        wishlist: [],
        wishlistTotal: 0,
        loading: false,
        error: getErrorMessage(error),
        pagination: emptyPagination(normalizedLimit),
      });
    }
  },

  refreshWishlistCount: async () => {
    if (!hasAccessToken()) {
      set({ wishlistTotal: 0 });
      return;
    }
    try {
      const response = await fetchWishlistApi({ page: 1, limit: 1 });
      set({ wishlistTotal: response.data?.pagination?.total ?? 0 });
    } catch {
      set({ wishlistTotal: 0 });
    }
  },

  addProduct: async (productId) => {
    const normalizedId = String(productId);
    const response = await addToWishlistApi(normalizedId);
    if (!response?.success) {
      throw new Error(response?.message || 'Could not add to wishlist');
    }
    set((state) => ({
      wishlistProductIds: new Set([...state.wishlistProductIds, normalizedId]),
      wishlistIdsLoaded: true,
    }));
    await get().refreshWishlistCount();
    return response;
  },

  removeProductById: async (productId) => {
    const normalizedId = String(productId);
    const response = await removeFromWishlistApi(normalizedId);
    if (!response?.success) {
      throw new Error(response?.message || 'Could not remove from wishlist');
    }
    set((state) => {
      const ids = new Set(state.wishlistProductIds);
      ids.delete(normalizedId);
      return { wishlistProductIds: ids };
    });
    await get().refreshWishlistCount();
    return response;
  },

  setPage: (page) => get().fetchWishlist(page),

  removeItem: async (productId) => {
    if (!productId) return;
    const normalizedId = String(productId);
    set({ removingId: normalizedId, error: null });
    try {
      await get().removeProductById(normalizedId);
      const { pagination, wishlist } = get();
      const nextPage =
        wishlist.length <= 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;
      await get().fetchWishlist(nextPage);
      set({ removingId: null });
    } catch (error) {
      set({ removingId: null, error: getErrorMessage(error) });
    }
  },

  clearWishlist: async () => {
    set({ clearing: true, error: null });
    try {
      const response = await clearWishlistApi();
      if (!response?.success) {
        throw new Error(response?.message || 'Could not clear wishlist');
      }
      set({
        wishlist: [],
        wishlistTotal: 0,
        wishlistProductIds: new Set(),
        wishlistIdsLoaded: true,
        clearing: false,
        pagination: emptyPagination(get().pageLimit),
      });
    } catch (error) {
      set({ clearing: false, error: getErrorMessage(error) });
    }
  },
}));

export default useWishlistStore;
