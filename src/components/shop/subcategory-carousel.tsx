"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { StoreCategory } from "@/types/storefront";

interface SubcategoryCarouselProps {
  category: StoreCategory;
  brandQuery: string;
}

export function SubcategoryCarousel({
  category,
  brandQuery,
}: SubcategoryCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    setCanScrollPrevious(carousel.scrollLeft > 1);
    setCanScrollNext(
      carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(carousel);
    return () => resizeObserver.disconnect();
  }, [updateScrollState, category.children.length]);

  function scroll(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  const subcategories = category.children
    .slice()
    .sort(
      (left, right) =>
        left.position - right.position || left.name.localeCompare(right.name),
    );

  return (
    <div className="relative">
      {canScrollPrevious ? (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous subcategories"
          className="absolute -left-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-[#dfe8df] bg-white text-[#315f48] shadow-md transition hover:bg-[#f3f7f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48] sm:grid"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      ) : null}
      <div
        ref={carouselRef}
        role="region"
        tabIndex={0}
        aria-label={`${category.name} subcategories`}
        onScroll={updateScrollState}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
      >
        {subcategories.map((child) => {
          const image = child.featuredAsset?.preview ?? child.featuredAsset?.source;

          return (
            <Link
              key={child.id}
              href={`/shop/${encodeURIComponent(category.slug)}/${encodeURIComponent(child.slug)}${brandQuery}`}
              className="group w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#dfe8df] bg-white shadow-[0_10px_30px_rgba(40,72,49,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(40,72,49,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48] sm:w-[48%] lg:w-[32%] xl:w-[calc((100%-3.75rem)/4)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#edf2e9]">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 639px) 82vw, (max-width: 1023px) 48vw, (max-width: 1279px) 32vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-[#5d8c66]">
                    <Leaf className="size-10" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[#21392a]">{child.name}</h3>
              </div>
            </Link>
          );
        })}
      </div>
      {canScrollNext ? (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next subcategories"
          className="absolute -right-4 top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-[#dfe8df] bg-white text-[#315f48] shadow-md transition hover:bg-[#f3f7f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48] sm:grid"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
