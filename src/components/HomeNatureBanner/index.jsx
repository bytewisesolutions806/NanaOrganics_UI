'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GalleryImage4 from '@/assets/images/gallery/gallery_image_4.png';

const HomeNatureBanner = () => {
  return (
    <section className="site-shell my-10">
      <div className="relative isolate min-h-[300px] overflow-hidden rounded-xl sm:min-h-[330px] md:min-h-[360px] lg:min-h-[380px]">
        <Image
          src={GalleryImage4}
          alt="Fresh organic vegetables, herbs, and spices"
          fill
          sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1336px) calc(100vw - 40px), 1296px"
          className="object-cover object-[64%_center] sm:object-center"
        />

        <div
          className="absolute inset-0 bg-gradient-to-r from-[#13201E]/75 via-[#13201E]/45 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-h-[300px] items-center px-5 py-8 sm:min-h-[330px] sm:px-10 md:min-h-[360px] md:px-14 lg:min-h-[380px] lg:px-20">
          <div className="max-w-[580px] text-white">
            <h2 className="text-[26px] font-semibold leading-tight sm:text-[30px] md:text-[34px] lg:text-[38px]">
              Bring Nature Home Today
            </h2>

            <p className="mt-3 max-w-[560px] text-[13px] leading-6 sm:text-sm md:text-base md:leading-7">
              Experience the pure goodness of organic living with Nana Organics. From farm-fresh
              ingredients to natural care essentials—everything your body and home deserve.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="inline-flex min-h-10 min-w-[106px] items-center justify-center rounded-lg border border-[#D7DFDD] bg-white px-5 text-xs font-semibold text-[#17211F] transition-colors hover:bg-[#F3F8F7] sm:min-h-11 sm:min-w-[122px] sm:text-sm"
              >
                Shop Now
              </Link>
              <Link
                href="/shop"
                className="inline-flex min-h-10 min-w-[138px] items-center justify-center rounded-lg border border-[#1EA766] bg-[#1EA766] px-5 text-xs font-semibold text-white transition-colors hover:border-[#178753] hover:bg-[#178753] sm:min-h-11 sm:min-w-[160px] sm:text-sm"
              >
                Explore Collections
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeNatureBanner;
