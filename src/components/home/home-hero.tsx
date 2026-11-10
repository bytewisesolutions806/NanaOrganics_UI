"use client";
import Image from "next/image";
import Link from "next/link";
import { UserRoundPlus } from "lucide-react";

import type { StoreBrand, StoreHomepageSettings } from "@/types/storefront";

function withBrand(href: string, brandSlug?: string) {
  if (!href.startsWith("/")) return href;
  if (!brandSlug) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}brand=${encodeURIComponent(brandSlug)}`;
}

interface HomeHeroProps {
  brand: StoreBrand;
  settings?: StoreHomepageSettings | null;
  useHomepageSettings?: boolean;
}

export function HomeHero({
  brand,
  settings,
  useHomepageSettings = false,
}: HomeHeroProps) {
  const eyebrow = useHomepageSettings
    ? settings?.heroEyebrow
    : brand.heroEyebrow;
  const title = useHomepageSettings ? settings?.heroTitle : brand.heroTitle;
  const description = useHomepageSettings
    ? settings?.heroDescription
    : brand.heroDescription;
  const primaryLabel = useHomepageSettings
    ? settings?.heroPrimaryLabel
    : brand.heroPrimaryLabel;
  const primaryLink = useHomepageSettings
    ? settings?.heroPrimaryLink
    : brand.heroPrimaryLink;
  const secondaryLabel = useHomepageSettings
    ? settings?.heroSecondaryLabel
    : brand.heroSecondaryLabel;
  const secondaryLink = useHomepageSettings
    ? settings?.heroSecondaryLink
    : brand.heroSecondaryLink;
  const bannerAsset = useHomepageSettings
    ? settings?.heroBannerAsset
    : brand.bannerAsset;
  const brandSlug = useHomepageSettings ? undefined : brand.slug;

  return (
    <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden bg-[#dce7dc] sm:min-h-[680px]">
      {bannerAsset?.source ? (
        <Image
          src={bannerAsset.source}
          alt={useHomepageSettings ? "Nana Organics banner" : `${brand.name} banner`}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#a7be83_0,transparent_35%),radial-gradient(circle_at_80%_20%,#dce6d4_0,transparent_40%),linear-gradient(135deg,#c3d1bd,#edf1e8)]" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center justify-center space-y-6 px-4 pt-16 text-center text-black sm:px-5 sm:pt-20">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2C5D43] drop-shadow-sm">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="w-full max-w-full break-words font-serif text-balance text-xl font-bold tracking-tight drop-shadow-md sm:text-4xl md:text-4xl">
          {title ?? "Thoughtful organic essentials for everyday living."}
        </h1>

        {description && (
          <p className="w-full max-w-2xl break-words text-pretty text-base font-light drop-shadow sm:text-lg md:text-xl">
            {description}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={withBrand(primaryLink ?? "/categories", brandSlug)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#2C5D43] px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#234B36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43]"
          >
            <UserRoundPlus className="size-4" aria-hidden="true" />
            {primaryLabel ?? (useHomepageSettings ? "Shop now" : `Join ${brand.name}`)}
          </Link>
          {secondaryLink ? (
            <Link
              href={withBrand(secondaryLink, brandSlug)}
              className="inline-flex min-h-11 items-center rounded-md border border-[#2C5D43]/35 bg-white/75 px-5 text-sm font-medium text-[#244d37] backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43]"
            >
              {secondaryLabel ?? "Our story"}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
