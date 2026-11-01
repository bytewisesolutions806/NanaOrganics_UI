'use client';

import { useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import CardProduct from '@/components/CardProduct';
import CarouselArrow from '@/components/CarouselArrow';
import LoginTree from '@/assets/images/LoginTree.png';

import 'swiper/css';
import 'swiper/css/navigation';
import './index.css';

const DEFAULT_BREAKPOINTS = {
  0: { slidesPerView: 1, spaceBetween: 14 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  1024: { slidesPerView: 4, spaceBetween: 20 },
};

export default function ProductCarousel({
  eyebrow,
  title,
  subtitle,
  products = [],
  browseLink = '/shop',
  browseLabel = 'View More Products',
  showBrowse = true,
  sectionClass = '',
  backgroundClass = '',
  variant = 'showcase',
  cardVariant,
  category,
  breakpoints = DEFAULT_BREAKPOINTS,
  renderProduct,
  getProductKey = (product, index) => product?.id || product?.slug || index,
}) {
  const reactId = useId().replace(/:/g, '');
  const previousClass = `product-carousel-prev-${reactId}`;
  const nextClass = `product-carousel-next-${reactId}`;
  const isShowcase = variant === 'showcase';
  const resolvedCardVariant = cardVariant || (isShowcase ? 'showcase' : 'default');

  if (!products.length) return null;

  return (
    <section
      className={`product-carousel product-carousel--${variant} ${backgroundClass} ${sectionClass}`}
      aria-labelledby={`product-carousel-title-${reactId}`}
    >
      {isShowcase ? (
        <Image
          src={LoginTree}
          alt=""
          className="product-carousel__botanical"
          aria-hidden="true"
          sizes="(max-width: 768px) 240px, 420px"
        />
      ) : null}

      <div className="site-shell product-carousel__inner">
        <header className={`product-carousel__header ${isShowcase ? 'product-carousel__header--center' : ''}`}>
          <div className="product-carousel__heading-copy">
            {eyebrow ? <p className="product-carousel__eyebrow">{eyebrow}</p> : null}
            <h2 id={`product-carousel-title-${reactId}`} className="product-carousel__title">
              {title}
            </h2>
            {subtitle ? <p className="product-carousel__subtitle">{subtitle}</p> : null}
          </div>

          {!isShowcase && showBrowse ? (
            <Link href={browseLink} className="product-carousel__browse product-carousel__browse--outline">
              {browseLabel}
            </Link>
          ) : null}
        </header>

        <div className="product-carousel__viewport">
          <CarouselArrow
            direction="previous"
            label={`Previous ${title || 'products'}`}
            className={`${previousClass} product-carousel__arrow product-carousel__arrow--previous`}
          />
          <CarouselArrow
            direction="next"
            label={`Next ${title || 'products'}`}
            className={`${nextClass} product-carousel__arrow product-carousel__arrow--next`}
          />

          <Swiper
            modules={[Navigation]}
            className="product-carousel__swiper"
            loop={products.length > 4}
            watchOverflow
            grabCursor={products.length > 1}
            navigation={{
              prevEl: `.${previousClass}`,
              nextEl: `.${nextClass}`,
            }}
            breakpoints={breakpoints}
          >
            {products.map((product, index) => (
              <SwiperSlide key={getProductKey(product, index)} className="product-carousel__slide">
                {renderProduct ? (
                  renderProduct(product, index)
                ) : (
                  <CardProduct item={product} category={category} cardVariant={resolvedCardVariant} />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {isShowcase && showBrowse ? (
          <div className="product-carousel__footer">
            <Link href={browseLink} className="product-carousel__browse product-carousel__browse--solid">
              <span>{browseLabel}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { DEFAULT_BREAKPOINTS };
