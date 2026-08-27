"use client";
import React from "react";
import Image from "next/image";
import { Button } from "primereact/button";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Galleria } from "primereact/galleria";
import { PhotoService } from "../../service/PhotoService";
import useAuthStore from '@/store/AuthStore';

export default function PositionDemo() {
  const router = useRouter();
  const pathname = usePathname();
  const page = pathname === "/contact-us" ? "contact-us" : "home";
  const images = PhotoService.getImagesByPage(page);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const itemTemplate = (item) => {
    return (
      <div className="relative h-[260px] w-full sm:h-[320px] md:h-[400px] lg:h-[520px]">
        {/* IMAGE WITH RESPONSIVE HEIGHT */}
        <Image
          src={item.itemImageSrc}
          alt={item.alt}
          fill
          sizes="100vw"
          priority={Boolean(item.priority)}
          quality={76}
          className="
            object-cover
          "
        />

        {/* OVERLAY CONTENT */}
        <div
          className="
            absolute inset-0 flex
            items-start
            left-[5%] sm:left-[7%] md:left-[10%] lg:left-[15%]
            top-[10%] sm:top-[20%] md:top-[20%] lg:top-[30%]
          "
        >
          <div className="text-white max-w-[95%] sm:max-w-[90%] md:max-w-[600px]">
            {/* TITLE */}
            <h2
              className="
                text-[20px]
                sm:text-[34px]
                md:text-[45px]
                lg:text-[54px]
                font-bold leading-tight
              "
            >
              {item.title}{" "}
              <span className="bg-[rgba(230,244,242,0.2)] rounded-xl px-1 sm:px-2">
                {item.title2}
              </span>
              <br />
              {item.altTitle}
            </h2>

            {/* DESCRIPTION */}
            <p
              className="
                text-[13px]
                sm:text-[15px]
                md:text-[16px]
                lg:text-[20px]
                mt-2
                lg:leading-8
              "
            >
              {item.alt}
            </p>

            {/* CTA BUTTONS */}
            <div className="pt-3 sm:pt-4 flex flex-wrap gap-3 mt-3">
              <Button
                onClick={() => router.push("/shop")}
                label="Shop now"
                className="
                  bg-white text-black border border-gray-300
                  px-4 h-9 text-xs
                  sm:text-sm sm:h-10
                  lg:h-[50px] lg:text-base
                  rounded-xl
                "
              />
              {pathname === "/contact-us" ? (
                <Button
                  label="Learn More"
                  className="
                  bg-[#1EA766] text-white border border-[#1EA766]
                  px-4 h-9 text-xs
                  sm:text-sm sm:h-10
                  lg:h-[50px] lg:text-base
                  rounded-xl space-x-2 font-normal
                "
                />
              ) : hasHydrated && !isAuthenticated ? (
                <Button
                 onClick={() => router.push("/signup")}
                  icon="pi pi-user-plus"
                  iconPos="left"
                  label="Join Nana Organics"
                  className="
                  bg-[#1EA766] text-white border border-[#1EA766]
                  px-4 h-9 text-xs
                  sm:text-sm sm:h-10
                  lg:h-[50px] lg:text-base
                  rounded-xl space-x-2
                "
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <Galleria
        value={images}
        showThumbnails={false}
        showIndicators={false}
        showIndicatorsOnItem
        indicatorsPosition="bottom"
        item={itemTemplate}
        style={{ maxWidth: "100%" }}
      />
    </div>
  );
}
