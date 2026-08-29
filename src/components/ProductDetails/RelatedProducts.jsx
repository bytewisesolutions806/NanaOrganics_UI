'use client';

import { useId } from 'react';
import Link from 'next/link';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CardProduct from '@/components/CardProduct';
import CarouselArrow from '@/components/CarouselArrow';

import 'swiper/css';
import 'swiper/css/navigation';

export default function RelatedProducts({ products = [], browseLink = '/shop' }) {
  const swiperId = useId().replace(/:/g, '');
  if (!products.length) return null;

  const previousClass = `related-products-prev-${swiperId}`;
  const nextClass = `related-products-next-${swiperId}`;

  return (
    <section className="mt-20 bg-[#E6F4F2] py-16">
      <div className="site-shell">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2
              className="text-3xl font-bold text-[#21252C] md:text-[38px]"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Related Products
            </h2>
            <p className="mt-1 text-sm text-[#545860]">Our most loved products from this collection.</p>
          </div>
          <Link
            href={browseLink}
            className="rounded-lg border border-[#1EA766] bg-white px-5 py-2.5 text-sm font-semibold text-[#1EA766] transition-colors hover:bg-[#F4FBF8]"
          >
            Explore All New Products
          </Link>
        </div>

        <div className="relative">
          <CarouselArrow
            direction="previous"
            label="Previous related products"
            className={`${previousClass} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:left-2 lg:flex xl:left-[-60px]`}
          />
          <CarouselArrow
            direction="next"
            label="Next related products"
            className={`${nextClass} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:right-2 lg:flex xl:right-[-60px]`}
          />

          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            navigation={{
              prevEl: `.${previousClass}`,
              nextEl: `.${nextClass}`,
            }}
            breakpoints={{
              0: { slidesPerView: 1.1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {products.map((product) => (
              <SwiperSlide key={product.id || product.handle} className="h-auto">
                <CardProduct item={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
