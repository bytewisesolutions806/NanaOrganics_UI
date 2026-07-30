import { create } from 'zustand';
import { searchProducts } from '@/service/ProductSearchService';

export const useProductSearchStore = create((set, get) => ({
  products: [],
  aggregations: null,
  pagination: null,
  loading: false,
  error: null,

  filters: {
    q: '',
    category: null,
    brand: [],
    min_price: null,
    max_price: null,
    availability: [],
    min_rating: null,
    dietary: [],
    discount: null,
    in_stock: false,
    sort: 'newest',
    limit: 12,
    offset: 0,
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        offset: 0, // reset pagination on filter change
      },
    })),

  resetFilters: () =>
    set({
      filters: {
        q: '',
        category: null,
        brand: [],
        min_price: null,
        max_price: null,
        availability: [],
        min_rating: null,
        dietary: [],
        discount: null,
        in_stock: false,
        sort: 'newest',
        limit: 12,
        offset: 0,
      },
    }),

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });

      // 🔥 GET FILTERS FROM STORE
      const { filters } = get();

      set({
        loading: true,
        error: null,
        products: [], // ✅ CLEAR OLD PRODUCTS
      });
      console.log('🔍 Filters used for search:', filters);

      // 🔥 PASS FILTERS HERE
      const res = await searchProducts(filters);

      set({
        products: res?.data?.products ?? [],
        pagination: res?.data?.pagination ?? null,
        aggregations: res?.data?.aggregations ?? null,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({
        loading: false,
        error: 'Failed to fetch products',
        products: [],
      });
    }
  },
}));
