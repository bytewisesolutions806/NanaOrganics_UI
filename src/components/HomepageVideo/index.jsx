'use client';

import CarouselArrow from '@/components/CarouselArrow';
import { useHomeStore } from '@/store/HomeStore';
import { useId, useRef } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';

export default function HomepageVideo({ section: initialSection }) {
  const storedSection = useHomeStore((state) => state.homepageVideo);
  const section = initialSection === undefined ? storedSection : initialSection;
  const sectionRef = useRef(null);
  const carouselId = useId().replace(/:/g, '');
  const videos = section?.videos || [];

  if (!videos.length) return null;

  const pauseAll = () => {
    sectionRef.current?.querySelectorAll('video').forEach((video) => video.pause());
  };

  const playOnly = (activeVideo) => {
    sectionRef.current?.querySelectorAll('video').forEach((video) => {
      if (video !== activeVideo) video.pause();
    });
  };

  return (
    <section
      ref={sectionRef}
      className="my-10 overflow-hidden px-4 sm:my-14 sm:px-6 lg:px-10"
      aria-labelledby="homepage-video-title"
    >
      <div className="mx-auto max-w-[1300px]">
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
                      preload="none"
                      aria-label={`${section.title} video ${index + 1}`}
                      onPlay={(event) => playOnly(event.currentTarget)}
                    >
                      <source src={video.source} type={video.mimeType || 'video/mp4'} />
                      Your browser does not support embedded videos.
                    </video>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
