import HomePageClient from './HomePageClient';
import { getHomepagePageData } from '@/lib/homepageData';

export const revalidate = 300;

const EMPTY_HOME_DATA = {
  collections: [],
  homepageVideo: null,
  testimonials: [],
  stats: null,
};

export default async function HomePage() {
  let homeData = EMPTY_HOME_DATA;
  let categories = [];

  try {
    const pageData = await getHomepagePageData();
    homeData = pageData.homeData;
    categories = pageData.categories;
  } catch (error) {
    console.error('Could not pre-render homepage commerce data', error);
  }

  return <HomePageClient initialHomeData={homeData} initialCategories={categories} />;
}
