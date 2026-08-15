'use client';
import { useEffect } from 'react';
import { useHomeStore } from '@/store/HomeStore';
import React from 'react';
import Image from 'next/image';
import Gallery from '../../components/Gallery';
import Category from '../../components/Category';
import SmallOverlayImage from '../../assets/images/gallery/gallery_leave_01.png';
import ReviewCard from '../../components/ReviewCard';
import NaturalIngredients from '@/components/NaturalIngredients';
import WhyChooseNana from '@/components/WhyChooseNana';
import HomeNatureBanner from '@/components/HomeNatureBanner';
import ExploreOrganicOfferings from '@/components/BannerOrganic';
import useCategoryStore from '@/store/useCategotyStore';
import CollectionsSection from '@/components/CollectionSection';
import ProductSliderSkeleton from '@/components/ProductSlider/ProductSkeleton';
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

const HomePage = () => {
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const collections = useHomeStore((state) => state.collections);
  const loading = useHomeStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    fetchHome();
    fetchCategories();
  }, [fetchHome, fetchCategories]);

  // remove empty collections
  const validCollections = collections.filter(
    (collection) =>
      collection.products?.length > 0 &&
      (isAuthenticated || !isCustomerOnlyCollection(collection)),
  );

  const firstThree = validCollections.slice(0, 3);
  const remaining = validCollections.slice(3);

  return (
    <>
      <section className="">
        <Gallery />
      </section>
      <section>
        <Category />
      </section>
      {loading
        ? [...Array(3)].map((_, i) => <ProductSliderSkeleton key={i} />)
        : firstThree.map((collection) => (
            <CollectionsSection key={collection.id} collection={collection} />
          ))}

      <section className="mb-10">
        {/* Bottom Banner */}
        <div className="relative w-full">
          {/* IMAGE with responsive height */}
          <div
            className="
      relative w-full
      h-[500px]
      sm:h-[500px]
      md:h-[500px]
      lg:h-[700px]
    "
          >
            <Image
              src="/banner_image.svg"
              alt="Banner Image"
              fill
              // priority
              className="object-cover"
            />
          </div>

          {/* CONTENT OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center px-4 translate-y-[15%] ">
            <div className="flex flex-col items-center text-center max-w-[900px] space-y-8 sm:space-y-5">
              {/* ICON */}
              <Image
                src={SmallOverlayImage}
                alt="Overlay"
                className="
          w-[40px] h-[40px]
          sm:w-[60px] sm:h-[60px]
          md:w-[80px] md:h-[80px]
          lg:w-[100px] lg:h-[100px]
          object-contain
        "
              />

              {/* HEADING */}
              <h2
                className="
          text-white font-semibold leading-tight
          text-[18px]
          sm:text-[22px]
          md:text-[28px]
          lg:text-[36px]
        "
              >
                Discover the Transformative Benefits of Choosing Organic with Nana Organics
              </h2>

              {/* PARAGRAPH — now visible on all devices */}
              <p
                className="
          text-white leading-relaxed
          text-[13px]
          sm:text-[14px]
          md:text-[16px]
          lg:text-lg
          max-w-[850px]
        "
              >
                Choosing organic products from Nana Organics means embracing a healthier lifestyle.
                Our offerings are free from harmful chemicals, ensuring that you nourish your body
                with pure, natural ingredients. By supporting organic farming, you also contribute
                to sustainable practices that protect our planet for future generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Remaining collections */}
      {remaining.map((collection) => (
        <CollectionsSection key={collection.id} collection={collection} />
      ))}

      <HomeNatureBanner />
      <section className="mb-10 mt-10">
        {/* Card Content for Purely Natural Imgredients */}
        <NaturalIngredients />
      </section>

      <section className="mb-10">
        {/* BAnner for Why Choose NANA */}

        <WhyChooseNana />
      </section>

      <section className="customer-reviews-section relative my-10 overflow-hidden bg-[#EAF6F3]">
        <img
          src="/what_customer_says.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="relative z-10">
          <h2
            className="customer-reviews-heading px-4 text-center font-semibold leading-none text-[#20272A]"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            What Our Customers Say
          </h2>
          <ReviewCard />
        </div>
      </section>

      <section>
        <ExploreOrganicOfferings />
      </section>
    </>
  );
};

export default HomePage;
