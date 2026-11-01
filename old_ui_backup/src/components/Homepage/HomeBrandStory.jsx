import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomeBrandStory({ brand }) {
  const image = brand?.storyAsset?.source || '/banner_image.webp';
  return (
    <section className="site-shell my-14 sm:my-20 lg:my-24">
      <div className="grid overflow-hidden rounded-[28px] bg-[#F2F5EC] md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#508162] sm:text-sm">
            {brand?.storyEyebrow || 'A MORE NATURAL EVERYDAY'}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#233E32] sm:text-4xl lg:text-[46px]">
            {brand?.storyTitle || 'Good for you. Gentle on the planet.'}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#58665D] sm:text-base sm:leading-7">
            {brand?.storyDescription ||
              'We bring together nature-inspired essentials made with care, so choosing a little more natural can feel simple every day.'}
          </p>
          <Link
            href={brand?.storyLink || '/our-story'}
            className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#315F48] px-5 text-sm font-semibold text-white transition hover:bg-[#234B37]"
          >
            {brand?.storyLinkLabel || 'Get to know us'}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="relative min-h-[240px] sm:min-h-[320px] md:min-h-[400px]">
          <Image
            src={image}
            alt="Lush green hills growing tea beneath a misty sky"
            fill
            unoptimized
            sizes="(max-width: 767px) calc(100vw - 32px), 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
