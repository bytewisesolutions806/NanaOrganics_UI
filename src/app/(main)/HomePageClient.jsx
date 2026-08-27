'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Gallery from '@/components/Gallery';
import Category from '@/components/Category';
import SmallOverlayImage from '@/assets/images/gallery/gallery_leave_01.png';
import ReviewCard from '@/components/ReviewCard';
import NaturalIngredients from '@/components/NaturalIngredients';
import WhyChooseNana from '@/components/WhyChooseNana';
import HomeNatureBanner from '@/components/HomeNatureBanner';
import ExploreOrganicOfferings from '@/components/BannerOrganic';
import CollectionsSection from '@/components/CollectionSection';
import ProductSliderSkeleton from '@/components/ProductSlider/ProductSkeleton';
import HomepageVideo from '@/components/HomepageVideo';
import { useHomeStore } from '@/store/HomeStore';
import useAuthStore from '@/store/AuthStore';

const CUSTOMER_ONLY_COLLECTIONS = new Set([
  'recentlyviewed',
  'recommendedforyou',
  'recomendedforyou',
]);

const isCustomerOnlyCollection = (collection) =>
  [collection?.id, collection?.handle, collection?.title].some((value) =>
    CUSTOMER_ONLY_COLLECTIONS.has(String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')),
  );

export default function HomePageClient({ initialHomeData, initialCategories }) {
  const fetchHome = useHomeStore((state) => state.fetchHome);
  const storeCollections = useHomeStore((state) => state.collections);
  const storeHomepageVideo = useHomeStore((state) => state.homepageVideo);
  const storeTestimonials = useHomeStore((state) => state.testimonials);
  const storeLoading = useHomeStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const personalizedRequestStarted = useRef(false);

  const hasInitialData = initialHomeData?.collections?.length > 0;

  useEffect(() => {
    if (!hasInitialData && !personalizedRequestStarted.current) {
      personalizedRequestStarted.current = true;
      fetchHome();
      return;
    }

    if (hasHydrated && isAuthenticated && !personalizedRequestStarted.current) {
      personalizedRequestStarted.current = true;
      fetchHome();
    }
  }, [fetchHome, hasHydrated, hasInitialData, isAuthenticated]);

  const useStoreData = storeCollections.length > 0;
  const collections = useStoreData ? storeCollections : initialHomeData?.collections || [];
  const homepageVideo = useStoreData
    ? storeHomepageVideo
    : initialHomeData?.homepageVideo || null;
  const testimonials = useStoreData
    ? storeTestimonials
    : initialHomeData?.testimonials || [];
  const loading = !hasInitialData && storeLoading;

  const validCollections = collections.filter(
    (collection) =>
      collection.products?.length > 0 &&
      (isAuthenticated || !isCustomerOnlyCollection(collection)),
  );
  const firstThree = validCollections.slice(0, 3);
  const remaining = validCollections.slice(3);

  return (
    <>
      <section>
        <Gallery />
      </section>
      <Category initialCategories={initialCategories} />

      {loading
        ? Array.from({ length: 3 }, (_, index) => <ProductSliderSkeleton key={index} />)
        : firstThree.map((collection) => (
            <CollectionsSection key={collection.id} collection={collection} />
          ))}

      <HomepageVideo section={homepageVideo} />

      <section className="mb-10">
        <div className="relative w-full">
          <div className="relative h-[500px] w-full lg:h-[700px]">
            <Image
              src="/banner_image.webp"
              alt="Organic products from Nana Organics"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 flex translate-y-[15%] items-center justify-center px-4">
            <div className="flex max-w-[900px] flex-col items-center space-y-8 text-center sm:space-y-5">
              <Image
                src={SmallOverlayImage}
                alt=""
                aria-hidden="true"
                sizes="(max-width: 640px) 40px, (max-width: 768px) 60px, (max-width: 1024px) 80px, 100px"
                className="h-[40px] w-[40px] object-contain sm:h-[60px] sm:w-[60px] md:h-[80px] md:w-[80px] lg:h-[100px] lg:w-[100px]"
              />

              <h2 className="text-[18px] font-semibold leading-tight text-white sm:text-[22px] md:text-[28px] lg:text-[36px]">
                Discover the Transformative Benefits of Choosing Organic with Nana Organics
              </h2>

              <p className="max-w-[850px] text-[13px] leading-relaxed text-white sm:text-[14px] md:text-[16px] lg:text-lg">
                Choosing organic products from Nana Organics means embracing a healthier lifestyle.
                Our offerings are free from harmful chemicals, ensuring that you nourish your body
                with pure, natural ingredients. By supporting organic farming, you also contribute
                to sustainable practices that protect our planet for future generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {remaining.map((collection) => (
        <CollectionsSection key={collection.id} collection={collection} />
      ))}

      <HomeNatureBanner />

      <section className="mb-10 mt-10">
        <NaturalIngredients />
      </section>

      <section className="mb-10">
        <WhyChooseNana />
      </section>

      <section className="customer-reviews-section relative my-10 overflow-hidden bg-[#EAF6F3]">
        <Image
          src="/what_customer_says.svg"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="relative z-10">
          <h2
            className="customer-reviews-heading px-4 text-center font-semibold leading-none text-[#20272A]"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            What Our Customers Say
          </h2>
          <ReviewCard reviews={testimonials} loading={loading} />
        </div>
      </section>

      <ExploreOrganicOfferings />
    </>
  );
}
