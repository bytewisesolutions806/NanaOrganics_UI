import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

import { IngredientContrast } from "@/components/home/ingredient-contrast";
import type {
  StoreHomepageMarketingItem,
  StoreHomepageMarketingSection,
} from "@/types/storefront";

function withBrand(href: string, brandSlug?: string) {
  if (!href.startsWith("/")) return href;
  if (!brandSlug) return href;
  return `${href}${href.includes("?") ? "&" : "?"}brand=${encodeURIComponent(brandSlug)}`;
}

function SectionHeader({
  section,
  light = false,
  wideDescription = false,
}: {
  section: StoreHomepageMarketingSection;
  light?: boolean;
  wideDescription?: boolean;
}) {
  return (
    <div
      className={`mx-auto text-center ${wideDescription ? "max-w-none" : "max-w-3xl"}`}
    >
      {section.eyebrow ? (
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.32em] sm:text-xs ${light ? "text-white/80" : "text-[#30483a]"}`}
        >
          {section.eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-[42px] ${light ? "text-white" : "text-[#202a24]"}`}
      >
        {section.title}
      </h2>
      {section.description ? (
        <p
          className={`mx-auto mt-3 ${wideDescription ? "max-w-none" : "max-w-2xl"} text-sm leading-6 sm:text-base sm:leading-7 ${light ? "text-white/85" : "text-[#526058]"}`}
        >
          {section.description}
        </p>
      ) : null}
    </div>
  );
}

function SectionButton({
  section,
  brandSlug,
  light = false,
}: {
  section: StoreHomepageMarketingSection;
  brandSlug?: string;
  light?: boolean;
}) {
  if (!section.ctaLabel || !section.ctaLink) return null;
  return (
    <Link
      href={withBrand(section.ctaLink, brandSlug)}
      className={`inline-flex min-h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${light ? "bg-white text-[#27523a] hover:bg-[#f5f8f3]" : "bg-[#315f48] text-white hover:bg-[#234b37]"}`}
    >
      {section.ctaLabel}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function Benefit({
  item,
  side,
}: {
  item: StoreHomepageMarketingItem;
  side: "left" | "right";
}) {
  return (
    <article
      className={`grid grid-cols-[1fr_auto] items-start gap-3 text-right ${side === "right" ? "sm:grid-cols-[auto_1fr] sm:text-left" : ""}`}
    >
      {side === "right" ? (
        <div className="hidden size-8 shrink-0 place-items-center rounded-full bg-[#e9f5e4] text-[#53a64f] sm:grid">
          {item.iconAsset?.source ? (
            <Image
              src={item.iconAsset.source}
              alt=""
              width={22}
              height={22}
              unoptimized
              className="size-[22px] object-contain"
            />
          ) : (
            <Leaf className="size-4" />
          )}
        </div>
      ) : null}
      <div className="min-w-0">
        <h3 className="text-base font-medium text-[#27352d]">{item.title}</h3>
        {item.description ? (
          <p className="mt-1 text-xs leading-5 text-[#68746d] sm:text-sm">
            {item.description}
          </p>
        ) : null}
      </div>
      {side === "left" ? (
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e9f5e4] text-[#53a64f]">
          {item.iconAsset?.source ? (
            <Image
              src={item.iconAsset.source}
              alt=""
              width={22}
              height={22}
              unoptimized
              className="size-[22px] object-contain"
            />
          ) : (
            <Leaf className="size-4" />
          )}
        </div>
      ) : null}
    </article>
  );
}

function FeaturedProductSection({
  section,
  brandSlug,
}: {
  section: StoreHomepageMarketingSection;
  brandSlug?: string;
}) {
  const left = section.items.filter((item) => item.alignment !== "right");
  const right = section.items.filter((item) => item.alignment === "right");
  return (
    <section
      className="relative isolate overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20"
      aria-label={section.title}
    >
      {section.backgroundAsset?.source ? (
        <Image
          src={section.backgroundAsset.source}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-10 object-cover opacity-20"
        />
      ) : null}
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader section={section} />
        <div className="mt-10 grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(300px,1.2fr)_minmax(0,1fr)] lg:gap-10">
          <div className="order-2 grid gap-6 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
            {left.map((item) => (
              <Benefit key={item.id} item={item} side="left" />
            ))}
          </div>
          <div className="order-1 mx-auto w-full max-w-[560px] lg:order-2">
            <div className="relative aspect-[16/10] w-full">
              {section.foregroundAsset?.source ? (
                <Image
                  src={section.foregroundAsset.source}
                  alt={section.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1023px) 90vw, 40vw"
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,#f3c540_0%,#f8ead0_35%,transparent_70%)]" />
              )}
            </div>
          </div>
          <div className="order-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {right.map((item) => (
              <Benefit key={item.id} item={item} side="right" />
            ))}
          </div>
        </div>
        <div className="mt-10 text-center">
          <SectionButton section={section} brandSlug={brandSlug} />
        </div>
      </div>
    </section>
  );
}

function IngredientsSection({
  section,
  brandSlug,
}: {
  section: StoreHomepageMarketingSection;
  brandSlug?: string;
}) {
  return (
    <section
      className="relative isolate overflow-hidden px-5 py-14 sm:px-8 sm:py-20"
      aria-label={section.title}
    >
      {section.backgroundAsset?.source ? (
        <Image
          src={section.backgroundAsset.source}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover"
        />
      ) : null}
      <div className="absolute inset-0 -z-10" />
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader section={section} wideDescription />
        <IngredientContrast backgroundSrc={section.backgroundAsset?.source}>
          <div className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-8 lg:gap-7">
            {section.items.map((item) => (
              <article
                key={item.id}
                className={`min-w-0 w-[calc((100%-1.25rem)/2)] text-center ${
                  section.items.length === 4
                    ? "sm:w-[calc((100%-1.25rem)/2)]"
                    : "sm:w-[calc((100%-2.5rem)/3)]"
                } ${
                  section.items.length === 1
                    ? "lg:w-full"
                    : section.items.length === 2
                      ? "lg:w-[calc((100%-1.75rem)/2)]"
                      : section.items.length === 3
                        ? "lg:w-[calc((100%-3.5rem)/3)]"
                        : section.items.length === 4
                          ? "lg:w-[calc((100%-5.25rem)/4)]"
                          : "lg:w-[calc((100%-7rem)/5)]"
                }`}
              >
                <div className="relative mx-auto size-28 overflow-hidden rounded-full bg-[#dfe8d8] shadow-lg sm:size-32 lg:size-36">
                  {item.imageAsset?.source ? (
                    <Image
                      src={item.imageAsset.source}
                      alt={item.title}
                      fill
                      unoptimized
                      sizes="144px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div data-ingredient-label className="mt-3 rounded-md bg-white px-2 py-1 text-[#111111]">
                  <h3 className="break-words text-base font-semibold sm:text-lg">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-0.5 text-xs sm:text-sm">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </IngredientContrast>
        <div className="mt-9 text-center">
          <SectionButton section={section} brandSlug={brandSlug} light />
        </div>
      </div>
    </section>
  );
}

function RitualsSection({
  section,
  brandSlug,
}: {
  section: StoreHomepageMarketingSection;
  brandSlug?: string;
}) {
  const ritualIcons: Record<string, string> = {
    cleanser: "/images/botanical-rituals/cleanser.png",
    treat: "/images/botanical-rituals/treat.png",
    moisturizer: "/images/botanical-rituals/moisturizer.png",
    restore: "/images/botanical-rituals/restore.png",
  };

  return (
    <section
      className="relative isolate mt-8 overflow-hidden bg-white px-5 pt-8 pb-8 sm:px-8 sm:pb-10 lg:pt-0"
      aria-label={section.title}
    >
      {section.backgroundAsset?.source ? (
        <Image
          src={section.backgroundAsset.source}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-10 object-cover opacity-10"
        />
      ) : null}
      <div className="mx-auto max-w-[960px]">
        <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
          <div className="text-center lg:text-left">
            {section.eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#30483a] sm:text-xs">
                {section.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#202a24] sm:text-4xl">
              {section.title}
            </h2>
            {section.description ? (
              <p className="mt-3 text-sm leading-6 text-[#526058] sm:text-base sm:leading-7">
                {section.description}
              </p>
            ) : null}
            <div className="mt-6">
              <SectionButton section={section} brandSlug={brandSlug} />
            </div>
          </div>
          <div className="relative mx-auto aspect-[3/2] w-full max-w-[580px]">
            {section.foregroundAsset?.source ? (
              <Image
                src={section.foregroundAsset.source}
                alt=""
                fill
                unoptimized
                sizes="(max-width: 1023px) 90vw, 48vw"
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,#e9f5e4_0%,#f8faf6_55%,transparent_72%)]" />
            )}
          </div>
        </div>
        {section.items.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-y-7 sm:mt-12 sm:grid-cols-4 sm:gap-y-0">
            {section.items.map((item, index) => (
              <article
                key={item.id}
                className={`px-4 text-left sm:px-5 ${index < section.items.length - 1 ? "sm:border-r sm:border-[#e3e9e3]" : ""}`}
              >
                <div className="flex size-14 items-center justify-start text-[#62b847]">
                  {item.iconAsset?.source || ritualIcons[item.title.trim().toLowerCase()] ? (
                    <Image
                      src={
                        item.iconAsset?.source ??
                        ritualIcons[item.title.trim().toLowerCase()]
                      }
                      alt=""
                      width={56}
                      height={56}
                      unoptimized
                      className="size-14 object-contain"
                    />
                  ) : (
                    <Leaf className="size-12" aria-hidden="true" />
                  )}
                </div>
                <h3 className="mt-2 text-lg font-medium text-[#27352d] sm:text-xl">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-1 max-w-[200px] text-sm leading-5 text-[#526058]">
                    {item.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BrandBannerSection({
  section,
  brandSlug,
}: {
  section: StoreHomepageMarketingSection;
  brandSlug?: string;
}) {
  return (
    <section
      className="relative isolate flex min-h-[520px] items-center overflow-hidden px-5 py-16 sm:min-h-[600px] sm:px-8 sm:py-20"
      aria-label={section.title}
    >
      {section.backgroundAsset?.source ? (
        <Image
          src={section.backgroundAsset.source}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#153525]/25 via-[#0a2b1d]/45 to-[#071f15]/75" />
      <div className="mx-auto w-full max-w-4xl text-center text-white">
        {section.logoAsset?.source ? (
          <Image
            src={section.logoAsset.source}
            alt=""
            width={230}
            height={190}
            unoptimized
            className="mx-auto h-auto w-36 object-contain sm:w-48"
          />
        ) : null}
        <div className={section.logoAsset ? "mt-6" : ""}>
          <SectionHeader section={section} light />
        </div>
        {section.secondaryDescription ? (
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
            {section.secondaryDescription}
          </p>
        ) : null}
        <div className="mt-8">
          <SectionButton section={section} brandSlug={brandSlug} light />
        </div>
      </div>
    </section>
  );
}

function BundlesSection({
  section,
  brandSlug,
}: {
  section: StoreHomepageMarketingSection;
  brandSlug?: string;
}) {
  return (
    <section
      className="relative isolate overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20"
      aria-label={section.title}
    >
      {section.backgroundAsset?.source ? (
        <Image
          src={section.backgroundAsset.source}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-10 object-cover opacity-15"
        />
      ) : null}
      <div className="mx-auto max-w-[1040px]">
        <SectionHeader section={section} />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {section.items.map((item) => (
            <article
              key={item.id}
              className="group relative min-h-[460px] overflow-hidden rounded-xl bg-[#f7f5f2] shadow-[0_12px_35px_rgba(35,58,43,0.10)] sm:min-h-[460px]"
            >
              {item.imageAsset?.source ? (
                <Image
                  src={item.imageAsset.source}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : null}
              <div className="relative p-6">
                <h3 className="text-xl font-medium text-[#26332b]">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-2 text-sm leading-5 text-[#526058]">
                    {item.description}
                  </p>
                ) : null}
                {item.ctaLabel && item.ctaLink ? (
                  <Link
                    href={withBrand(item.ctaLink, brandSlug)}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#315f48] hover:underline"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-9 text-center">
          <SectionButton section={section} brandSlug={brandSlug} />
        </div>
      </div>
    </section>
  );
}

export function HomeMarketingSections({
  sections,
  brandSlug,
}: {
  sections: StoreHomepageMarketingSection[];
  brandSlug?: string;
}) {
  return sections.map((section) => {
    if (!section.enabled) return null;
    if (section.code === "featured-product")
      return (
        <FeaturedProductSection
          key={section.id}
          section={section}
          brandSlug={brandSlug}
        />
      );
    if (section.code === "ingredients")
      return (
        <IngredientsSection
          key={section.id}
          section={section}
          brandSlug={brandSlug}
        />
      );
    if (section.code === "rituals")
      return (
        <RitualsSection
          key={section.id}
          section={section}
          brandSlug={brandSlug}
        />
      );
    if (section.code === "brand-banner")
      return (
        <BrandBannerSection
          key={section.id}
          section={section}
          brandSlug={brandSlug}
        />
      );
    if (section.code === "bundles")
      return (
        <BundlesSection
          key={section.id}
          section={section}
          brandSlug={brandSlug}
        />
      );
    return null;
  });
}
