import { create } from 'zustand';
import { getCategories, getSubcategoriesByCategory } from '@/service/categoryService';

const useCategoryStore = create((set, get) => ({
  categories: [],
  megaMenu: [],
  category: null,
  subcategories: [],
  loading: false,
  error: null,
  fetched: false,

  // ================= FETCH ALL CATEGORIES =================
  fetchCategories: async (force = false) => {
    const { fetched, categories, loading } = get();

    if (loading) return;

    if (!force && fetched && categories.length > 0) {
      console.log('CategoryStore - using cached categories');
      return;
    }

    set({
      loading: true,
      error: null,
      ...(force ? { categories: [], megaMenu: [] } : {}),
    });

    try {
      const response = await getCategories();

      set({
        categories: response.data.categories || [],
        megaMenu: response.data?.mega_menu?.items || [],
        loading: false,
        fetched: true,
      });

      console.log('CategoryStore - categories fetched & cached');
    } catch (err) {
      console.error('CategoryStore - fetch failed:', err);
      set({
        loading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to load categories',
      });
    }
  },

  // ================= FETCH SINGLE CATEGORY =================
  fetchCategoryWithSubcategories: async (categoryHandle) => {
    if (!categoryHandle) return;

    set({ loading: true, error: null });

    try {
      const res = await getSubcategoriesByCategory(categoryHandle);

      if (!res?.success || !res?.data?.category) {
        throw new Error('Invalid response');
      }

      const category = res.data.category;

      set({
        category,
        subcategories: category.subcategories || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({
        category: null,
        megaMenu: [],
        subcategories: [],
        loading: false,
        error: 'Failed to load category',
      });
    }
  },

  // ================= RESET =================
  resetCategories: () =>
    set({
      categories: [],
      megaMenu: [],
      category: null,
      subcategories: [],
      loading: false,
      error: null,
      fetched: false,
    }),
}));

export default useCategoryStore;
