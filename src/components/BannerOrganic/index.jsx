'use client';
import React from 'react';
import Image from 'next/image';
import { Button } from 'primereact/button';
import ExploreOrganicOfferings from '@/assets/images/ExploreOrganicOfferings.png';
import { useRouter } from 'next/navigation';
const BannerOrganic = () => {
  const router = useRouter();
  return (
    <>
      {/* Explore Our Organic Offerings */}
      <div className="mx-auto w-[calc(100%_-_32px)] max-w-[1296px] md:w-[calc(100%_-_40px)]">
        <div className="flex min-h-80 w-full flex-col overflow-hidden rounded-[32px] lg:h-[412px] lg:flex-row">
          {/* LEFT – IMAGE */}
          <div className="relative h-[260px] w-full sm:h-[320px] lg:h-full lg:w-[58%]">
            <Image
              src={ExploreOrganicOfferings}
              alt="Card Image"
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* RIGHT – CONTENT */}
          <div className="flex w-full flex-col justify-center bg-white p-6 sm:p-8 lg:w-[42%] lg:pl-4">
            <h2
              className="mb-3 text-2xl font-semibold leading-tight text-[#21252C] sm:text-3xl"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Explore Our Organic Offerings
            </h2>

            <p className="mb-6 text-sm font-medium leading-6 text-[#545860] sm:text-base sm:leading-7">
              Discover the beauty of nature with our handcrafted organic products. Your journey
              starts here!
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/shop')}
                className="px-6 py-3 bg-[#1ea766] text-white rounded-lg"
              >
                Shop now
              </Button>

              <Button
                className="px-6 py-3 bg-white text-black font-semibold border-2 border-[#C6D8D7] rounded-lg cursor-pointer"
                onClick={() => router.push('/contact-us')}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BannerOrganic;
