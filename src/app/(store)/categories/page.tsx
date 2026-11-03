import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";

import {
  getStorefrontBrands,
} from "@/services/api/storefront";

export const metadata: Metadata = {
  title: "Shop by Category",
  description: "Explore all product categories from Nana Organics.",
};

const PAGE_SIZE = 12;

interface CategoriesPageProps {
  searchParams: Promise<{
    brand?: string | string[];
    page?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getBrandCategories(
  categories: Awaited<ReturnType<typeof getStorefrontBrands>>[number]["categories"],
) {
  const childCategoryIds = new Set(
    categories.flatMap((category) => category.children.map((child) => child.id)),
  );

  return categories
    .filter((category) => !childCategoryIds.has(category.id))
    .sort(
      (left, right) =>
        left.position - right.position || left.name.localeCompare(right.name),
    );
}

function getPageHref(brandSlug: string, page: number) {
  const params = new URLSearchParams({ brand: brandSlug });
  if (page > 1) params.set("page", String(page));
  return `/categories?${params.toString()}`;
}

async function CategoriesContent({
  searchParams,
}: CategoriesPageProps) {
  const [query, brands] = await Promise.all([
    searchParams,
    getStorefrontBrands(),
  ]);
  const requestedBrand = firstValue(query.brand);
  const brand =
    brands.find((item) => item.slug === requestedBrand) ??
    brands.find((item) => item.featured) ??
    brands[0];

  if (!brand) {
    return (
      <main className="mx-auto min-h-[55vh] max-w-[1240px] px-5 py-16 text-center sm:px-8">
        <h1 className="font-serif text-3xl font-semibold text-[#203428]">
          Categories are unavailable
        </h1>
      </main>
    );
  }

  const categories = getBrandCategories(brand.categories);
  const pageCount = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const requestedPage = Number(firstValue(query.page) ?? "1");
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, pageCount)
      : 1;
  const pageCategories = categories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <main className="min-h-[55vh] bg-[#fcfdf9] pb-16 pt-8 sm:pb-20 sm:pt-12">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-[#68756d]">
            <li>
              <Link
                href={`/?brand=${encodeURIComponent(brand.slug)}`}
                className="transition-colors hover:text-[#2d6048]"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[#2d6048]">
              Categories
            </li>
          </ol>
        </nav>

        <header className="border-b border-[#e2e9e2] pb-6 sm:pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66846c]">
            Explore {brand.name}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#203428] sm:text-4xl">
            All Categories
          </h1>
          <p className="mt-2 text-sm text-[#657168] sm:text-base">
            Browse {categories.length} categories from {brand.name}.
          </p>
        </header>

        {pageCategories.length ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageCategories.map((category) => {
              const image =
                category.featuredAsset?.preview ??
                category.featuredAsset?.source;

              return (
                <Link
                  key={category.id}
                  href={`/shop/${encodeURIComponent(category.slug)}?brand=${encodeURIComponent(brand.slug)}`}
                  className="group overflow-hidden rounded-2xl border border-[#dfe8df] bg-white shadow-[0_10px_30px_rgba(40,72,49,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(40,72,49,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#edf2e9]">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        unoptimized
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-[#5d8c66]">
                        <Leaf className="size-10" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-[#21392a]">
                      {category.name}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-[#dfe8df] bg-white px-5 py-12 text-center text-[#68756d]">
            No categories are available for this brand yet.
          </p>
        )}

        {pageCount > 1 ? (
          <nav
            aria-label="Category pages"
            className="mt-9 flex flex-wrap items-center justify-center gap-2"
          >
            <Link
              href={getPageHref(brand.slug, Math.max(1, currentPage - 1))}
              aria-disabled={currentPage === 1}
              aria-label="Previous page"
              className={`grid size-10 place-items-center rounded-lg border border-[#d6e1d8] bg-white text-[#315f48] ${
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-[#eff6f0]"
              }`}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Link>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (page) => (
                <Link
                  key={page}
                  href={getPageHref(brand.slug, page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`grid size-10 place-items-center rounded-lg border text-sm font-semibold ${
                    page === currentPage
                      ? "border-[#315f48] bg-[#315f48] text-white"
                      : "border-[#d6e1d8] bg-white text-[#315f48] hover:bg-[#eff6f0]"
                  }`}
                >
                  {page}
                </Link>
              ),
            )}
            <Link
              href={getPageHref(brand.slug, Math.min(pageCount, currentPage + 1))}
              aria-disabled={currentPage === pageCount}
              aria-label="Next page"
              className={`grid size-10 place-items-center rounded-lg border border-[#d6e1d8] bg-white text-[#315f48] ${
                currentPage === pageCount
                  ? "pointer-events-none opacity-50"
                  : "hover:bg-[#eff6f0]"
              }`}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </nav>
        ) : null}
      </div>
    </main>
  );
}

export default function CategoriesPage(props: CategoriesPageProps) {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-[55vh] bg-[#fcfdf9] px-5 py-12 sm:px-8"
          aria-busy="true"
        >
          <div className="mx-auto max-w-[1240px] animate-pulse">
            <div className="h-10 w-64 rounded bg-[#e8eee8]" />
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] rounded-2xl border border-[#e4ebe4] bg-white"
                />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <CategoriesContent {...props} />
    </Suspense>
  );
}
