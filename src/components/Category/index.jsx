'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Card } from 'primereact/card';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { getAllCollections } from '@/graphql/queries/collections';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';
import ReusableButton from '@/components/ReUsableButton';
import CarouselArrow from '@/components/CarouselArrow';

import 'swiper/css';
import 'swiper/css/navigation';
import './index.css';

export default function ShopByCategory() {
  const router = useRouter();
  const swiperId = useId().replace(/:/g, '');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCollections() {
      try {
        setLoading(true);
        setError('');
        const result = await getAllCollections();
        if (!cancelled) setCategories(result?.items || []);
      } catch (err) {
        if (!cancelled) {
          setCategories([]);
          setError(err?.message || 'Could not load categories.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCollections();
    return () => {
      cancelled = true;
    };
  }, []);

  const cardTemplate = (item) => {
    return (
      <div className="px-1">
        <Card
          onClick={() => router.push(`/shop/${item.slug}`)}
          className="
      category-card bg-[#E6F4F2] cursor-pointer
      h-[250px] w-full max-w-[200px] mx-auto
      transition duration-200
      rounded-2xl
    "
        >
          {/* Image */}
          <div className="category-card-media">
            <Image
              src={item.featuredAsset?.preview?.replace(/\\/g, '/') || DEFAULT_IMAGE}
              alt={item.name}
              fill
              sizes="(max-width: 760px) 160px, 200px"
              className="category-card-image object-cover"
            />
          </div>

          <div className="category-card-footer">
            <h3 className="category-card-title line-clamp-2 text-sm font-semibold text-gray-800">
              {item.name}
            </h3>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <section className="w-full p-5 md:p-10 lg:max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900 md:text-4xl">
            Shop by Category
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
            Choose a category to explore its subcategories and products.
          </p>
        </div>
        <div className="shrink-0">
          <ReusableButton label="Browse More" onClick={() => router.push('/shop')} />
        </div>
      </div>

      {error ? (
        <p className="mb-6 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="relative">
        {/* Custom Arrows */}
        <CarouselArrow
          direction="previous"
          label="Previous categories"
          className={`
            custom-prev-${swiperId}
            absolute top-1/2 z-20 hidden -translate-y-1/2
            lg:left-2 lg:flex xl:left-[-60px]
          `}
        />

        <CarouselArrow
          direction="next"
          label="Next categories"
          className={`
            custom-next-${swiperId}
            absolute top-1/2 z-20 hidden -translate-y-1/2
            lg:right-2 lg:flex xl:right-[-60px]
          `}
        />

        {/* Swiper */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="mx-auto h-[250px] w-full max-w-[200px] animate-pulse rounded-2xl bg-[#E6F4F2]"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          !error && <p className="text-center text-sm text-gray-500">No categories found.</p>
        ) : (
          <Swiper
            modules={[Navigation]}
            loop={true}
            spaceBetween={16}
            navigation={{
              prevEl: `.custom-prev-${swiperId}`,
              nextEl: `.custom-next-${swiperId}`,
            }}
            breakpoints={{
              1400: { slidesPerView: 6 },
              1200: { slidesPerView: 5 },
              992: { slidesPerView: 4 },
              768: { slidesPerView: 3 },
              0: { slidesPerView: 2 },
            }}
          >
            {categories.map((item) => (
              <SwiperSlide key={item.id}>{cardTemplate(item)}</SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
