import ProductSlider from '@/components/ProductSlider';
import ExploreOrganicOfferings from '@/components/BannerOrganic';
import NaturePromoBanner from '@/components/ShopDiscovery/NaturePromoBanner';
import ShopCategoryCarousel from '@/components/ShopDiscovery/ShopCategoryCarousel';
import { getAllCollections } from '@/graphql/queries/collections';
import { getHomeData } from '@/service/HomeService';

export const dynamic = 'force-dynamic';

function findSection(collections, ...handles) {
  return handles
    .map((handle) => collections.find((collection) => collection.handle === handle))
    .find((collection) => collection?.products?.length > 0);
}

export default async function ShopPage() {
  const [categoryResult, discoveryResult] = await Promise.allSettled([
    getAllCollections({
      topLevelOnly: true,
      skip: 0,
      take: 100,
      sort: { position: 'ASC' },
    }),
    getHomeData(),
  ]);

  const categories =
    categoryResult.status === 'fulfilled' ? categoryResult.value?.items || [] : [];
  const categoryError =
    categoryResult.status === 'rejected'
      ? categoryResult.reason?.message || 'Could not load categories.'
      : '';
  const collections =
    discoveryResult.status === 'fulfilled'
      ? discoveryResult.value?.data?.collections || []
      : [];
  const discoveryError =
    discoveryResult.status === 'rejected'
      ? discoveryResult.reason?.message || 'Could not load product recommendations.'
      : '';

  const bestDeals = findSection(collections, 'deals', 'trending', 'featured');
  const relatedProducts = findSection(collections, 'trending', 'featured', 'new-arrivals');
  // Personalized recommendations are only returned for signed-in requests.
  // Best sellers and featured products provide a useful public fallback.
  const recommended = findSection(
    collections,
    'recommended',
    'best-sellers',
    'featured',
  );

  return (
    <main className="pb-20 pt-10">
      <ShopCategoryCarousel categories={categories} error={categoryError} />

      {discoveryError ? (
        <p
          className="mx-auto mt-10 w-[calc(100%_-_40px)] max-w-[1298px] rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          role="alert"
        >
          {discoveryError}
        </p>
      ) : null}

      <div className="mt-12 md:mt-16 lg:mt-20">
        <NaturePromoBanner variant="nature" />
      </div>

      <ProductSlider
        title="Best Deal"
        subtitle="Our most loved products this season."
        products={bestDeals?.products || []}
        browseLink="/deals"
        sectionClass="w-full py-12 md:py-16 lg:py-20"
        designVariant="figma"
      />

      <NaturePromoBanner variant="spices" />

      <ProductSlider
        title="Related Products"
        subtitle="Popular organic products shoppers are exploring now."
        products={relatedProducts?.products || []}
        browseLink="/shop"
        sectionClass="w-full py-12 md:py-16 lg:py-20"
        designVariant="figma"
      />

      <ProductSlider
        title="Recommended for You"
        subtitle="Customer favourites and hand-picked recommendations."
        products={recommended?.products || []}
        browseLink="/shop"
        sectionClass="w-full pb-12 md:pb-16 lg:pb-20"
        designVariant="figma"
      />

      <ExploreOrganicOfferings />
    </main>
  );
}
