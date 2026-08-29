'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { useRouter } from 'next/navigation';
import ReusableButton from '@/components/ReUsableButton';
import CardProduct from '@/components/CardProduct';
import CarouselArrow from '@/components/CarouselArrow';

import 'swiper/css';
import 'swiper/css/navigation';
import './index.css';

export default function ProductSlider({
  title,
  subtitle,
  products = [],
  browseLink = '/shop',
  bgClass = '', // 👈 NEW
  sectionClass = '',
  designVariant = 'default',
}) {
  const sliderId = String(title || 'products')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'products';
  const router = useRouter();
  const isFigmaLayout = designVariant === 'figma';

  if (!products.length) return null;

  return (
    <section className={`${bgClass} ${sectionClass}`}>
      <div
        className="site-shell relative"
      >
        {/* HEADER */}
        <div className={`flex gap-5 ${isFigmaLayout ? 'mb-6 flex-col items-start sm:flex-row sm:items-end sm:justify-between' : 'mb-6 items-end justify-between'}`}>
          <div className="min-w-0">
            <h2
              className={isFigmaLayout ? 'text-2xl font-semibold leading-tight text-[#21252C]' : 'text-2xl font-semibold text-gray-800'}
              style={isFigmaLayout ? { fontFamily: '"Playfair Display", Georgia, serif' } : undefined}
            >
              {title}
            </h2>
            {subtitle && (
              <p className={isFigmaLayout ? 'mt-1.5 text-sm font-medium leading-6 text-[#545860]' : 'mt-1 text-sm text-gray-600'}>
                {subtitle}
              </p>
            )}
          </div>

          {isFigmaLayout ? (
            <button
              type="button"
              onClick={() => router.push(browseLink)}
              className="inline-flex min-h-11 min-w-[126px] shrink-0 items-center justify-center rounded-xl border-[1.5px] border-[#1EA766] bg-white px-5 text-sm font-semibold text-[#1EA766] shadow-[0_4px_6px_rgba(60,87,80,0.08)] transition hover:bg-[#F3F9F7] sm:min-h-12 sm:min-w-[150px] sm:px-7"
            >
              Browse More
            </button>
          ) : (
            <ReusableButton label="Browse More" onClick={() => router.push(browseLink)} />
          )}
        </div>

        <div className={`relative ${isFigmaLayout ? 'lg:px-12 xl:px-16' : ''}`}>
          <CarouselArrow
            direction="previous"
            label={`Previous ${title || 'products'}`}
            className={`custom-prev-${sliderId} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:flex ${isFigmaLayout ? 'lg:left-0 xl:left-0' : 'lg:left-2 xl:left-[-40px]'}`}
          />
          <CarouselArrow
            direction="next"
            label={`Next ${title || 'products'}`}
            className={`custom-next-${sliderId} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:flex ${isFigmaLayout ? 'lg:right-0 xl:right-0' : 'lg:right-2 xl:right-[-40px]'}`}
          />

          {/* SWIPER */}
          <Swiper
            modules={[Navigation]}
            loop={products.length > 4}
            spaceBetween={14}
            navigation={{
              prevEl: `.custom-prev-${sliderId}`,
              nextEl: `.custom-next-${sliderId}`,
            }}
            breakpoints={{
              1280: { slidesPerView: 4 },
              900: { slidesPerView: 3 },
              640: { slidesPerView: 2 },
              480: { slidesPerView: 1.4 },
              0: { slidesPerView: 1.08 },
            }}
          >
            {products.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <CardProduct item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
