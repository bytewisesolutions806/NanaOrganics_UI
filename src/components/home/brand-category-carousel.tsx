"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { WaveDivider } from "@/components/ui/wave-divider";
import type {
  StoreBrand,
  StoreCategory,
  StoreHomepageSettings,
} from "@/types/storefront";

interface BrandCategoryCarouselProps {
  brand: StoreBrand;
  settings?: StoreHomepageSettings | null;
}

interface ParentCategory {
  category: StoreCategory;
  brandSlug: string;
}

function displayCategoryName(name: string) {
  if (name !== name.toUpperCase()) return name;

  return name
    .toLocaleLowerCase()
    .replace(/(^|[\s,/&-])\p{L}/gu, (letter) => letter.toLocaleUpperCase());
}

export function BrandCategoryCarousel({
  brand,
  settings,
}: BrandCategoryCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, ParentCategory>();
    const childCategoryIds = new Set<string>();

    for (const category of brand.categories) {
      for (const child of category.children) {
        childCategoryIds.add(child.id);
      }
    }

    for (const category of brand.categories) {
      if (childCategoryIds.has(category.id)) continue;

      if (!uniqueCategories.has(category.id)) {
        uniqueCategories.set(category.id, {
          category,
          brandSlug: brand.slug,
        });
      }
    }

    return [...uniqueCategories.values()]
      .sort(
        (left, right) =>
          left.category.position - right.category.position ||
          left.category.name.localeCompare(right.category.name),
      )
      .slice(0, settings?.categoryLimit ?? 12);
  }, [brand, settings?.categoryLimit]);

  function updateScrollProgress(carousel: HTMLDivElement) {
    const maximumScroll = carousel.scrollWidth - carousel.clientWidth;
    setIsScrollable(maximumScroll > 1);
    setScrollProgress(
      maximumScroll > 0
        ? Math.min(
            100,
            Math.max(0, (carousel.scrollLeft / maximumScroll) * 100),
          )
        : 0,
    );
  }

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const update = () => updateScrollProgress(carousel);
    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(carousel);

    return () => resizeObserver.disconnect();
  }, [categories.length]);

  if (!categories.length) return null;

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    updateScrollProgress(event.currentTarget);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const carousel = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: carousel.scrollLeft,
      moved: false,
    };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 5) drag.moved = true;
    event.currentTarget.scrollLeft = drag.scrollLeft - distance;
  }

  function finishPointerDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current.pointerId !== event.pointerId) return;

    dragRef.current.pointerId = -1;
  }

  function handleCarouselClick(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current.moved) return;

    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    event.currentTarget.scrollBy({
      left:
        (event.key === "ArrowRight" ? 1 : -1) *
        Math.max(240, event.currentTarget.clientWidth * 0.65),
      behavior: "smooth",
    });
  }

  return (
    <section
      aria-labelledby="brand-categories-heading"
      className="relative isolate overflow-hidden bg-[#fdfefd]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/2 hidden h-[440px] w-[310px] -translate-y-1/2 bg-[#e1e9e4] lg:block xl:h-[480px] xl:w-[340px]"
        style={{
          WebkitMaskImage: "url('/images/category-side-image.png')",
          maskImage: "url('/images/category-side-image.png')",
          WebkitMaskPosition: "left center",
          maskPosition: "left center",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />

      <div className="relative mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-16 lg:py-[72px]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#34453a]">
            {settings?.categoryEyebrow ?? "Browse our range"}
          </p>
          <h2
            id="brand-categories-heading"
            className="mt-2 font-serif text-3xl font-semibold tracking-[-0.02em] text-[#252a2c] sm:text-[38px]"
          >
            {settings?.categoryTitle ?? "Shop by Category"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#59635d]">
            {settings?.categoryDescription ??
              "Explore our curated range of natural care products."}
          </p>
        </div>

        <div className="relative mt-8 lg:mt-10">
          <div
            ref={carouselRef}
            role="region"
            tabIndex={0}
            aria-label="All parent product categories. Swipe, drag, or use the left and right arrow keys to browse."
            onScroll={handleScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerDrag}
            onPointerCancel={finishPointerDrag}
            onClickCapture={handleCarouselClick}
            onKeyDown={handleKeyDown}
            className="flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-3 outline-none [scrollbar-width:none] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#2C5D43]/50 focus-visible:ring-offset-4 [&::-webkit-scrollbar]:hidden sm:gap-4 lg:gap-5"
          >
            {categories.map(({ category, brandSlug }) => {
              const image =
                category.featuredAsset?.preview ??
                category.featuredAsset?.source;

              return (
                <Link
                  key={category.id}
                  href={`/shop/${encodeURIComponent(category.slug)}?brand=${encodeURIComponent(brandSlug)}`}
                  draggable={false}
                  className="group flex w-[46%] shrink-0 snap-start flex-col items-center px-1 py-3 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C5D43] sm:w-[31%] md:w-[23%] lg:w-[calc((100%-6.25rem)/6)]"
                >
                  <span className="relative grid size-[128px] place-items-center bg-transparent transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04] sm:size-[146px] lg:size-[180px]">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        unoptimized
                        draggable={false}
                        sizes="(min-width: 1024px) 168px, (min-width: 640px) 146px, 128px"
                        className="select-none object-contain mix-blend-multiply"
                      />
                    ) : (
                      <Leaf
                        aria-hidden="true"
                        className="size-16 text-[#58b947]"
                        strokeWidth={1.5}
                      />
                    )}
                  </span>
                  <span className="mt-2 line-clamp-2 max-w-[160px] text-base font-medium leading-[1.35] text-[#263029] transition-colors group-hover:text-[#2C5D43] sm:text-sm">
                    {displayCategoryName(category.name)}
                  </span>
                </Link>
              );
            })}
          </div>

          {isScrollable ? (
            <div
              aria-hidden="true"
              className="mx-auto mt-4 h-1 w-24 overflow-hidden rounded-full bg-[#e5ede4]"
            >
              <span
                className="block h-full w-7 rounded-full bg-[#58b947] transition-transform duration-150"
                style={{
                  transform: `translateX(${(scrollProgress / 100) * 68}px)`,
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-7 text-center sm:mt-8">
          <Link
            href={`${settings?.categoryCtaLink ?? "/categories"}${(settings?.categoryCtaLink ?? "/categories").includes("?") ? "&" : "?"}brand=${encodeURIComponent(brand.slug)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#2C5D43] px-5 text-base  text-white shadow-[0_8px_18px_rgba(44,93,67,0.18)] transition hover:-translate-y-0.5 hover:bg-[#234b36] hover:shadow-[0_10px_22px_rgba(44,93,67,0.24)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2C5D43]"
          >
            {settings?.categoryCtaLabel ?? "Discover Categories"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
      <WaveDivider />
    </section>
  );
}
