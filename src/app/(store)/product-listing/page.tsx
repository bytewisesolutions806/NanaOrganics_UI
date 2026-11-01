import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { ShopCategoryListing } from "@/components/shop/shop-category-listing";
import {
  getStorefrontBrands,
  getStorefrontCategories,
  getStorefrontCatalog,
} from "@/services/api/storefront";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Explore thoughtfully sourced organic pantry staples and everyday essentials.",
};

interface ProductListingPageProps {
  searchParams: Promise<{ brand?: string | string[] }>;
}

async function ProductListingContent({
  searchParams,
}: ProductListingPageProps) {
  const [{ brand: requestedBrand }, brands, allCategories] = await Promise.all([
    searchParams,
    getStorefrontBrands(),
    getStorefrontCategories(),
  ]);
  const brandSlug = Array.isArray(requestedBrand)
    ? requestedBrand[0]
    : requestedBrand;
  const selectedBrand =
    brands.find((brand) => brand.slug === brandSlug) ??
    brands.find((brand) => brand.featured) ??
    brands[0];
  const categories = selectedBrand?.categories ?? [];
  const activeBrandSlug = selectedBrand?.slug ?? brandSlug ?? "";
  const catalog = await getStorefrontCatalog(categories);

  return (
    <main className="min-h-[55vh] bg-[#fcfdf9] pb-16 pt-7 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#68756d]">
            <li>
              <Link href="/" className="transition-colors hover:text-[#2d6048]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[#2d6048]">
              All Products
            </li>
          </ol>
        </nav>

        <header className="border-b border-[#e2e9e2] pb-6 sm:pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66846c]">
            Thoughtfully sourced
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#203428] sm:text-4xl">
            All Products
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657168] sm:text-base">
            Discover wholesome pantry staples and everyday rituals, rooted in
            nature and made with care.
          </p>
        </header>

        <ShopCategoryListing
          category={null}
          categories={allCategories}
          products={catalog.products}
          facets={catalog.facets}
          totalItems={catalog.totalItems}
          brandSlug={activeBrandSlug}
          title="Shop our collection"
        />
      </div>
    </main>
  );
}

export default function ProductListingPage(props: ProductListingPageProps) {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-[55vh] bg-[#fcfdf9] px-5 py-10 text-sm text-[#68756d] sm:px-8"
          aria-busy="true"
        >
          Loading products...
        </main>
      }
    >
      <ProductListingContent {...props} />
    </Suspense>
  );
}
