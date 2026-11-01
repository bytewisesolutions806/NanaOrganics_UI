'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import Category from '@/components/Category';
import HomeBrandStory from '@/components/Homepage/HomeBrandStory';
import HomeBrandValues from '@/components/Homepage/HomeBrandValues';
import HomeHero from '@/components/Homepage/HomeHero';
import HomeLoadError from '@/components/Homepage/HomeLoadError';
import HomeProductSections from '@/components/Homepage/HomeProductSections';
import HomeTestimonials from '@/components/Homepage/HomeTestimonials';
import HomeTrustBar from '@/components/Homepage/HomeTrustBar';
import { useHomeStore } from '@/store/HomeStore';
import useAuthStore from '@/store/AuthStore';
import useBrandStore from '@/store/useBrandStore';

const HomepageVideo = dynamic(() => import('@/components/HomepageVideo'));

const CUSTOMER_ONLY_COLLECTIONS = new Set([
  'recentlyviewed',
  'recommendedforyou',
  'recomendedforyou',
]);

const isCustomerOnlyCollection = (collection) =>
  [collection?.id, collection?.handle, collection?.title].some((value) =>
    CUSTOMER_ONLY_COLLECTIONS.has(
      String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    )
  );

export default function HomePageClient() {
  const fetchHome = useHomeStore((state) => state.fetchHome);
  const activeBrandSlug = useHomeStore((state) => state.activeBrandSlug);
  const storeCollections = useHomeStore((state) => state.collections);
  const storeHomepageVideo = useHomeStore((state) => state.homepageVideo);
  const storeHomepageSettings = useHomeStore((state) => state.homepageSettings);
  const storeTestimonials = useHomeStore((state) => state.testimonials);
  const storeLoading = useHomeStore((state) => state.loading);
  const storeError = useHomeStore((state) => state.error);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const brands = useBrandStore((state) => state.brands);
  const brandsLoading = useBrandStore((state) => state.loading);
  const brandsError = useBrandStore((state) => state.error);
  const selectedBrandSlug = useBrandStore((state) => state.selectedBrandSlug);
  const fetchBrands = useBrandStore((state) => state.fetchBrands);
  const selectedBrand = brands.find((brand) => brand.slug === selectedBrandSlug);
  const requestedBrandKey = useRef(null);

  useEffect(() => {
    if (!brands.length) fetchBrands();
  }, [brands.length, fetchBrands]);

  useEffect(() => {
    if (!selectedBrandSlug) return;
    const requestKey = `${selectedBrandSlug}:${hasHydrated && isAuthenticated ? 'customer' : 'guest'}`;
    if (requestedBrandKey.current === requestKey) return;
    requestedBrandKey.current = requestKey;
    fetchHome(selectedBrandSlug);
  }, [fetchHome, hasHydrated, isAuthenticated, selectedBrandSlug]);

  const brandDataReady = Boolean(selectedBrandSlug && activeBrandSlug === selectedBrandSlug);
  const collections = brandDataReady ? storeCollections : [];
  const homepageVideo = brandDataReady ? storeHomepageVideo : null;
  const homepageSettings = brandDataReady ? storeHomepageSettings : null;
  const testimonials = storeTestimonials;
  const categories = [...(selectedBrand?.categories || [])]
    .sort((left, right) => (left.position || 0) - (right.position || 0))
    .map((category) => ({
      ...category,
      image: category.featuredAsset?.preview || category.featuredAsset?.source || null,
    }));
  const loading = !brandDataReady || storeLoading;
  const visibleCollections = collections.filter(
    (collection) =>
      collection.products?.length > 0 && (isAuthenticated || !isCustomerOnlyCollection(collection))
  );
  const leadingCollections = visibleCollections.slice(0, 3);
  const remainingCollections = visibleCollections.slice(3);

  return (
    <>
      <HomeHero brand={selectedBrand} />
      <HomeTrustBar />
      {brandsError && !selectedBrand ? (
        <HomeLoadError message={brandsError} onRetry={() => fetchBrands(true)} />
      ) : (
        <>
          <Category
            key={selectedBrandSlug || 'no-brand'}
            initialCategories={categories}
            brandScoped
            loadingOverride={brandsLoading && !selectedBrand}
          />

          <HomeBrandValues
            section={homepageSettings}
            brandSlug={selectedBrandSlug}
          />

          {storeError && selectedBrandSlug && !brandDataReady ? (
            <HomeLoadError
              message={`Could not load homepage content for this brand: ${storeError}`}
              onRetry={() => fetchHome(selectedBrandSlug)}
            />
          ) : (
            <>
              <HomeProductSections collections={leadingCollections} loading={loading} />
              <HomepageVideo section={homepageVideo} />
              <HomeBrandStory brand={selectedBrand} />
              <HomeProductSections collections={remainingCollections} loading={false} />
              <HomeTestimonials reviews={testimonials} loading={loading} />
            </>
          )}
        </>
      )}
    </>
  );
}
