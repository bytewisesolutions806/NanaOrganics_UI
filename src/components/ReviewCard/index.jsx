'use client';

import { useId } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import TestimonialsSkeleton from './TestimonalSkeleton';
import { useHomeStore } from '@/store/HomeStore';

import 'swiper/css';
import 'swiper/css/navigation';
import './index.css';

export default function ReviewCard() {
  const swiperId = useId().replaceAll(':', '');
  const reviews = useHomeStore((state) => state.testimonials).slice(0, 10);
  const loading = useHomeStore((state) => state.loading);
  const previousClass = `customer-review-prev-${swiperId}`;
  const nextClass = `customer-review-next-${swiperId}`;

  if (loading && reviews.length === 0) return <TestimonialsSkeleton />;
  if (!reviews.length) return null;

  return (
    <div className="customer-review-stage w-full">
      <div className="customer-review-track relative mx-auto">
        <button
          type="button"
          aria-label="Previous customer review"
          className={`${previousClass} customer-review-arrow absolute z-20 hidden -translate-y-1/2 text-[#2F746A] transition hover:scale-110 hover:text-[#1F554D] sm:flex`}
        >
          <ChevronLeft className="customer-review-chevron" strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="Next customer review"
          className={`${nextClass} customer-review-arrow customer-review-arrow-next absolute z-20 hidden -translate-y-1/2 text-[#2F746A] transition hover:scale-110 hover:text-[#1F554D] sm:flex`}
        >
          <ChevronRight className="customer-review-chevron" strokeWidth={1.7} />
        </button>

        <Swiper
          className="customer-review-swiper"
          modules={[Navigation, Autoplay]}
          loop={reviews.length > 3}
          autoplay={reviews.length > 1 ? { delay: 5000, disableOnInteraction: false } : false}
          navigation={{ prevEl: `.${previousClass}`, nextEl: `.${nextClass}` }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = `.${previousClass}`;
            swiper.params.navigation.nextEl = `.${nextClass}`;
          }}
          breakpoints={{
            0: { slidesPerView: 1.08, centeredSlides: true, spaceBetween: 14 },
            640: { slidesPerView: 2, centeredSlides: false, spaceBetween: 16 },
            1024: { slidesPerView: 3, centeredSlides: false, spaceBetween: 16 },
          }}
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <CustomerReviewCard review={review} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

function CustomerReviewCard({ review }) {
  const rating = Math.min(5, Math.max(0, Math.round(Number(review.rating) || 0)));

  return (
    <article className="customer-review-card relative flex flex-col bg-white shadow-[0_8px_22px_rgba(36,91,82,0.10)]">
      <div className="customer-review-quote absolute flex items-center justify-center rounded-md bg-[#2F746A] shadow-sm">
        <Quote className="customer-review-quote-icon fill-transparent text-white" strokeWidth={2} />
      </div>

      <p className="customer-review-copy line-clamp-4 flex-1 leading-[1.65] text-[#20272A]">
        &ldquo;{review.comment}&rdquo;
      </p>

      <footer className="customer-review-footer flex items-center">
        <span className="customer-review-name max-w-[42%] truncate font-semibold text-[#20272A]">
          {review.name}
        </span>
        <span className="customer-review-divider w-px shrink-0 bg-[#DCE8E5]" aria-hidden="true" />
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={`customer-review-star ${
                index < rating
                  ? 'fill-[#61A78F] text-[#61A78F]'
                  : 'fill-[#D9E6E2] text-[#D9E6E2]'
              }`}
              strokeWidth={1}
            />
          ))}
        </div>
      </footer>
    </article>
  );
}
