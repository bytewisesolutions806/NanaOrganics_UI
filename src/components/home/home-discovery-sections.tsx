import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HomeProductSection } from "@/components/home/home-product-section";
import type {
  HomepageProductSection,
  StoreBrand,
  StoreHomepageSettings,
  StoreHomepageVideo,
} from "@/types/storefront";

function withBrand(href: string, brandSlug: string) {
  if (!href.startsWith("/")) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}brand=${encodeURIComponent(brandSlug)}`;
}

export function HomeBrandValues({
  settings,
  brandSlug,
}: {
  settings: StoreHomepageSettings;
  brandSlug: string;
}) {
  if (!settings.valuesEnabled || !settings.valueItems.length) return null;

  return (
    <section
      className="relative isolate overflow-hidden border-y border-[#dfe6dc] bg-[#fbfcf8] px-5 py-14 sm:px-8 sm:py-20 lg:py-24"
      aria-labelledby="homepage-brand-values-heading"
    >
      {settings.valuesBackgroundAsset?.source ? (
        <Image
          src={settings.valuesBackgroundAsset.source}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-20"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/95 via-white/80 to-[#f4f7f1]/90" />

      <div className="mx-auto max-w-[1240px] text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#30483a] sm:text-xs">
          {settings.valuesEyebrow}
        </p>
        <h2
          id="homepage-brand-values-heading"
          className="mx-auto mt-3 max-w-4xl font-serif text-3xl font-semibold leading-tight text-[#202a24] sm:text-4xl lg:text-[44px]"
        >
          {settings.valuesTitle}
        </h2>
        {settings.valuesDescription ? (
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[#526058] sm:text-base sm:leading-7">
            {settings.valuesDescription}
          </p>
        ) : null}

        <ol className="mx-auto mt-9 grid w-full max-w-5xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {settings.valueItems.map((item, index) => (
            <li key={item.id} className="mx-auto flex w-full min-w-0 max-w-[240px] flex-col items-center px-1">
              <div className="relative size-32 min-[360px]:size-36 md:size-40 lg:size-[168px]">
                <div className="relative size-full overflow-hidden rounded-full border border-white bg-[#e8eee4] shadow-[0_12px_30px_rgba(41,66,49,0.12)]">
                  {item.imageAsset?.source ? (
                    <Image
                      src={item.imageAsset.source}
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 359px) 128px, (max-width: 767px) 144px, (max-width: 1023px) 160px, 168px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <span className="absolute -bottom-1 right-1 grid size-9 place-items-center rounded-full border-2 border-white bg-[#f3e84f] text-[11px] font-semibold text-[#314338] shadow-sm sm:right-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 max-w-full break-words text-lg font-medium uppercase leading-tight text-[#26332b] sm:text-xl">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-1.5 max-w-full break-words text-sm leading-5 text-[#46534b] [overflow-wrap:anywhere]">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        {settings.valuesCtaLink && settings.valuesCtaLabel ? (
          <Link
            href={withBrand(settings.valuesCtaLink, brandSlug)}
            className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#315f48] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#234b37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315f48] focus-visible:ring-offset-2"
          >
            {settings.valuesCtaLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function HomeProductSections({
  sections,
  brandSlug,
}: {
  sections: HomepageProductSection[];
  brandSlug: string;
}) {
  return sections.map((section) => (
    <HomeProductSection key={section.code} section={section} brandSlug={brandSlug} />
  ));
}

export function HomeVideoDiscovery({ video, brandSlug }: { video: StoreHomepageVideo; brandSlug: string }) {
  return (
    <section className="bg-[#f3f7f1] py-14 sm:py-20" aria-labelledby="homepage-video-heading">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="text-center">
          <h2 id="homepage-video-heading" className="font-serif text-3xl font-semibold text-[#203428] sm:text-4xl">{video.title}</h2>
          {video.description ? <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#67756c] sm:text-base">{video.description}</p> : null}
        </div>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {video.videos.map((item) => (
            <article key={item.id} className="w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(40,72,49,0.08)] sm:w-[42%] lg:w-[calc((100%-3rem)/4)]">
              <video src={item.videoAsset.source} controls muted playsInline preload="metadata" className="aspect-[3/4] w-full bg-black object-cover" aria-label={item.product ? `${item.product.name} video` : "Product video"} />
              {item.product ? (
                <Link href={`/products/${item.product.slug}?brand=${encodeURIComponent(brandSlug)}`} className="flex items-center justify-between gap-3 p-4 text-sm font-semibold text-[#263b2d] hover:text-[#2C5D43]">
                  <span className="line-clamp-2">{item.product.name}</span><ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeBrandStory({ brand }: { brand: StoreBrand }) {
  if (!brand.storyTitle && !brand.storyDescription && !brand.storyAsset) return null;

  return (
    <section className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 sm:py-20">
      <div className="grid overflow-hidden rounded-[28px] bg-[#eef3e9] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#5b8c66]">{brand.storyEyebrow ?? `The ${brand.name} story`}</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#233e32] sm:text-4xl">{brand.storyTitle ?? "Naturally better, every day."}</h2>
          {(brand.storyDescription ?? brand.description) ? <p className="mt-4 text-sm leading-6 text-[#58665d] sm:text-base sm:leading-7">{brand.storyDescription ?? brand.description}</p> : null}
          {brand.storyLink ? (
            <Link href={withBrand(brand.storyLink, brand.slug)} className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-[#315f48] px-5 text-sm font-semibold text-white transition hover:bg-[#234b37]">
              {brand.storyLinkLabel ?? "Learn more"}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        <div className="relative min-h-[280px] md:min-h-[420px]">
          {brand.storyAsset?.source ? (
            <Image src={brand.storyAsset.source} alt={`${brand.name} story`} fill unoptimized sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" />
          ) : <div className="size-full bg-[radial-gradient(circle_at_30%_30%,#9cba8c,transparent_40%),linear-gradient(145deg,#d9e6d1,#809f7c)]" />}
        </div>
      </div>
    </section>
  );
}
