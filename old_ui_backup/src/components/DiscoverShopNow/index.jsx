"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useId } from "react";
import { Rating } from "primereact/rating";
import { shopNow } from "../../service/DiscoverShopNowService";
import "./index.css";

import "swiper/css";
import "swiper/css/navigation";
import "./index.css";
import { useHomeStore } from "@/store/HomeStore";
import CarouselArrow from "@/components/CarouselArrow";

export default function DiscoverShopnow() {
  const DiscoverShopnow = useHomeStore((state) => state.DiscoverShopnow);

  const swiperId = useId().replace(/:/g, "");
  const cardTemplate = (item) => {
    return (
      <div className="px-1">
        <div className="rounded-xl bg-white border border-[#E0ECE9] w-full max-w-[260px] mx-auto md:h-auto transition">
          {/* IMAGE SECTION */}
          <div className="relative">
            <span
              className="absolute top-2 left-2 bg-[rgba(0,0,0,0.3)] text-white 
          text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-lg"
            >
              129 views
            </span>

            <span
              className="absolute top-2 right-3 bg-white rounded-full shadow-md cursor-pointer
          w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center"
            >
              <i className="pi pi-heart text-[14px] sm:text-[18px] text-[#1EA766]"></i>
            </span>

            <img
              src={typeof item.image === "string" ? item.image : item.image.src}
              alt={item.title}
              className="w-full h-[200px] xs:h-[230px] sm:h-[260px] md:h-[320px] lg:h-[360px] object-cover rounded-t-xl"
            />
          </div>

          {/* PRODUCT INFO */}
          <div className="flex items-start gap-3 sm:gap-4 px-3 mt-4">
            {/* SMALL IMAGE */}
            <img
              src={typeof item.image === "string" ? item.image : item.image.src}
              alt={item.title}
              className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-md object-cover"
            />

            {/* TEXT CONTENT */}
            <div className="flex flex-col leading-tight">
              <p className="text-xs sm:text-sm font-medium text-[#21252C]">
                {item.title}
              </p>

              <p className="text-sm sm:text-lg font-semibold text-[#1EA766] mt-1">
                ${item.price}
              </p>

              <span className="bg-[#E6F4F2] text-[#1EA766] text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-md w-fit mt-1">
                {item.discount}
              </span>
            </div>
          </div>

          {/* ADD TO CART */}
          <div className="w-full flex justify-center mt-3 mb-4">
            <Button
              label="Add to Cart"
              className="w-[90%] p-2 sm:p-3 text-xs sm:text-sm bg-[#E6F4F2] text-[#1EA766] rounded-xl"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full ">
      <div className="site-shell relative">
        {/* Header */}
        <div className="flex justify-center items-center mb-8">
          <div>
            <h2 className="sm:text-3xl font-semibold text-gray-800">
              Discover <span>&</span> Shop now
            </h2>
          </div>
        </div>

        <div className="relative">
          <CarouselArrow
            direction="previous"
            label="Previous products"
            className={`custom-prev-${swiperId} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:left-2 lg:flex xl:left-[-60px]`}
          />
          <CarouselArrow
            direction="next"
            label="Next products"
            className={`custom-next-${swiperId} absolute top-1/2 z-20 hidden -translate-y-1/2 lg:right-2 lg:flex xl:right-[-60px]`}
          />

          {/* Swiper */}
          <Swiper
            modules={[Navigation]}
            loop={true}
            spaceBetween={10}
            navigation={{
              prevEl: `.custom-prev-${swiperId}`,
              nextEl: `.custom-next-${swiperId}`,
            }}
            breakpoints={{
              1400: { slidesPerView: 5 },
              1200: { slidesPerView: 4 },
              992: { slidesPerView: 3 },
              768: { slidesPerView: 3 },
              0: { slidesPerView: 1 },
            }}
          >
            {shopNow.map((item, index) => (
              <SwiperSlide key={index}>{cardTemplate(item)}</SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
