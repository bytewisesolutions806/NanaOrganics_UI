'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf } from 'lucide-react';

export default function HomeHero({ brand }) {
  const selectedBrand = brand;
  const bannerSource = selectedBrand?.bannerAsset?.source || '/new_design/HomePageBanner.webp';

  return (
    <section className="relative isolate min-h-[520px] overflow-hidden bg-[#183B32] sm:min-h-[620px] lg:min-h-[763px]">
      <Image
        src={bannerSource}
        alt={selectedBrand ? `${selectedBrand.name} banner` : 'A quiet mountain landscape surrounded by nature'}
        fill
        priority
        unoptimized
        sizes="100vw"
        className="z-0 object-cover object-center"
      />
      <div
        className="absolute inset-0 z-10 bg-gradient-to-r from-[#102820]/85 via-[#17382D]/55 to-[#17382D]/10"
        aria-hidden="true"
      />

      <div className="site-shell relative z-20 flex min-h-[520px] items-center py-14 sm:min-h-[620px] sm:py-16 lg:min-h-[763px]">
        <div className="max-w-[680px] text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white backdrop-blur-sm sm:text-sm">
            <Leaf size={16} aria-hidden="true" />
            {selectedBrand?.heroEyebrow || 'NATURE, IN ITS PUREST FORM'}
          </span>
          <h1 className="mt-6 max-w-[640px] text-[38px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-[72px]">
            {selectedBrand?.heroTitle || "Discover nature's best with Nana Organics"}
          </h1>
          <p className="mt-5 max-w-[530px] text-sm leading-6 text-white/85 sm:text-base sm:leading-7 lg:text-lg">
            {selectedBrand?.heroDescription ||
              'Thoughtfully made essentials, rooted in nature and created for everyday wellbeing.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={selectedBrand?.heroPrimaryLink || '/shop'}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#B7D9A7] px-6 text-sm font-semibold text-[#16382C] transition hover:bg-white sm:min-h-14 sm:px-8 sm:text-base"
            >
              {selectedBrand?.heroPrimaryLabel || 'Shop now'}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href={selectedBrand?.heroSecondaryLink || '/our-story'}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/70 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/15 sm:min-h-14 sm:px-8 sm:text-base"
            >
              {selectedBrand?.heroSecondaryLabel || 'Our story'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
