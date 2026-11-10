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
import { FooterReviews } from "@/components/layout/footer-reviews";
import { BenefitsFooter } from "@/components/layout/benefits-footer";
import { NanaDifferenceBanner } from "@/components/layout/nana-difference-banner";
import { HomeMarketingSections } from "@/components/home/home-marketing-sections";
import {
  getBrandHomepage,
  getDefaultHomepage,
  getStorefrontBrands,
} from "@/services/api/storefront";
import type { BrandHomepageData } from "@/types/storefront";

const defaultMetadata: Metadata = {
  title: "Nana Organics",
  description: "Thoughtful organic essentials from all our brands.",
};

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

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const brandSlug = requestedBrandFrom((await searchParams).brand);
  if (!brandSlug) return defaultMetadata;

  try {
    const brand = (await getStorefrontBrands()).find(
      (item) => item.slug === brandSlug,
    );
    if (!brand) return defaultMetadata;
    return {
      title: brand.seoTitle ?? `${brand.name} | Nana Organics`,
      description:
        brand.seoDescription ??
        brand.heroDescription ??
        brand.description ??
        `Discover ${brand.name} at Nana Organics.`,
    };
  } catch (error) {
    console.error("Failed to load brand homepage metadata.", error);
    return defaultMetadata;
  }
}

async function HomeContent({ searchParams }: HomePageProps) {
  const requestedBrandSlug = requestedBrandFrom((await searchParams).brand);
  let data: BrandHomepageData | null = null;

  try {
    data = requestedBrandSlug
      ? await getBrandHomepage(requestedBrandSlug)
      : await getDefaultHomepage();
  } catch (error) {
    console.error("Failed to load homepage storefront data.", error);
  }

  if (!data) {
    return (
      <>
        <main className="flex min-h-[50vh] items-center justify-center px-5 text-center">
          <p role="alert" className="max-w-lg text-[#27382d]">
            The storefront is temporarily unavailable. Please try again shortly.
          </p>
        </main>
        <BenefitsFooter benefits={<NanaDifferenceBanner />}>
          <Suspense fallback={null}>
            <FooterReviews />
          </Suspense>
          <SiteFooter />
        </BenefitsFooter>
      </>
    );
  }

  const brandSlug = data.isDefault ? undefined : data.selectedBrand.slug;
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
        activeBrandSlug={brandSlug ?? ""}
        homeHref={
          data.isDefault
            ? "/"
            : `/?brand=${encodeURIComponent(data.selectedBrand.slug)}`
        }
        variant={
          data.settings?.enabled === false ||
          data.settings?.heroEnabled === false
            ? "solid"
            : "overlay"
        }
      />
      <main className="bg-[#fcfdf9]">
        {data.settings?.enabled === false ? null : (
          <>
            {data.settings?.heroEnabled !== false ? (
              <HomeHero
                brand={data.selectedBrand}
                settings={data.settings}
                useHomepageSettings={Boolean(data.isDefault)}
              />
            ) : null}
            {data.settings?.categoryEnabled !== false ? (
              <BrandCategoryCarousel
                categories={data.categories ?? data.selectedBrand.categories}
                brands={data.isDefault ? data.brands : undefined}
                brandSlug={brandSlug}
                initialBrandSlug={data.isDefault ? data.selectedBrand.slug : undefined}
                isDefaultHomepage={Boolean(data.isDefault)}
                settings={data.settings}
              />
            ) : null}
            {data.settings?.valuesEnabled ? (
              <HomeBrandValues
                settings={data.settings}
                brandSlug={brandSlug}
              />
            ) : null}
            <HomeProductSections
              sections={data.productSections.slice(0, 1)}
              brandSlug={brandSlug}
            />
            <HomeMarketingSections
              sections={betweenProductRows}
              brandSlug={brandSlug}
            />
            <HomeProductSections
              sections={data.productSections.slice(1, 2)}
              brandSlug={brandSlug}
            />
            <HomeMarketingSections
              sections={afterProductRows}
              brandSlug={brandSlug}
            />
            {data.video ? (
              <HomeVideoDiscovery
                video={data.video}
                brandSlug={brandSlug}
              />
            ) : null}
            <HomeProductSections
              sections={data.productSections.slice(2)}
              brandSlug={brandSlug}
            />
          </>
        )}
      </main>
      <BenefitsFooter benefits={<NanaDifferenceBanner />}>
        <Suspense fallback={null}>
          <FooterReviews />
        </Suspense>
        <SiteFooter />
      </BenefitsFooter>
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
