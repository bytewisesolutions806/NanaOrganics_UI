import { create } from 'zustand';
import { getHomeData } from '@/service/HomeService';

export const useHomeStore = create((set) => ({
  loading: false,
  error: null,

  // ✅ individual sections
  heroSection: null,
  categories: [],
  collections: [],
  trendingNow: null,
  newArrivals: null,
  featuredCollections: null,
  testimonials: [],
  stats: null,

  fetchHome: async () => {
    try {
      set({ loading: true, error: null });

      const response = await getHomeData();
      console.log('HomeStore fetched data:', response);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to load home data');
      }

      const data = response.data;
      const collections = data.collections || [];

      set({
        heroSection: data.hero,
        categories: data.categories || [],
        collections: collections,
        testimonials: data.testimonials || [],
        stats: data.stats || null,
        loading: false,
      });
    } catch (err) {
      console.error('Home data error:', err);

      set({
        error: err?.message || 'Something went wrong',
        loading: false,
      });
    }
  },
}));
