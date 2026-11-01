import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

import { HomeProductSection } from "@/components/home/home-product-section";
import type {
  HomepageProductSection,
  StoreBrand,
} from "@/types/storefront";

function withBrand(href: string, brandSlug: string) {
  if (!href.startsWith("/")) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}brand=${encodeURIComponent(brandSlug)}`;
}

function BrandHero({ brand }: { brand: StoreBrand }) {
  return (
    // <section className="relative isolate min-h-[620px] overflow-hidden bg-[#d8e4d8] sm:min-h-[680px]">
    //   {brand.bannerAsset?.source ? (
    //     <Image
    //       src={brand.bannerAsset.source}
    //       alt={`${brand.name} banner`}
    //       fill
    //       priority
    //       unoptimized
    //       sizes="100vw"
    //       className="object-cover object-center"
    //     />
    //   ) : (
    //     <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#a7be83_0,transparent_35%),radial-gradient(circle_at_80%_20%,#dce6d4_0,transparent_40%),linear-gradient(135deg,#c3d1bd,#edf1e8)]" />
    //   )}

    //   <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,248,241,0.3),rgba(246,248,241,0.58)_50%,rgba(246,248,241,0.1))]" />

    //   <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1240px] items-center justify-center px-5 pb-16 pt-[185px] text-center sm:min-h-[680px] sm:px-8 sm:pt-[195px]">
    //     <div className="max-w-[730px] text-[#1d2b22]">
    //       <p className="inline-flex items-center gap-2 rounded-full border border-[#51745d]/30 bg-white/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">
    //         <Leaf className="size-4 text-[#43814f]" aria-hidden="true" />
    //         {brand.heroEyebrow ?? brand.name}
    //       </p>
    //       <h1 className="mt-6 font-serif text-[42px] font-semibold leading-[1.03] tracking-[-0.035em] sm:text-6xl lg:text-[68px]">
    //         {brand.heroTitle ?? `Discover nature’s best with ${brand.name}`}
    //       </h1>
    //       <p className="mx-auto mt-5 max-w-[590px] text-sm font-medium leading-6 text-[#27352c] sm:text-base sm:leading-7">
    //         {brand.heroDescription ??
    //           brand.description ??
    //           "Thoughtfully made organic essentials that nourish your body and soul."}
    //       </p>

    //       <div className="mt-7 flex flex-wrap justify-center gap-3">
    //         <Link
    //           href={withBrand(brand.heroPrimaryLink ?? "/categories", brand.slug)}
    //           className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#24573c] px-6 text-sm font-semibold text-white shadow-lg shadow-[#173c29]/15 transition hover:-translate-y-0.5 hover:bg-[#19482f]"
    //         >
    //           {brand.heroPrimaryLabel ?? `Shop ${brand.name}`}
    //           <ArrowRight className="size-4" aria-hidden="true" />
    //         </Link>

    //         {brand.heroSecondaryLink ? (
    //           <Link
    //             href={withBrand(brand.heroSecondaryLink, brand.slug)}
    //             className="inline-flex min-h-11 items-center rounded-md border border-[#45634e]/40 bg-white/60 px-6 text-sm font-semibold text-[#21412e] backdrop-blur-sm transition hover:bg-white"
    //           >
    //             {brand.heroSecondaryLabel ?? "Our story"}
    //           </Link>
    //         ) : null}
    //       </div>
    //     </div>
    //   </div>
    // </section>
    <section className="relative isolate min-h-[620px] overflow-hidden bg-[#d8e4d8] sm:min-h-[680px]">
      {brand.bannerAsset?.source ? (
        <Image
          src={brand.bannerAsset.source}
          alt={`${brand.name} banner`}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#a7be83_0,transparent_35%),radial-gradient(circle_at_80%_20%,#dce6d4_0,transparent_40%),linear-gradient(135deg,#c3d1bd,#edf1e8)]" />
      )}

      {/* Enhanced top-to-bottom gradient for menu and hero readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-red/100 via-white/40 to-transparent pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,248,241,0.3),rgba(246,248,241,0.58)_50%,rgba(246,248,241,0.1))]" />

      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1240px] items-center justify-center px-5 pb-16 pt-[185px] text-center sm:min-h-[680px] sm:px-8 sm:pt-[195px]">
        <div className="max-w-[730px] text-[#1d2b22]">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#51745d]/30 bg-white/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">
            <Leaf className="size-4 text-[#43814f]" aria-hidden="true" />
            {brand.heroEyebrow ?? brand.name}
          </p>
          <h1 className="mt-6 font-serif text-[42px] font-semibold leading-[1.03] tracking-[-0.035em] sm:text-6xl lg:text-[68px]">
            {brand.heroTitle ?? `Discover nature’s best with ${brand.name}`}
          </h1>
          <p className="mx-auto mt-5 max-w-[590px] text-sm font-medium leading-6 text-[#27352c] sm:text-base sm:leading-7">
            {brand.heroDescription ??
              brand.description ??
              "Thoughtfully made organic essentials that nourish your body and soul."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={withBrand(
                brand.heroPrimaryLink ?? "/categories",
                brand.slug,
              )}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#24573c] px-6 text-sm font-semibold text-white shadow-lg shadow-[#173c29]/15 transition hover:-translate-y-0.5 hover:bg-[#19482f]"
            >
              {brand.heroPrimaryLabel ?? `Shop ${brand.name}`}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>

            {brand.heroSecondaryLink ? (
              <Link
                href={withBrand(brand.heroSecondaryLink, brand.slug)}
                className="inline-flex min-h-11 items-center rounded-md border border-[#45634e]/40 bg-white/60 px-6 text-sm font-semibold text-[#21412e] backdrop-blur-sm transition hover:bg-white"
              >
                {brand.heroSecondaryLabel ?? "Our story"}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandCategories({ brand }: { brand: StoreBrand }) {
  const categories = [...brand.categories]
    .sort((left, right) => left.position - right.position)
    .slice(0, 8);

  if (!categories.length) return null;

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5e8967]">
          Explore {brand.name}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-[#203428] sm:text-4xl">
          Shop by category
        </h2>
      </div>

      <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop/${encodeURIComponent(category.slug)}?brand=${encodeURIComponent(brand.slug)}`}
            className="group overflow-hidden rounded-2xl border border-[#dfe8df] bg-white shadow-[0_10px_30px_rgba(40,72,49,0.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(40,72,49,0.12)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#edf2e9]">
              {category.featuredAsset?.preview ||
              category.featuredAsset?.source ? (
                <Image
                  src={
                    category.featuredAsset.preview ??
                    category.featuredAsset.source
                  }
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid size-full place-items-center text-[#5d8c66]">
                  <Leaf className="size-10" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[#21392a]">{category.name}</h3>
              <p className="mt-1 text-xs text-[#708077]">
                {category.productVariantCount} products
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductSection({
  section,
  brandSlug,
}: {
  section: HomepageProductSection;
  brandSlug: string;
}) {
  return (
    <HomeProductSection
      section={{ ...section, products: section.products.slice(0, 8) }}
      brandSlug={brandSlug}
    />
  );
}

function BrandStory({ brand }: { brand: StoreBrand }) {
  if (!brand.storyTitle && !brand.storyDescription && !brand.storyAsset) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid overflow-hidden rounded-[28px] bg-[#eef3e9] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#5b8c66]">
            {brand.storyEyebrow ?? `The ${brand.name} story`}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#233e32] sm:text-4xl">
            {brand.storyTitle ?? `Naturally better, every day.`}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#58665d] sm:text-base sm:leading-7">
            {brand.storyDescription ?? brand.description}
          </p>
          {brand.storyLink ? (
            <Link
              href={withBrand(brand.storyLink, brand.slug)}
              className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-[#315f48] px-5 text-sm font-semibold text-white transition hover:bg-[#234b37]"
            >
              {brand.storyLinkLabel ?? "Learn more"}
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>

        <div className="relative min-h-[280px] md:min-h-[420px]">
          {brand.storyAsset?.source ? (
            <Image
              src={brand.storyAsset.source}
              alt={`${brand.name} story`}
              fill
              unoptimized
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="size-full bg-[radial-gradient(circle_at_30%_30%,#9cba8c,transparent_40%),linear-gradient(145deg,#d9e6d1,#809f7c)]" />
          )}
        </div>
      </div>
    </section>
  );
}

export function BrandHomepage({
  brand,
  productSections,
}: {
  brand: StoreBrand;
  productSections: HomepageProductSection[];
}) {
  return (
    <main className="bg-[#fcfdf9]">
      <BrandHero brand={brand} />
      <BrandCategories brand={brand} />
      {productSections.slice(0, 2).map((section) => (
        <ProductSection
          key={section.code}
          section={section}
          brandSlug={brand.slug}
        />
      ))}
      <BrandStory brand={brand} />
      {productSections.slice(2).map((section) => (
        <ProductSection
          key={section.code}
          section={section}
          brandSlug={brand.slug}
        />
      ))}
    </main>
  );
}
