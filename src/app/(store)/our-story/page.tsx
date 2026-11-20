import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { UserRoundPlus } from "lucide-react";

import { WaveDivider } from "@/components/ui/wave-divider";

export const metadata: Metadata = {
  title: "Our Story | Nana Organics",
  description:
    "Discover the people, heritage, and care behind Nana Organics and our natural brands.",
};

const storyChapters = [
  {
    eyebrow: "Heritage",
    title: "Where the land and the family begin",
    description:
      "Rooted in Himalayan heritage and inspired by the resilience of farming communities, NANA Organics brings the goodness of nature into everyday living. Through Everest Organica and Sava Organics, we carry our values of natural living, thoughtful sourcing, and respect for our roots into a new generation.",
    image: "/images/our-story/our-story-section-1.png",
    imageAlt: "A couple sharing a quiet moment together in a Himalayan meadow",
    width: 858,
    height: 580,
    imageFirst: false,
    background: "bg-white",
    showDivider: true,
  },
  {
    eyebrow: "Displacement",
    title: "The moment everything changed",
    description:
      "There are moments in life when everything changes, and the connection to the land that once felt permanent becomes a memory. Leaving behind a place deeply rooted in family, tradition, and belonging was not simply about losing land; it was about leaving behind a way of life. Through the journey, the memories, values, and traditions carried from that land continued to shape the family’s identity.",
    image: "/images/our-story/our-story-section-2.png",
    imageAlt: "A family spending time together outdoors beneath the trees",
    width: 970,
    height: 597,
    imageFirst: true,
    background: "bg-[#f2f7f3]",
    showDivider: false,
  },
  {
    eyebrow: "Resilience",
    title: "What it took to rebuild",
    description:
      "Rebuilding a life in a new place took courage, patience, and the strength to begin again. With the support of family, friends, and the surrounding community, each small step brought a sense of hope and belonging. The skills, knowledge, and traditions carried from the past became the foundation for a new beginning—and a reminder that life can grow again.",
    image: "/images/our-story/our-story-section-3.png",
    imageAlt: "Farmers carrying baskets through a lush green growing area",
    width: 837,
    height: 607,
    imageFirst: false,
    background: "bg-white",
    showDivider: false,
  },
  {
    eyebrow: "Community",
    title: "The people behind every product",
    description:
      "Behind every product is a story of the people who make it possible. From the farmers who nurture the soil to the makers who carefully prepare each ingredient, every individual brings their own knowledge, experience, and dedication to the journey. Their hands, their stories, and their commitment to quality are at the heart of everything we create.",
    image: "/images/our-story/our-story-section-4.png",
    imageAlt: "Farmers tending to green crops together in a hillside field",
    width: 970,
    height: 728,
    imageFirst: false,
    background: "bg-[#f2f7f3]",
    showDivider: true,
  },
  {
    eyebrow: "Nana Organics",
    title: "Why this company exists",
    description:
      "NANA Organics was born from a desire to preserve the connection between nature, tradition, and everyday living. What began with a deep respect for the land and its natural gifts grew into a vision of creating products that bring people closer to nature. Today, Everest Organica and Sava Organics share that vision through authentic, nature-inspired products made with care.",
    image: "/images/our-story/our-story-section-5.png",
    imageAlt:
      "Natural botanicals and spices arranged beside a woman enjoying a skincare ritual",
    width: 789,
    height: 686,
    imageFirst: true,
    background: "bg-white",
    showDivider: false,
  },
];

export default function OurStoryPage() {
  return (
    <main className="bg-white">
      <section
        aria-labelledby="our-story-title"
        className="relative isolate flex min-h-[540px] items-center justify-center overflow-hidden px-5 pb-16 pt-36 text-center sm:min-h-[600px] sm:px-8 sm:pt-40 xl:min-h-[670px] xl:pt-48"
      >
        <Image
          src="/images/our-story/our-story-banner.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[center_62%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-white/35 via-white/20 to-[#15291f]/15"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-[#315b43] sm:text-xs">
            Our Story
          </p>
          <h1
            id="our-story-title"
            className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-[#252a30] sm:text-5xl lg:text-6xl"
          >
            From Himalayan roots to a new generation
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[#303a35] sm:text-base sm:leading-7">
            Every great story begins with the land. Meet the farming families,
            traditions, and shared values behind NANA Organics, and discover our
            journey from humble beginnings to a more thoughtful future.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center rounded-md justify-center gap-2 bg-[#285d43] px-6 text-sm font-medium text-white transition hover:bg-[#204c36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285d43]"
            >
              <UserRoundPlus aria-hidden="true" className="size-4" />
              Join Nana Organics
            </Link>
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center rounded-md justify-center border border-[#285d43]/30 bg-white/90 px-6 text-sm font-medium text-[#285d43] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285d43]"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {storyChapters.map((chapter, index) => (
        <section
          key={chapter.eyebrow}
          aria-labelledby={`story-chapter-${index + 1}`}
          className={`relative ${chapter.background} px-5 py-14 sm:px-8 sm:py-20 lg:py-24`}
        >
          <div className="mx-auto grid max-w-[1080px] items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
            <div
              className={`relative mx-auto w-full max-w-[520px] ${
                chapter.imageFirst ? "md:order-first" : "md:order-last"
              }`}
            >
              <Image
                src={chapter.image}
                alt={chapter.imageAlt}
                width={chapter.width}
                height={chapter.height}
                sizes="(max-width: 767px) 100vw, 50vw"
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="mx-auto w-full max-w-[440px]">
              <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-[#315b43] sm:text-xs">
                {chapter.eyebrow}
              </p>
              <h2
                id={`story-chapter-${index + 1}`}
                className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#252a30] sm:text-4xl"
              >
                {chapter.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#30383d] sm:text-[15px] sm:leading-[1.8]">
                {chapter.description}
              </p>
            </div>
          </div>
          {chapter.showDivider ? (
            <WaveDivider className="absolute inset-x-0 bottom-0 h-9 w-full" />
          ) : null}
        </section>
      ))}

      {/* <section
        aria-labelledby="our-story-next-title"
        className="bg-[#285d43] px-5 py-14 text-center text-white sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-2xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.38em] text-white/75 sm:text-xs">
            Grow with us
          </p>
          <h2
            id="our-story-next-title"
            className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl"
          >
            A more thoughtful way to live, naturally
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
            Explore the products and traditions that bring our story into
            everyday life.
          </p>
          <Link
            href="/categories"
            className="mt-7 inline-flex min-h-11 items-center justify-center bg-white px-6 text-sm font-medium text-[#285d43] transition hover:bg-[#f2f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explore our products
          </Link>
        </div>
      </section> */}
    </main>
  );
}
