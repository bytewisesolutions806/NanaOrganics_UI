import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShopCategoryListing } from "@/components/shop/shop-category-listing";
import { SubcategoryCarousel } from "@/components/shop/subcategory-carousel";
import {
  getStorefrontBrands,
  getStorefrontCategories,
  getStorefrontCategory,
} from "@/services/api/storefront";

interface ShopCategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ brand?: string | string[] }>;
}

function requestedBrandFrom(brand: string | string[] | undefined) {
  return Array.isArray(brand) ? brand[0] : brand;
}

async function ShopCategoryContent({
  params,
  searchParams,
}: ShopCategoryPageProps) {
  const [{ category: categorySlug }, query, brands, allCategories] =
    await Promise.all([
      params,
      searchParams,
      getStorefrontBrands(),
      getStorefrontCategories(),
    ]);
  const selectedBrand =
    brands.find((brand) => brand.slug === requestedBrandFrom(query.brand)) ??
    brands.find((brand) => brand.featured) ??
    brands[0];
  const brandSlug =
    selectedBrand?.slug ?? requestedBrandFrom(query.brand) ?? "";
  const categoryData = await getStorefrontCategory(categorySlug);

  if (!categoryData) notFound();

  const { category, products } = categoryData;
  const brandQuery = brandSlug ? `?brand=${encodeURIComponent(brandSlug)}` : "";
  const breadcrumbs = [
    { id: "home", name: "Home", slug: "" },
    ...category.breadcrumbs.filter(
      (item) =>
        item.slug !== "__root_collection__" && item.slug !== category.slug,
    ),
    { id: category.id, name: category.name, slug: category.slug },
  ];

  return (
    <main className="min-h-[55vh] bg-[#fcfdf9] pb-16 pt-7 sm:pb-20 sm:pt-10">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[#68756d]">
            {breadcrumbs.map((item, index) => {
              const isCurrent = index === breadcrumbs.length - 1;
              return (
                <li
                  key={`${item.id}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index ? <span aria-hidden="true">/</span> : null}
                  {isCurrent ? (
                    <span
                      aria-current="page"
                      className="font-medium text-[#2d6048]"
                    >
                      {category.name}
                    </span>
                  ) : (
                    <Link
                      href={
                        item.slug
                          ? `/shop/${encodeURIComponent(item.slug)}${brandQuery}`
                          : `/${brandQuery}`
                      }
                      className="transition-colors hover:text-[#2d6048]"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <header className="border-b border-[#e2e9e2] pb-6 sm:pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#66846c]">
            Shop by category
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#203428] sm:text-4xl">
            {category.name}
          </h1>
          {category.description.trim() ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#657168] sm:text-base">
              {category.description}
            </p>
          ) : null}
        </header>

        {category.children.length ? (
          <section
            className="mt-8 sm:mt-10"
            aria-labelledby="subcategories-heading"
          >
            {/* <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#66846c]">
                Explore the range
              </p>
              <h2
                id="subcategories-heading"
                className="mt-2 font-serif text-2xl font-semibold text-[#203428] sm:text-3xl"
              >
                Shop by subcategory
              </h2>
            </div> */}
            <SubcategoryCarousel category={category} brandQuery={brandQuery} />
          </section>
        ) : null}

        <ShopCategoryListing
          key={category.slug}
          category={category}
          categories={allCategories}
          products={products}
          facets={categoryData.facets}
          brandSlug={brandSlug}
          paginationSlug={category.slug}
          totalItems={categoryData.totalItems}
          title={`All ${category.name} products`}
        />
      </div>
    </main>
  );
}

function ShopCategoryLoading() {
  return (
    <main
      className="min-h-[55vh] bg-[#fcfdf9] px-5 pb-16 pt-10 sm:px-8"
      aria-busy="true"
    >
      <div className="mx-auto max-w-[1240px] animate-pulse">
        <div className="h-4 w-36 rounded bg-[#e8eee8]" />
        <div className="mt-8 h-10 w-64 rounded bg-[#e8eee8]" />
        <div className="mt-4 h-5 max-w-xl rounded bg-[#e8eee8]" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-[510px] max-w-[304px] rounded-xl border border-[#e4ebe4] bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ShopCategoryPage(props: ShopCategoryPageProps) {
  return (
    <Suspense fallback={<ShopCategoryLoading />}>
      <ShopCategoryContent {...props} />
    </Suspense>
  );
}
