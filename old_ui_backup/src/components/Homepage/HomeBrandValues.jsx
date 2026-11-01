'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const withBrand = (href, brandSlug) => {
  if (!href?.startsWith('/') || !brandSlug) return href;
  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}brand=${encodeURIComponent(brandSlug)}`;
};

export default function HomeBrandValues({ section, brandSlug }) {
  const items = section?.valueItems || [];
  if (!section?.valuesEnabled || !items.length) return null;

  return (
    <section
      className="relative isolate overflow-hidden border-y border-[#dce5da] bg-[#fbfcf8] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24"
      aria-labelledby="brand-values-title"
    >
      {section.valuesBackgroundAsset?.source ? (
        <Image
          src={section.valuesBackgroundAsset.source}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className="-z-30 object-cover object-center opacity-[0.18]"
        />
      ) : null}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white/95 via-white/80 to-[#f3f6ef]/90" />

      <Image
        src="/images/homepage-leaf-right-top.png"
        alt=""
        width={220}
        height={180}
        className="pointer-events-none absolute right-0 top-0 -z-10 hidden h-auto w-28 opacity-80 sm:block lg:w-44"
      />
      <Image
        src="/images/homepage-leaf-left-bottom.png"
        alt=""
        width={220}
        height={180}
        className="pointer-events-none absolute bottom-0 left-0 -z-10 hidden h-auto w-28 opacity-70 sm:block lg:w-44"
      />

      <div className="mx-auto max-w-[1240px] text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#30473a] sm:text-xs">
          {section.valuesEyebrow}
        </p>
        <h2
          id="brand-values-title"
          className="mx-auto mt-3 max-w-4xl font-serif text-[30px] font-semibold leading-[1.15] text-[#202922] sm:text-4xl lg:text-[44px]"
        >
          {section.valuesTitle}
        </h2>
        {section.valuesDescription ? (
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[#4e5b53] sm:text-base sm:leading-7">
            {section.valuesDescription}
          </p>
        ) : null}

        <ol className="mx-auto mt-9 grid w-full max-w-5xl grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-11 lg:grid-cols-4 lg:gap-x-8">
          {items.map((item, index) => {
            const image = item.imageAsset?.preview || item.imageAsset?.source;

            return (
              <li
                key={item.id}
                className="mx-auto flex w-full min-w-0 max-w-[240px] flex-col items-center px-1"
              >
                <div className="relative size-32 min-[360px]:size-36 md:size-40 lg:size-[168px]">
                  <div className="relative size-full overflow-hidden rounded-full border-2 border-white bg-[#e7eee3] shadow-[0_12px_28px_rgba(41,66,49,0.14)]">
                    {image ? (
                      <Image
                        src={image}
                        alt=""
                        fill
                        unoptimized
                        sizes="(max-width: 359px) 128px, (max-width: 767px) 144px, (max-width: 1023px) 160px, 168px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <span className="absolute -bottom-1 right-1 grid size-9 place-items-center rounded-full border-2 border-white bg-[#f3e84f] text-[11px] font-semibold text-[#314338] shadow-sm sm:right-0">
                    {String(index + 1).padStart(2, '0')}
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
            );
          })}
        </ol>

        {section.valuesCtaLabel && section.valuesCtaLink ? (
          <Link
            href={withBrand(section.valuesCtaLink, brandSlug)}
            className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#315f48] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#234b37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315f48] focus-visible:ring-offset-2"
          >
            {section.valuesCtaLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
