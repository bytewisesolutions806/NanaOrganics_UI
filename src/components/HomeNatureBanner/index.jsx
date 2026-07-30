import React from 'react'
import { Button } from 'primereact/button'
import Image from 'next/image'
import GalleryImage4 from "@/assets/images/gallery/gallery_image_4.png";
const index = () => {
  return (
    <>
    <section className="mt-10">
        {/* Image section for Bring Nature Today */}

        <div className="relative w-full  px-3 sm:px-4 md:px-6 lg:px-8">
          {/* IMAGE CONTAINER */}
          <div
            className="
      relative w-full max-w-[1220px] mx-auto
      h-[260px]
      sm:h-[320px]
      md:h-[360px]
      lg:h-[420px]
    "
          >
            <Image
              src={GalleryImage4}
              alt="Banner Image"
              fill
              priority
              className="object-cover rounded-xl"
            />
          </div>

          {/* OVERLAY CONTENT */}
          <div className="absolute inset-0 flex items-center px-6 sm:px-8">
            <div
              className="
        ml-[6%] sm:ml-[8%] md:ml-[12%] lg:ml-[20%]
        max-w-[90%] sm:max-w-[500px] lg:max-w-[600px]
        text-white space-y-4
      "
            >
              <h2
                className="
          font-semibold leading-tight
          text-[18px]
          sm:text-[22px]
          md:text-[28px]
          lg:text-[36px]
        "
              >
                Bring Nature Home Today
              </h2>

              <p
                className="
          text-[13px]
          sm:text-[14px]
          md:text-[16px]
          lg:text-lg
          leading-relaxed
        "
              >
                Experience the pure goodness of organic living with Nana
                Organics. From farm-fresh ingredients to natural care essentials
                everything your body and home deserve
              </p>

              <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                <Button
                  label="Shop now"
                  className="
      bg-white text-black border border-gray-300
      w-24 h-8 text-[11px]
      sm:w-28 sm:h-9 sm:text-xs
      md:w-32 md:h-10 md:text-sm
      rounded-xl
    "
                />

                <Button
                  label="Explore collections"
                  className="
      bg-green-600 text-white border border-green-600
      w-28 h-8 text-[10px]
      sm:w-36 sm:h-9 sm:text-xs
      md:w-40 md:h-10 md:text-sm
      rounded-xl font-normal
    "
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default index
