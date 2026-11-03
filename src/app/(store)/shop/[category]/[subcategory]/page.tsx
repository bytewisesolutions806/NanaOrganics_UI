import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ShopCategoryListing } from "@/components/shop/shop-category-listing";
import {
  getStorefrontBrands,
  getStorefrontCategories,
  getStorefrontCategory,
} from "@/services/api/storefront";

interface ShopSubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{ brand?: string | string[] }>;
}

function requestedBrandFrom(brand: string | string[] | undefined) {
  return Array.isArray(brand) ? brand[0] : brand;
}

async function ShopSubcategoryContent({
  params,
  searchParams,
}: ShopSubcategoryPageProps) {
  const [
    { category: parentSlug, subcategory: subcategorySlug },
    query,
    brands,
    allCategories,
  ] = await Promise.all([
    params,
    searchParams,
    getStorefrontBrands(),
    getStorefrontCategories(),
  ]);
  const requestedBrand = requestedBrandFrom(query.brand);
  const selectedBrand =
    brands.find((brand) => brand.slug === requestedBrand) ??
    brands.find((brand) => brand.featured) ??
    brands[0];
  const brandSlug = selectedBrand?.slug ?? requestedBrand ?? "";
  const parentCategory = brands
    .flatMap((brand) => brand.categories)
    .find((category) => category.slug === parentSlug);
  const subcategory = parentCategory?.children.find(
    (child) => child.slug === subcategorySlug,
  );

  if (!parentCategory || !subcategory) notFound();

  const categoryData = await getStorefrontCategory(subcategorySlug);
  if (!categoryData) notFound();

  const brandQuery = brandSlug ? `?brand=${encodeURIComponent(brandSlug)}` : "";

  return (
    <main className="min-h-[55vh] bg-[#fcfdf9] px-5 pb-16 pt-7 sm:px-8 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-[1240px]">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#68756d]">
            <li>
              <Link href={`/${brandQuery}`} className="transition-colors hover:text-[#2d6048]">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/shop/${encodeURIComponent(parentSlug)}${brandQuery}`}
                className="transition-colors hover:text-[#2d6048]"
              >
                {parentCategory.name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-[#2d6048]">
              {subcategory.name}
            </li>
          </ol>
        </nav>

        <header className="border-b border-[#e2e9e2] pb-6 sm:pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66846c]">
            Shop by subcategory
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#203428] sm:text-4xl">
            {subcategory.name}
          </h1>
          {categoryData.category.description.trim() ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657168] sm:text-base">
              {categoryData.category.description}
            </p>
          ) : null}
        </header>

        <ShopCategoryListing
          key={subcategorySlug}
          category={{
            ...parentCategory,
            description: categoryData.category.description,
          }}
          categories={allCategories}
          products={categoryData.products}
          facets={categoryData.facets}
          brandSlug={brandSlug}
          selectedSubcategorySlug={subcategorySlug}
          paginationSlug={subcategorySlug}
          totalItems={categoryData.totalItems}
          title={`${subcategory.name} products`}
        />
      </div>
    </main>
  );
}

function ShopSubcategoryLoading() {
  return (
    <main
      className="min-h-[55vh] bg-[#fcfdf9] px-5 pb-16 pt-10 sm:px-8"
      aria-busy="true"
    >
      <div className="mx-auto max-w-[1240px] animate-pulse">
        <div className="h-4 w-36 rounded bg-[#e8eee8]" />
        <div className="mt-8 h-10 w-64 rounded bg-[#e8eee8]" />
        <div className="mt-4 h-5 max-w-xl rounded bg-[#e8eee8]" />
        <div className="mt-10 h-[510px] max-w-[304px] rounded-xl border border-[#e4ebe4] bg-white" />
      </div>
    </main>
  );
}

export default function ShopSubcategoryPage(props: ShopSubcategoryPageProps) {
  return (
    <Suspense fallback={<ShopSubcategoryLoading />}>
      <ShopSubcategoryContent {...props} />
    </Suspense>
  );
}
