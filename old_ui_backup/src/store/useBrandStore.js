import { create } from 'zustand';
import { getShopBrands } from '@/service/BrandService';

const BRAND_TTL_MS = 5 * 60 * 1000;
const SELECTED_BRAND_KEY = 'selected_brand_slug';

const useBrandStore = create((set, get) => ({
  brands: [],
  selectedBrandSlug: null,
  loading: false,
  error: null,
  fetchedAt: 0,

  fetchBrands: async (force = false) => {
    const { loading, brands, fetchedAt } = get();
    if (loading) return;
    if (!force && brands.length && Date.now() - fetchedAt < BRAND_TTL_MS) return;

    set({ loading: true, error: null });
    try {
      const availableBrands = await getShopBrands();
      const savedSlug =
        typeof window !== 'undefined' ? window.localStorage.getItem(SELECTED_BRAND_KEY) : null;
      const currentSlug = get().selectedBrandSlug;
      const selectedBrandSlug = availableBrands.some((brand) => brand.slug === savedSlug)
        ? savedSlug
        : availableBrands.some((brand) => brand.slug === currentSlug)
          ? currentSlug
          : availableBrands[0]?.slug || null;

      set({
        brands: availableBrands,
        selectedBrandSlug,
        loading: false,
        error: null,
        fetchedAt: Date.now(),
      });

      if (selectedBrandSlug && typeof window !== 'undefined') {
        window.localStorage.setItem(SELECTED_BRAND_KEY, selectedBrandSlug);
      }
    } catch (error) {
      console.error('BrandStore - failed to load storefront brands:', error);
      set({
        loading: false,
        error: error?.message || 'Failed to load brands',
      });
    }
  },

  selectBrand: (slug) => {
    const brandExists = get().brands.some((brand) => brand.slug === slug);
    if (!brandExists) return;

    set({ selectedBrandSlug: slug });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SELECTED_BRAND_KEY, slug);
    }
  },
}));

export default useBrandStore;
