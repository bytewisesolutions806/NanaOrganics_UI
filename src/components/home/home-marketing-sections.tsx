import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

import type {
  StoreHomepageMarketingItem,
  StoreHomepageMarketingSection,
} from "@/types/storefront";

function withBrand(href: string, brandSlug?: string) {
  if (!href.startsWith("/")) return href;
  if (!brandSlug) return href;
  return `${href}${href.includes("?") ? "&" : "?"}brand=${encodeURIComponent(brandSlug)}`;
}

function SectionHeader({ section, light = false }: { section: StoreHomepageMarketingSection; light?: boolean }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {section.eyebrow ? <p className={`text-[10px] font-semibold uppercase tracking-[0.32em] sm:text-xs ${light ? "text-white/80" : "text-[#30483a]"}`}>{section.eyebrow}</p> : null}
      <h2 className={`mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl lg:text-[42px] ${light ? "text-white" : "text-[#202a24]"}`}>{section.title}</h2>
      {section.description ? <p className={`mx-auto mt-3 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7 ${light ? "text-white/85" : "text-[#526058]"}`}>{section.description}</p> : null}
    </div>
  );
}

function SectionButton({ section, brandSlug, light = false }: { section: StoreHomepageMarketingSection; brandSlug?: string; light?: boolean }) {
  if (!section.ctaLabel || !section.ctaLink) return null;
  return (
    <Link href={withBrand(section.ctaLink, brandSlug)} className={`inline-flex min-h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${light ? "bg-white text-[#27523a] hover:bg-[#f5f8f3]" : "bg-[#315f48] text-white hover:bg-[#234b37]"}`}>
      {section.ctaLabel}<ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function Benefit({ item, side }: { item: StoreHomepageMarketingItem; side: "left" | "right" }) {
  return (
    <article className={`grid grid-cols-[1fr_auto] items-start gap-3 text-right ${side === "right" ? "sm:grid-cols-[auto_1fr] sm:text-left" : ""}`}>
      {side === "right" ? (
        <div className="hidden size-8 shrink-0 place-items-center rounded-full bg-[#e9f5e4] text-[#53a64f] sm:grid">
          {item.iconAsset?.source ? <Image src={item.iconAsset.source} alt="" width={22} height={22} unoptimized className="size-[22px] object-contain" /> : <Leaf className="size-4" />}
        </div>
      ) : null}
      <div className="min-w-0">
        <h3 className="text-base font-medium text-[#27352d]">{item.title}</h3>
        {item.description ? <p className="mt-1 text-xs leading-5 text-[#68746d] sm:text-sm">{item.description}</p> : null}
      </div>
      {side === "left" ? (
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#e9f5e4] text-[#53a64f]">
          {item.iconAsset?.source ? <Image src={item.iconAsset.source} alt="" width={22} height={22} unoptimized className="size-[22px] object-contain" /> : <Leaf className="size-4" />}
        </div>
      ) : null}
    </article>
  );
}

function FeaturedProductSection({ section, brandSlug }: { section: StoreHomepageMarketingSection; brandSlug?: string }) {
  const left = section.items.filter((item) => item.alignment !== "right");
  const right = section.items.filter((item) => item.alignment === "right");
  return (
    <section className="relative isolate overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20" aria-label={section.title}>
      {section.backgroundAsset?.source ? <Image src={section.backgroundAsset.source} alt="" fill unoptimized sizes="100vw" className="-z-10 object-cover opacity-20" /> : null}
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader section={section} />
        <div className="mt-10 grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(300px,1.2fr)_minmax(0,1fr)] lg:gap-10">
          <div className="order-2 grid gap-6 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">{left.map((item) => <Benefit key={item.id} item={item} side="left" />)}</div>
          <div className="order-1 mx-auto w-full max-w-[560px] lg:order-2">
            <div className="relative aspect-[16/10] w-full">
              {section.foregroundAsset?.source ? <Image src={section.foregroundAsset.source} alt={section.title} fill unoptimized sizes="(max-width: 1023px) 90vw, 40vw" className="object-contain" /> : <div className="absolute inset-8 rounded-full bg-[radial-gradient(circle,#f3c540_0%,#f8ead0_35%,transparent_70%)]" />}
            </div>
          </div>
          <div className="order-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">{right.map((item) => <Benefit key={item.id} item={item} side="right" />)}</div>
        </div>
        <div className="mt-10 text-center"><SectionButton section={section} brandSlug={brandSlug} /></div>
      </div>
    </section>
  );
}

function IngredientsSection({ section, brandSlug }: { section: StoreHomepageMarketingSection; brandSlug?: string }) {
  return (
    <section className="relative isolate overflow-hidden px-5 py-14 sm:px-8 sm:py-20" aria-label={section.title}>
      {section.backgroundAsset?.source ? <Image src={section.backgroundAsset.source} alt="" fill unoptimized sizes="100vw" className="-z-20 object-cover" /> : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white/85 to-[#0d3825]/95" />
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader section={section} />
        <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-7">
          {section.items.map((item) => (
            <article key={item.id} className="min-w-0 text-center text-white">
              <div className="relative mx-auto size-28 overflow-hidden rounded-full border-2 border-white/80 bg-[#dfe8d8] shadow-lg sm:size-32 lg:size-36">
                {item.imageAsset?.source ? <Image src={item.imageAsset.source} alt={item.title} fill unoptimized sizes="144px" className="object-cover" /> : null}
              </div>
              <h3 className="mt-4 break-words text-base font-semibold sm:text-lg">{item.title}</h3>
              {item.description ? <p className="mt-0.5 break-words text-xs text-white/80 sm:text-sm">{item.description}</p> : null}
            </article>
          ))}
        </div>
        <div className="mt-9 text-center"><SectionButton section={section} brandSlug={brandSlug} light /></div>
      </div>
    </section>
  );
}

function BrandBannerSection({ section, brandSlug }: { section: StoreHomepageMarketingSection; brandSlug?: string }) {
  return (
    <section className="relative isolate flex min-h-[520px] items-center overflow-hidden px-5 py-16 sm:min-h-[600px] sm:px-8 sm:py-20" aria-label={section.title}>
      {section.backgroundAsset?.source ? <Image src={section.backgroundAsset.source} alt="" fill unoptimized sizes="100vw" className="-z-20 object-cover" /> : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#153525]/25 via-[#0a2b1d]/45 to-[#071f15]/75" />
      <div className="mx-auto w-full max-w-4xl text-center text-white">
        {section.logoAsset?.source ? <Image src={section.logoAsset.source} alt="" width={230} height={190} unoptimized className="mx-auto h-auto w-36 object-contain sm:w-48" /> : null}
        <div className={section.logoAsset ? "mt-6" : ""}><SectionHeader section={section} light /></div>
        {section.secondaryDescription ? <p className="mx-auto mt-5 max-w-3xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">{section.secondaryDescription}</p> : null}
        <div className="mt-8"><SectionButton section={section} brandSlug={brandSlug} light /></div>
      </div>
    </section>
  );
}

function BundlesSection({ section, brandSlug }: { section: StoreHomepageMarketingSection; brandSlug?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20" aria-label={section.title}>
      {section.backgroundAsset?.source ? <Image src={section.backgroundAsset.source} alt="" fill unoptimized sizes="100vw" className="-z-10 object-cover opacity-15" /> : null}
      <div className="mx-auto max-w-[1040px]">
        <SectionHeader section={section} />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {section.items.map((item) => (
            <article key={item.id} className="group relative min-h-[380px] overflow-hidden rounded-xl bg-[#eef1e9] shadow-[0_12px_35px_rgba(35,58,43,0.10)] sm:min-h-[430px]">
              {item.imageAsset?.source ? <Image src={item.imageAsset.source} alt={item.title} fill unoptimized sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /> : null}
              <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/35 to-transparent" />
              <div className="relative p-6">
                <h3 className="text-xl font-medium text-[#26332b]">{item.title}</h3>
                {item.description ? <p className="mt-2 text-sm leading-5 text-[#526058]">{item.description}</p> : null}
                {item.ctaLabel && item.ctaLink ? <Link href={withBrand(item.ctaLink, brandSlug)} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#315f48] hover:underline">{item.ctaLabel}<ArrowRight className="size-4" /></Link> : null}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-9 text-center"><SectionButton section={section} brandSlug={brandSlug} /></div>
      </div>
    </section>
  );
}

export function HomeMarketingSections({ sections, brandSlug }: { sections: StoreHomepageMarketingSection[]; brandSlug?: string }) {
  return sections.map((section) => {
    if (!section.enabled) return null;
    if (section.code === "featured-product") return <FeaturedProductSection key={section.id} section={section} brandSlug={brandSlug} />;
    if (section.code === "ingredients") return <IngredientsSection key={section.id} section={section} brandSlug={brandSlug} />;
    if (section.code === "brand-banner") return <BrandBannerSection key={section.id} section={section} brandSlug={brandSlug} />;
    if (section.code === "bundles") return <BundlesSection key={section.id} section={section} brandSlug={brandSlug} />;
    return null;
  });
}
