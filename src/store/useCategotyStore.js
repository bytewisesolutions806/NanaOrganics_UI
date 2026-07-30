import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCategories, getSubcategoriesByCategory } from '@/service/categoryService';

const useCategoryStore = create(
  persist(
    (set, get) => ({
      categories: [],
      megaMenu: [],
      category: null,
      subcategories: [],
      loading: false,
      error: null,
      fetched: false,

      // ================= FETCH ALL CATEGORIES =================
      fetchCategories: async () => {
        if (get().fetched) {
          console.log('CategoryStore - using cached categories');
          return;
        }

        set({ loading: true, error: null });

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
    }),
    {
      name: 'category-store', // 🔑 localStorage key

      // ⛔ Persist only what matters
      version: 3,
      migrate: () => ({
        categories: [],
        megaMenu: [],
        fetched: false,
      }),
      partialize: (state) => ({
        categories: state.categories,
        megaMenu: state.megaMenu,
        fetched: state.fetched,
      }),
    }
  )
);

export default useCategoryStore;
