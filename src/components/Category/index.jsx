'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Card } from 'primereact/card';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { getAllCollections } from '@/graphql/queries/collections';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

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
      bg-[#E6F4F2] hover:bg-white text-center cursor-pointer
      h-[250px] w-full max-w-[200px] mx-auto
      flex flex-col items-center
      p-3
      transition duration-200
      rounded-2xl
    "
        >
          {/* Image */}
          <div className="relative w-[160px] h-[170px]">
            <Image
              src={item.featuredAsset?.preview?.replace(/\\/g, '/') || DEFAULT_IMAGE}
              alt={item.name}
              fill
              sizes="(max-width: 760px) 130px, 150px"
              className="object-cover rounded-xl"
            />
          </div>

          {/* Title */}
          <h3 className="mt-3 text-gray-800 text-sm font-semibold line-clamp-2 text-center h-[40px] flex items-center justify-center px-1">
            {item.name}
          </h3>
        </Card>
      </div>
    );
  };

  return (
    <section className="w-full p-5 md:p-10 lg:max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex justify-center items-center mb-8">
        <h2 className="sm:text-3xl font-semibold text-gray-800">Shop By Category</h2>
      </div>

      {error ? (
        <p className="mb-6 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {/* Custom Arrows */}
      <button
        className={`
          custom-prev-${swiperId}
          hidden lg:flex
          absolute
          top-1/2 -translate-y-1/2
          z-20
          w-10 h-10
          text-[4rem]
          font-normal
          text-[#1ea766]
          items-center justify-center
          cursor-pointer
          transition-all duration-200
          lg:left-2
          xl:left-[-60px]
        `}
      >
        ‹
      </button>

      <button
        className={`
          custom-next-${swiperId}
          hidden lg:flex
          absolute
          top-1/2 -translate-y-1/2
          z-20
          w-10 h-10
          text-[4rem]
          font-normal
          text-[#1ea766]
          items-center justify-center
          cursor-pointer
          transition-all duration-200
          lg:right-2
          xl:right-[-60px]
        `}
      >
        ›
      </button>

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
    </section>
  );
}
