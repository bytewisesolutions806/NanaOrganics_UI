"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { useId } from "react";
import { Card } from "primereact/card";

import CommentImage from "../../assets/images/comment.png";
import TestimonialsSkeleton from "./TestimonalSkeleton";
import { useHomeStore } from "@/store/HomeStore";

import "swiper/css";
import "swiper/css/navigation";
import "./index.css";

export default function ReviewCard() {
  const swiperId = useId();
  const reviews = useHomeStore((state) => state.testimonials);
  const loading = useHomeStore((state) => state.loading);

  // ✅ skeleton condition (correct)
  if (loading && reviews.length === 0) {
    return <TestimonialsSkeleton />;
  }

  if (!reviews.length) return null;

  return (
    <div className="w-full py-6 sm:py-8">
      <div className="max-w-7xl mx-auto relative px-3 sm:px-6">
        {/* ================= ARROWS ================= */}
        <button
          className={`
            custom-prev-${swiperId}
            hidden lg:flex
            absolute top-1/2 -translate-y-1/2 z-20
            w-10 h-10
            text-[3rem] text-[#1ea766]
            items-center justify-center
            lg:left-2 xl:-left-14
          `}
        >
          ‹
        </button>

        <button
          className={`
            custom-next-${swiperId}
            hidden lg:flex
            absolute top-1/2 -translate-y-1/2 z-20
            w-10 h-10
            text-[3rem] text-[#1ea766]
            items-center justify-center
            lg:right-2 xl:-right-14
          `}
        >
          ›
        </button>

        {/* ================= SWIPER ================= */}
        <Swiper
          modules={[Navigation]}
          loop
          spaceBetween={16}
          navigation={{
            prevEl: `.custom-prev-${swiperId}`,
            nextEl: `.custom-next-${swiperId}`,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = `.custom-prev-${swiperId}`;
            swiper.params.navigation.nextEl = `.custom-next-${swiperId}`;
          }}
          breakpoints={{
            0: {
              slidesPerView: 1.1,
              centeredSlides: true,
            },
            640: {
              slidesPerView: 2,
              centeredSlides: false,
            },
            1024: {
              slidesPerView: 3,
              centeredSlides: false,
            },
          }}
        >
          {reviews.map((item) => (
            <SwiperSlide key={item.id} className="flex justify-center">
              <CustomCard data={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
function CustomCard({ data }) {
  const { name, comment, rating } = data;

  return (
    <div className="relative mt-5 w-full max-w-[400px]">
      <div className="absolute -top-5 left-4 z-20">
        <Image src={CommentImage} alt="Comment" width={60} height={60} />
      </div>

      <Card className="border-none rounded-2xl shadow-md">
        <div className="flex flex-col justify-between min-h-[200px] pt-8 px-4">
          {/* Review text */}
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-4">
            {comment}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-4 mb-6">
            <span className="text-base sm:text-lg font-semibold">{name}</span>

            <span className="hidden sm:block w-px h-5 bg-gray-300" />

            {/* Rating */}
            <div className="flex gap-1 text-[#5EA087]">
              {Array.from({ length: 5 }).map((_, i) => (
                <i
                  key={i}
                  className={`pi ${i < rating ? "pi-star-fill" : "pi-star"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
