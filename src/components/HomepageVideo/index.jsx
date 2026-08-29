'use client';

import CarouselArrow from '@/components/CarouselArrow';
import { useHomeStore } from '@/store/HomeStore';
import useCartStore from '@/store/useCartStore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

function formatMoney(value, currencyCode = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `$${Number(value || 0).toFixed(2)}`;
  }
}

function getProductHref(product) {
  const parent = product?.parent_category?.handle || 'featured';
  const child = product?.subcategory?.handle || parent;
  return `/shop/${parent}/${child}/${product?.handle || product?.id}`;
}

function VideoProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const addingVariantId = useCartStore((state) => state.addingVariantId);
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const variant = variants.find((item) => item.in_stock) || variants[0];

  if (!product || !variant) return null;

  const sellingPrice = Number(variant.price || 0);
  const originalPrice = Math.max(Number(variant.original_price || 0), sellingPrice);
  const discount = originalPrice > sellingPrice
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
    : Number(variant.discount || 0);
  const isAdding = addingVariantId === variant.id;
  const href = getProductHref(product);

  return (
    <div className="border-t border-[#E4EFEC] bg-white p-3">
      <Link href={href} className="flex min-w-0 items-center gap-2.5">
        <Image
          src={product.thumbnail}
          alt={product.title || 'Product image'}
          width={52}
          height={52}
          sizes="52px"
          className="h-[52px] w-[52px] shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#252B2A]" title={product.title}>
            {product.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-[#17211E]">
              {formatMoney(sellingPrice, variant.currency)}
            </span>
            {originalPrice > sellingPrice ? (
              <span className="text-xs text-[#919996] line-through">
                {formatMoney(originalPrice, variant.currency)}
              </span>
            ) : null}
            {discount > 0 ? (
              <span className="rounded-md bg-[#E4F6ED] px-1.5 py-0.5 text-[10px] font-medium text-[#14975B]">
                Save {discount}%
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <button
        type="button"
        disabled={!variant.in_stock || isAdding}
        onClick={() => addToCart({ variant_id: variant.id, quantity: 1 })}
        className="mt-3 flex min-h-10 w-full items-center justify-center rounded-xl bg-[#E4F3F0] px-4 text-sm font-semibold text-[#15965B] transition hover:bg-[#D6ECE7] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        {isAdding ? 'Adding…' : variant.in_stock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}

export default function HomepageVideo({ section: initialSection }) {
  const storedSection = useHomeStore((state) => state.homepageVideo);
  const section = initialSection === undefined ? storedSection : initialSection;
  const sectionRef = useRef(null);
  const carouselId = useId().replace(/:/g, '');
  const videos = section?.videos || [];

  useEffect(() => {
    const root = sectionRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const video = entry.target;
          if (video.dataset.prewarmed === 'true') return;

          video.dataset.prewarmed = 'true';
          video.preload = 'metadata';
          video.load();
          observer.unobserve(video);
        });
      },
      {
        // Fetch only the opening bytes shortly before a video becomes visible.
        rootMargin: '500px 160px',
        threshold: 0.01,
      },
    );

    root.querySelectorAll('video').forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [section?.id]);

  if (!videos.length) return null;

  const pauseAll = () => {
    sectionRef.current?.querySelectorAll('video').forEach((video) => video.pause());
  };

  const playOnly = (activeVideo) => {
    sectionRef.current?.querySelectorAll('video').forEach((video) => {
      if (video !== activeVideo) video.pause();
    });
  };

  const playOnHover = (video) => {
    playOnly(video);
    video.preload = 'auto';
    video.play().catch(() => {
      // Browsers may still block autoplay when local preferences disallow it.
    });
  };

  return (
    <section
      ref={sectionRef}
      className="my-10 overflow-hidden sm:my-14"
      aria-labelledby="homepage-video-title"
    >
      <div className="site-shell">
        <div className="mb-6 text-center sm:mb-8">
          <h2
            id="homepage-video-title"
            className="text-2xl font-semibold leading-tight text-[#20272A] sm:text-3xl lg:text-[34px]"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            {section.title}
          </h2>
          {section.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#68706D] sm:text-base">
              {section.description}
            </p>
          ) : null}
        </div>

        <div className="relative">
          {videos.length > 1 ? (
            <>
              <CarouselArrow
                direction="previous"
                label="Previous videos"
                className={`homepage-video-prev-${carouselId} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:left-[-24px] lg:flex xl:left-[-58px]`}
              />
              <CarouselArrow
                direction="next"
                label="Next videos"
                className={`homepage-video-next-${carouselId} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:right-[-24px] lg:flex xl:right-[-58px]`}
              />
            </>
          ) : null}

          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: `.homepage-video-prev-${carouselId}`,
              nextEl: `.homepage-video-next-${carouselId}`,
            }}
            spaceBetween={12}
            slidesPerView={1.15}
            centeredSlides={videos.length === 1}
            centerInsufficientSlides
            watchOverflow
            loop={videos.length > 5}
            onSlideChange={pauseAll}
            breakpoints={{
              480: { slidesPerView: 1.7, spaceBetween: 14 },
              640: { slidesPerView: 2.25, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 18 },
              1280: { slidesPerView: 5, spaceBetween: 18 },
            }}
            className="!overflow-visible lg:!overflow-hidden"
          >
            {videos.map((video, index) => (
              <SwiperSlide key={video.id} className="h-auto pb-2">
                <article className="h-full overflow-hidden rounded-2xl border border-[#DCEAE6] bg-white shadow-[0_10px_28px_rgba(26,77,63,0.10)]">
                  <div className="aspect-[3/5] bg-black">
                    <video
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                      muted
                      preload="none"
                      aria-label={`${section.title} video ${index + 1}`}
                      onPlay={(event) => playOnly(event.currentTarget)}
                      onMouseEnter={(event) => playOnHover(event.currentTarget)}
                      onMouseLeave={(event) => event.currentTarget.pause()}
                    >
                      <source src={video.source} type={video.mimeType || 'video/mp4'} />
                      Your browser does not support embedded videos.
                    </video>
                  </div>
                  <VideoProductCard product={video.product} />
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
