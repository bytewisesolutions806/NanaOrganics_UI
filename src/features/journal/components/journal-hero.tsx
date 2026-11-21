import Image from "next/image";
import Link from "next/link";

import { WaveDivider } from "@/components/ui/wave-divider";
import type { JournalCategory, JournalPageSettings } from "@/features/journal/types";

export function JournalHero({
  settings,
  categories,
  selectedCategory,
  detail = false,
}: {
  settings: JournalPageSettings;
  categories: JournalCategory[];
  selectedCategory?: string;
  detail?: boolean;
}) {
  const Heading = detail ? "h2" : "h1";

  return (
    <section
      aria-labelledby="journal-hero-title"
      className="relative isolate flex min-h-[390px] items-center justify-center overflow-hidden bg-[#eff1ea] px-5 pb-24 pt-16 text-center sm:min-h-[450px] sm:px-8 sm:pb-28 sm:pt-20 lg:min-h-[500px]"
    >
      <Image
        src={settings.heroAsset?.source || "/images/our-story/our-story-banner.png"}
        alt=""
        fill
        priority
        unoptimized={Boolean(settings.heroAsset?.source)}
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/60 to-white/20"
      />
      <div className="relative mx-auto w-full max-w-5xl">
        <Heading
          id="journal-hero-title"
          className="font-serif text-4xl font-semibold tracking-[-0.035em] text-[#252a30] sm:text-5xl lg:text-6xl"
        >
          {settings.heroTitle}
        </Heading>
        {settings.heroSubtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#3c443f] sm:text-base sm:leading-7">
            {settings.heroSubtitle}
          </p>
        ) : null}
        <nav
          aria-label="Journal categories"
          className="mx-auto mt-10 flex w-fit max-w-full overflow-x-auto rounded-xl border border-white/80 bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(45,72,55,0.10)] backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link
            href="/journal"
            aria-current={!selectedCategory && !detail ? "page" : undefined}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43] sm:text-sm ${
              !selectedCategory
                ? "bg-[#2c5d43] text-white"
                : "text-[#515a54] hover:bg-[#edf4ee] hover:text-[#2c5d43]"
            }`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/journal?category=${encodeURIComponent(category.slug)}`}
              aria-current={category.slug === selectedCategory && !detail ? "page" : undefined}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43] sm:text-sm ${
                category.slug === selectedCategory
                  ? "bg-[#2c5d43] text-white"
                  : "text-[#515a54] hover:bg-[#edf4ee] hover:text-[#2c5d43]"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
      <WaveDivider
        variant="scallop"
        className="absolute inset-x-0 -bottom-px h-[18px] w-full"
      />
    </section>
  );
}
