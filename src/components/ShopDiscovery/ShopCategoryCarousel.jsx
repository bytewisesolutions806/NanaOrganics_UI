'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CarouselArrow from '@/components/CarouselArrow';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

import 'swiper/css';
import 'swiper/css/navigation';

export default function ShopCategoryCarousel({
  categories = [],
  error = '',
  title = 'Shop All Categories',
  description = 'Explore our complete collection of natural and organic essentials.',
  basePath = '/shop',
}) {
  const previousClass = 'shop-category-prev';
  const nextClass = 'shop-category-next';

  return (
    <section className="relative mx-auto w-full max-w-7xl px-5 md:px-10">
      <div className="mb-5 max-w-[636px] md:mb-6">
        <h1
          className="text-2xl font-semibold leading-tight text-[#21252C] sm:text-3xl"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          {title}
        </h1>
        <p className="mt-1.5 text-sm font-medium leading-6 text-[#545860] sm:text-base">
          {description}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-[#D8E7E4] px-5 py-10 text-center text-sm text-[#68716F]">
          No categories are available yet.
        </div>
      ) : (
        <div className="relative">
          <CarouselArrow
            direction="previous"
            label="Previous categories"
            className={`${previousClass} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:left-2 lg:flex xl:left-[-40px]`}
          />
          <CarouselArrow
            direction="next"
            label="Next categories"
            className={`${nextClass} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:right-2 lg:flex xl:right-[-40px]`}
          />

          <Swiper
            modules={[Navigation]}
            loop={categories.length > 6}
            spaceBetween={16}
            navigation={{ prevEl: `.${previousClass}`, nextEl: `.${nextClass}` }}
            breakpoints={{
              0: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
              1400: { slidesPerView: 6 },
            }}
          >
            {categories.map((category) => (
              <SwiperSlide key={category.id} className="h-auto px-1">
                <Link
                  href={`${basePath}/${category.slug}`.replace(/\/+/g, '/')}
                  className="group mx-auto flex h-[250px] min-h-[250px] w-full max-w-[200px] flex-col overflow-hidden rounded-2xl border border-transparent bg-[#E6F4F2] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[rgba(44,102,94,0.24)] hover:bg-white hover:shadow-[0_12px_28px_rgba(35,83,76,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C665E] focus-visible:ring-offset-2 motion-reduce:transition-none"
                >
                  <span className="relative mx-auto mt-[10px] block h-[170px] w-[calc(100%-20px)] shrink-0 overflow-hidden rounded-xl bg-[#E6F4F2]">
                    <Image
                      src={(category.featuredAsset?.preview || DEFAULT_IMAGE).replace(/\\/g, '/')}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 55vw, (max-width: 1100px) 25vw, 190px"
                      className="object-cover"
                    />
                  </span>
                  <span className="flex h-[70px] min-h-[70px] w-full shrink-0 items-center justify-center bg-[#E6F4F2] px-4 py-[10px] text-center text-sm font-semibold leading-5 text-[#21252C] transition-colors group-hover:bg-white">
                    <span className="line-clamp-2">
                      {category.name}
                    </span>
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
}
