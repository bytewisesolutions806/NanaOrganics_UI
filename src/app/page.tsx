import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeHero } from "@/components/home/home-hero";
import { HomeLoading } from "@/components/home/home-loading";
import { BrandCategoryCarousel } from "@/components/home/brand-category-carousel";
import {
  HomeBrandValues,
  HomeProductSections,
  HomeVideoDiscovery,
} from "@/components/home/home-discovery-sections";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeMarketingSections } from "@/components/home/home-marketing-sections";
import {
  getBrandHomepage,
  getStorefrontBrands,
} from "@/services/api/storefront";

interface HomePageProps {
  searchParams: Promise<{
    brand?: string | string[];
  }>;
}

function requestedBrandFrom(
  brand: string | string[] | undefined,
): string | undefined {
  return Array.isArray(brand) ? brand[0] : brand;
}

async function getHeaderData(requestedBrandSlug?: string) {
  const brands = await getStorefrontBrands();

  if (!brands.length) {
    throw new Error("No enabled storefront brands were returned by Vendure.");
  }

  const selectedBrand =
    brands.find((brand) => brand.slug === requestedBrandSlug) ??
    brands.find((brand) => brand.featured) ??
    brands[0];

  return { brands, selectedBrand };
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  try {
    const query = await searchParams;
    const data = await getHeaderData(requestedBrandFrom(query.brand));
    console.log("data.selectedBrand.seoTitle", data.selectedBrand);
    console.log(
      "data.selectedBrand.seoDescription",
      data.selectedBrand.seoDescription,
    );
    return {
      title: {
        absolute:
          data.selectedBrand.seoTitle ??
          `${data.selectedBrand.name} | Nana Organics`,
      },
      description:
        data.selectedBrand.seoDescription ??
        data.selectedBrand.heroDescription ??
        data.selectedBrand.description ??
        `Discover ${data.selectedBrand.name} at Nana Organics.`,
    };
  } catch {
    return {
      title: "Nana Organics",
      description: "Thoughtful organic essentials for everyday living.",
    };
  }
}

async function HomeContent({ searchParams }: HomePageProps) {
  const query = await searchParams;
  let data: Awaited<ReturnType<typeof getBrandHomepage>>;

  try {
    data = await getBrandHomepage(requestedBrandFrom(query.brand));
  } catch (error) {
    console.error("Failed to load homepage storefront data.", error);

    return (
      <>
        <main className="flex min-h-[50vh] items-center justify-center px-5 text-center">
          <p role="alert" className="max-w-lg text-[#27382d]">
            The storefront is temporarily unavailable. Please try again shortly.
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const betweenProductRows = data.marketingSections.filter(
    (section) =>
      section.code === "featured-product" || section.code === "ingredients",
  );
  const afterProductRows = data.marketingSections.filter(
    (section) =>
      section.code !== "featured-product" && section.code !== "ingredients",
  );

  return (
    <>
      <SiteHeader
        brands={data.brands}
        activeBrandSlug={data.selectedBrand.slug}
        variant={
          data.settings?.enabled === false || data.settings?.heroEnabled === false
            ? "solid"
            : "overlay"
        }
      />
      <main className="bg-[#fcfdf9]">
        {data.settings?.enabled === false ? null : (
          <>
            {data.settings?.heroEnabled !== false ? (
              <HomeHero brand={data.selectedBrand} />
            ) : null}
            {data.settings?.categoryEnabled !== false ? (
              <BrandCategoryCarousel
                brand={data.selectedBrand}
                settings={data.settings}
              />
            ) : null}
            {data.settings?.valuesEnabled ? (
              <HomeBrandValues
                settings={data.settings}
                brandSlug={data.selectedBrand.slug}
              />
            ) : null}
            <HomeProductSections
              sections={data.productSections.slice(0, 1)}
              brandSlug={data.selectedBrand.slug}
            />
            <HomeMarketingSections
              sections={betweenProductRows}
              brandSlug={data.selectedBrand.slug}
            />
            <HomeProductSections
              sections={data.productSections.slice(1, 2)}
              brandSlug={data.selectedBrand.slug}
            />
            <HomeMarketingSections
              sections={afterProductRows}
              brandSlug={data.selectedBrand.slug}
            />
            {data.video ? (
              <HomeVideoDiscovery
                video={data.video}
                brandSlug={data.selectedBrand.slug}
              />
            ) : null}
            <HomeProductSections
              sections={data.productSections.slice(2)}
              brandSlug={data.selectedBrand.slug}
            />
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
