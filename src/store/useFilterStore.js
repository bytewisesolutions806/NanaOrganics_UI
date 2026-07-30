import { create } from 'zustand';
import { getFiltersData } from '@/service/filterService';
import { useProductSearchStore } from '@/store/useProductSearchStore';

export const useFilterStore = create((set, get) => ({
  /* =====================
     API FILTER META
     ===================== */
  filters: null,
  loading: false,
  error: null,

  /* =====================
     SELECTED FILTERS
     ===================== */
  selected: {
    categories: [],
    brands: [],
    size: null, // 👈 single selection
    discount: null,
    rating: null, // 👈 NEW (number)
    dietary: [],
    price: [0, 0],
  },

  /* =====================
     FETCH FILTERS
     ===================== */
  fetchFilters: async ({ category, subcategory } = {}) => {
    set({ loading: true, error: null });

    try {
      const res = await getFiltersData({ category, subcategory });
      const data = res.data;

      set({
        filters: data,
        selected: {
          categories: [],
          brands: [],
          size: null,
          discount: null,
          rating: null, // 👈 NEW (number)
          dietary: [],
          price: [data.price_range.min, data.price_range.max],
        },
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ error: 'Failed to load filters', loading: false });
    }
  },

  /* =====================
     TOGGLES
     ===================== */
  toggleCategory: (id) =>
    set((state) => ({
      selected: {
        ...state.selected,
        categories: state.selected.categories.includes(id)
          ? state.selected.categories.filter((c) => c !== id)
          : [...state.selected.categories, id],
      },
    })),

  // toggleBrand: (name) =>
  //   set((state) => ({
  //     selected: {
  //       ...state.selected,
  //       brands: state.selected.brands.includes(name)
  //         ? state.selected.brands.filter((b) => b !== name)
  //         : [...state.selected.brands, name],
  //     },
  //   })),

  toggleBrand: (name) => {
    const { selected } = get();

    const updatedBrands = selected.brands.includes(name)
      ? selected.brands.filter((b) => b !== name)
      : [...selected.brands, name];

    // 1️⃣ Update filter UI state
    set({
      selected: {
        ...selected,
        brands: updatedBrands,
      },
    });

    // 2️⃣ Sync to search store
    const searchStore = useProductSearchStore.getState();

    searchStore.setFilter('brand', updatedBrands);

    // 3️⃣ Trigger API
    searchStore.fetchProducts();
  },

  toggleSize: (size) => {
    const { selected } = get();

    // 1️⃣ Update UI filter state
    set({
      selected: {
        ...selected,
        size,
      },
    });

    // 2️⃣ Sync with search store (availability is ARRAY)
    const searchStore = useProductSearchStore.getState();

    searchStore.setFilter('availability', size ? [size] : []);

    // 3️⃣ Trigger API
    searchStore.fetchProducts();
  },

  setDiscount: (discount) =>
    set((state) => ({
      selected: { ...state.selected, discount },
    })),

  setPrice: (price) => {
    set((state) => ({
      selected: { ...state.selected, price },
    }));

    const productSearch = useProductSearchStore.getState();

    productSearch.setFilter('min_price', price[0]);
    productSearch.setFilter('max_price', price[1]);

    productSearch.fetchProducts();
  },

  setRating: (rating) => {
    set((state) => ({
      selected: { ...state.selected, rating },
    }));

    // 🔥 sync with product search store
    const productSearch = useProductSearchStore.getState();

    productSearch.setFilter('min_rating', rating);
    productSearch.fetchProducts();
  },

  toggleDietary: (option) =>
    set((state) => ({
      selected: {
        ...state.selected,
        dietary: state.selected.dietary.includes(option)
          ? state.selected.dietary.filter((d) => d !== option)
          : [...state.selected.dietary, option],
      },
    })),

  /* =====================
     CLEAR
     ===================== */
  clearFilters: () => {
    const meta = get().filters;

    // 1️⃣ reset filter UI state
    set({
      selected: {
        categories: [],
        brands: [],
        size: null,
        discount: null,
        rating: null,
        dietary: [],
        price: meta ? [meta.price_range.min, meta.price_range.max] : [0, 0],
      },
    });

    // 2️⃣ reset product search filters
    const productSearch = useProductSearchStore.getState();

    productSearch.resetFilters();

    // 3️⃣ fetch products again (no filters)
    productSearch.fetchProducts();
  },
}));
