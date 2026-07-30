'use client'
import React from 'react'
import Image from 'next/image'
import ExploreOrganicOfferings from "@/assets/images/ExploreOrganicOfferings.png";
import { useRouter } from "next/navigation";
const BannerOrganic = () => {
  const router = useRouter();
  return (
    <>
     {/* Explore Our Organic Offerings */}
        <div className="mt-10 mb-12 mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row w-full min-h-80 lg:h-[412px] rounded-2xl overflow-hidden">
            {/* LEFT – IMAGE */}
            <div className="w-full lg:w-[60%] h-[220px] sm:h-[300px] lg:h-full relative">
              <Image
                src={ExploreOrganicOfferings}
                alt="Card Image"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* RIGHT – CONTENT */}
            <div className="w-full lg:w-[40%] p-6 sm:p-8 flex flex-col justify-center bg-white">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                Explore Our Organic Offerings
              </h2>

              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Discover the beauty of nature with our handcrafted organic
                products. Your journey starts here!
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-3 bg-[#1ea766] text-white rounded-lg">
                  Shop now
                </button>

                <button className="px-6 py-3 bg-white text-black font-semibold border-2 border-[#C6D8D7] rounded-lg cursor-pointer" onClick={() => router.push('/contact-us')}>
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

export default BannerOrganic
