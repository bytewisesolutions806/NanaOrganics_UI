import 'server-only';

import { unstable_cache } from 'next/cache';
import { getHomeData } from '@/service/HomeService';
import { getCachedCategories } from '@/lib/publicCatalogData';

const CACHE_SECONDS = 300;

const getCachedHomeData = unstable_cache(
  () => getHomeData(),
  ['nana-organics-homepage-data-v1'],
  { revalidate: CACHE_SECONDS, tags: ['homepage-data'] },
);

export async function getHomepagePageData() {
  const [homeResponse, categoryResponse] = await Promise.all([
    getCachedHomeData(),
    getCachedCategories(),
  ]);

  return {
    homeData: homeResponse?.data || {
      collections: [],
      homepageVideo: null,
      testimonials: [],
      stats: null,
    },
    categories: categoryResponse || [],
  };
}
