import { create } from 'zustand';
import { getHomeData } from '@/service/HomeService';

let latestHomeRequest = 0;

export const useHomeStore = create((set) => ({
  loading: false,
  error: null,
  activeBrandSlug: null,

  // ✅ individual sections
  heroSection: null,
  categories: [],
  collections: [],
  homepageVideo: null,
  homepageSettings: null,
  trendingNow: null,
  newArrivals: null,
  featuredCollections: null,
  testimonials: [],
  stats: null,

  fetchHome: async (brandSlug) => {
    const requestId = ++latestHomeRequest;
    try {
      set({
        loading: true,
        error: null,
        activeBrandSlug: null,
        collections: [],
        homepageVideo: null,
        homepageSettings: null,
      });

      const response = await getHomeData({ brandSlug });
      if (requestId !== latestHomeRequest) return;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to load home data');
      }

      const data = response.data;
      const collections = data.collections || [];

      set({
        heroSection: data.hero,
        categories: data.categories || [],
        collections: collections,
        homepageVideo: data.homepageVideo || null,
        homepageSettings: data.homepageSettings || null,
        testimonials: data.testimonials || [],
        stats: data.stats || null,
        activeBrandSlug: brandSlug || null,
        loading: false,
      });
    } catch (err) {
      if (requestId !== latestHomeRequest) return;
      console.error('Home data error:', err);

      set({
        error: err?.message || 'Something went wrong',
        loading: false,
      });
    }
  },
}));
