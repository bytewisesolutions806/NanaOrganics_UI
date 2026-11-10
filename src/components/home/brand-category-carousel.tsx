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
  categories: StoreCategory[];
  brands?: StoreBrand[];
  brandSlug?: string;
  initialBrandSlug?: string;
  isDefaultHomepage?: boolean;
  settings?: StoreHomepageSettings | null;
}

function displayCategoryName(name: string) {
  if (name !== name.toUpperCase()) return name;

  return name
    .toLocaleLowerCase()
    .replace(/(^|[\s,/&-])\p{L}/gu, (letter) => letter.toLocaleUpperCase());
}

export function BrandCategoryCarousel({
  categories: sourceCategories,
  brands = [],
  brandSlug = "",
  initialBrandSlug = brandSlug,
  isDefaultHomepage = false,
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
  const [activeBrandSlug, setActiveBrandSlug] = useState(initialBrandSlug);
  const activeBrand = brands.find((brand) => brand.slug === activeBrandSlug) ??
    brands[0];
  const displayedBrandSlug = isDefaultHomepage
    ? activeBrand?.slug ?? brandSlug
    : brandSlug;
  const sourceCategoriesForBrand =
    isDefaultHomepage && activeBrand
      ? activeBrand.categories
      : sourceCategories;

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, StoreCategory>();
    const childCategoryIds = new Set<string>();

    for (const category of sourceCategoriesForBrand) {
      for (const child of category.children) {
        childCategoryIds.add(child.id);
      }
    }

    for (const category of sourceCategoriesForBrand) {
      if (childCategoryIds.has(category.id)) continue;

      if (!uniqueCategories.has(category.id)) {
        uniqueCategories.set(category.id, category);
      }
    }

    return [...uniqueCategories.values()]
      .sort(
        (left, right) =>
          left.position - right.position ||
          left.name.localeCompare(right.name),
      )
      .slice(0, settings?.categoryLimit ?? 12);
  }, [sourceCategoriesForBrand, settings?.categoryLimit]);

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

  if (!categories.length && !isDefaultHomepage) return null;

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

  function handleBrandTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex = index;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % brands.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + brands.length) % brands.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = brands.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextBrand = brands[nextIndex];
    setActiveBrandSlug(nextBrand.slug);
    document.getElementById(`category-brand-tab-${nextBrand.slug}`)?.focus();
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

      <div
        className="relative mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-16 lg:py-[72px]"
      >
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

        {isDefaultHomepage && brands.length ? (
          <div
            role="tablist"
            aria-label="Shop categories by brand"
            className="mx-auto mt-5 flex w-fit max-w-full items-center overflow-x-auto border-b border-[#d5dfd8] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {brands.map((brand, index) => {
              const isActive = brand.slug === activeBrand?.slug;

              return (
                <button
                  key={brand.id}
                  id={`category-brand-tab-${brand.slug}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  aria-controls="brand-category-panel"
                  onClick={() => setActiveBrandSlug(brand.slug)}
                  onKeyDown={(event) => handleBrandTabKeyDown(event, index)}
                  className={`relative min-h-10 shrink-0 px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2C5D43] sm:px-5 ${
                    isActive
                      ? "font-medium text-[#222a25] after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-[#2C5D43] sm:after:inset-x-5"
                      : "text-[#828a85] hover:text-[#2C5D43]"
                  }`}
                >
                  {brand.name}
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          className={`relative ${isDefaultHomepage && brands.length ? "mt-5 sm:mt-7" : "mt-8 lg:mt-10"}`}
        >
          <div
            ref={carouselRef}
            role={isDefaultHomepage ? "tabpanel" : "region"}
            tabIndex={0}
            id={isDefaultHomepage ? "brand-category-panel" : undefined}
            aria-label={
              isDefaultHomepage
                ? `${activeBrand?.name ?? "Selected brand"} categories`
                : "All parent product categories. Swipe, drag, or use the left and right arrow keys to browse."
            }
            aria-labelledby={
              isDefaultHomepage && activeBrand
                ? `category-brand-tab-${activeBrand.slug}`
                : undefined
            }
            onScroll={handleScroll}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerDrag}
            onPointerCancel={finishPointerDrag}
            onClickCapture={handleCarouselClick}
            onKeyDown={handleKeyDown}
            className="flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-3 outline-none [scrollbar-width:none] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#2C5D43]/50 focus-visible:ring-offset-4 [&::-webkit-scrollbar]:hidden sm:gap-4 lg:gap-5"
          >
            {categories.map((category) => {
              const image =
                category.featuredAsset?.preview ??
                category.featuredAsset?.source;
              const categoryHref = `/shop/${encodeURIComponent(category.slug)}${
                displayedBrandSlug
                  ? `?brand=${encodeURIComponent(displayedBrandSlug)}`
                  : ""
              }`;

              return (
                <Link
                  key={category.id}
                  href={categoryHref}
                  draggable={false}
                  className="group flex w-[46%] shrink-0 snap-start flex-col items-center px-1 py-3 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C5D43] sm:w-[31%] md:w-[23%] lg:w-[calc((100%-6.25rem)/6)]"
                >
                  <span
                    className="relative grid size-[128px] place-items-center bg-transparent transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04] sm:size-[146px] lg:size-[180px]"
                  >
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
            {!categories.length ? (
              <p className="w-full py-4 text-center text-sm text-[#59635d]">
                No categories are available for this brand yet.
              </p>
            ) : null}
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
              href={`${settings?.categoryCtaLink ?? "/categories"}${
                displayedBrandSlug
                  ? `${(settings?.categoryCtaLink ?? "/categories").includes("?") ? "&" : "?"}brand=${encodeURIComponent(displayedBrandSlug)}`
                  : ""
              }`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#2C5D43] px-5 text-base text-white shadow-[0_8px_18px_rgba(44,93,67,0.18)] transition hover:-translate-y-0.5 hover:bg-[#234b36] hover:shadow-[0_10px_22px_rgba(44,93,67,0.24)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#2C5D43]"
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
