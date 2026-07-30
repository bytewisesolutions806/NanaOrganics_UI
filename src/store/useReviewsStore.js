import { create } from "zustand";
import { reviewsMock } from "@/mocks/reviewsMock";
import {
  fetchUserReviewsApi,
  patchUserReviewApi,
  deleteUserReviewApi,
} from "@/service/ReviewsService";

const useMockApi = () => process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

/** Mock-only: so deletes persist while paginating */
const mockDeletedReviewIds = new Set();

function mockToApiShape(m) {
  return {
    id: m.id,
    product_id: "mock_product",
    product_title: m.productName,
    product_handle: "",
    product_thumbnail: m.image || "/AppLogo.svg",
    rating: m.rating,
    title: null,
    content: m.review || "",
    is_verified_purchase: false,
    status: "approved",
    helpful_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: Array.isArray(m.images) ? m.images : [],
  };
}

const useReviewsStore = create((set, get) => ({
  reviews: [],
  loading: false,
  error: null,

  page: 1,
  pageSize: 10,
  total: 0,

  editModal: false,
  deleteModal: false,
  selectedReview: null,

  actionLoading: false,
  actionError: null,

  /**
   * Load one page from the API (1-based page index).
   */
  fetchPage: async (pageNum) => {
    const page = Math.max(1, pageNum);
    const pageSize = get().pageSize;

    set({
      loading: true,
      error: null,
    });

    try {
      if (useMockApi()) {
        await new Promise((r) => setTimeout(r, 300));
        const mapped = reviewsMock
          .filter((m) => !mockDeletedReviewIds.has(m.id))
          .map(mockToApiShape);
        const total = mapped.length;
        const offset = (page - 1) * pageSize;
        const slice = mapped.slice(offset, offset + pageSize);
        set({
          reviews: slice,
          total,
          page,
          loading: false,
        });
        return;
      }

      const offset = (page - 1) * pageSize;
      const res = await fetchUserReviewsApi({
        limit: pageSize,
        offset,
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to load reviews");
      }

      const list = res.data?.reviews || [];
      const pagination = res.data?.pagination || {};
      const total = pagination.total ?? list.length;

      const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1);
      const safePage = Math.min(page, maxPage);

      if (safePage !== page) {
        set({ page: safePage });
        return get().fetchPage(safePage);
      }

      set({
        reviews: list,
        total,
        page,
        loading: false,
      });
    } catch (e) {
      set({
        error: e?.message || "Failed to load reviews",
        loading: false,
        reviews: [],
        total: 0,
        page: 1,
      });
    }
  },

  /** Refetch page 1 (e.g. after submitting a review elsewhere) */
  refreshReviews: async () => {
    await get().fetchPage(1);
  },

  updateReview: async (reviewId, productId, payload) => {
    set({ actionLoading: true, actionError: null });
    try {
      if (useMockApi()) {
        await new Promise((r) => setTimeout(r, 250));
        set((state) => ({
          reviews: state.reviews.map((rev) =>
            rev.id === reviewId
              ? {
                  ...rev,
                  ...payload,
                  updated_at: new Date().toISOString(),
                }
              : rev
          ),
          editModal: false,
          selectedReview: null,
          actionLoading: false,
        }));
        return { ok: true };
      }

      const res = await patchUserReviewApi(reviewId, {
        product_id: productId,
        ...payload,
      });
      if (!res?.success) {
        throw new Error(res?.message || "Update failed");
      }
      const updated = res.data?.review;
      set((state) => ({
        reviews: state.reviews.map((rev) =>
          rev.id === reviewId ? { ...rev, ...updated } : rev
        ),
        editModal: false,
        selectedReview: null,
        actionLoading: false,
      }));
      return { ok: true };
    } catch (e) {
      set({
        actionError: e?.message || "Failed to update review",
        actionLoading: false,
      });
      return { ok: false, error: e?.message };
    }
  },

  deleteReview: async (reviewId, productId) => {
    set({ actionLoading: true, actionError: null });
    try {
      const { page, pageSize, total } = get();

      if (useMockApi()) {
        await new Promise((r) => setTimeout(r, 250));
        mockDeletedReviewIds.add(reviewId);
        const newTotal = Math.max(
          0,
          reviewsMock.filter((m) => !mockDeletedReviewIds.has(m.id)).length
        );
        const maxPage = Math.max(1, Math.ceil(newTotal / pageSize) || 1);
        const targetPage = Math.min(page, maxPage);
        set({
          deleteModal: false,
          selectedReview: null,
          actionLoading: false,
        });
        await get().fetchPage(targetPage);
        return { ok: true };
      }

      const res = await deleteUserReviewApi(reviewId, productId);
      if (!res?.success) {
        throw new Error(res?.message || "Delete failed");
      }
      const newTotal = Math.max(0, total - 1);
      const maxPage = Math.max(1, Math.ceil(newTotal / pageSize) || 1);
      const targetPage = Math.min(page, maxPage);
      set({
        deleteModal: false,
        selectedReview: null,
        actionLoading: false,
      });
      await get().fetchPage(targetPage);
      return { ok: true };
    } catch (e) {
      set({
        actionError: e?.message || "Failed to delete review",
        actionLoading: false,
      });
      return { ok: false, error: e?.message };
    }
  },

  openEditModal: (review) =>
    set({
      editModal: true,
      selectedReview: review,
      actionError: null,
    }),

  closeEditModal: () =>
    set({
      editModal: false,
      selectedReview: null,
      actionError: null,
    }),

  openDeleteModal: (review) =>
    set({
      deleteModal: true,
      selectedReview: review,
      actionError: null,
    }),

  closeDeleteModal: () =>
    set({
      deleteModal: false,
      selectedReview: null,
      actionError: null,
    }),

  getAverageRating: () => {
    const { reviews } = get();
    if (!reviews.length) return 0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  },

  getReviewCount: () => get().total,
}));

export default useReviewsStore;
