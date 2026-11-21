import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { HomeProductSection } from "@/components/home/home-product-section";
import { WaveDivider } from "@/components/ui/wave-divider";
import { getDefaultHomepage } from "@/services/api/storefront";

export const metadata: Metadata = {
  title: "Our Brands | Nana Organics",
  description:
    "Discover Everest Organica and Sava Organics, two brands united by Nana Organics and a shared respect for nature.",
};

const brandFamily = [
  {
    name: "Nana Organics",
    description:
      "Why you can trust us. Our sourcing, our values and the heritage that brings everything together.",
    logo: "/images/our-brand/Group 2085665293.png",
    logoWidth: 322,
  },
  {
    name: "Everest Organica",
    description:
      "What you can cook, eat and share. Discover wholesome foods made for everyday meals and special moments.",
    logo: "/images/our-brand/Group 2085665292.png",
    logoWidth: 200,
  },
  {
    name: "Sava Organics",
    description:
      "What you can use to care for your skin, hair and body. Explore natural essentials inspired by mindful living.",
    logo: "/images/our-brand/Group 2085665291.png",
    logoWidth: 195,
  },
];

const everestCategories = [
  {
    name: "Grains",
    src: "/images/our-brand/Mask group.png",
    alt: "Golden wheat growing naturally",
  },
  {
    name: "Spices",
    src: "/images/our-brand/Mask group-1.png",
    alt: "A selection of colourful spices",
  },
  {
    name: "Teas",
    src: "/images/our-brand/Mask group-2.png",
    alt: "A refreshing herbal drink with mint",
  },
  {
    name: "Honey",
    src: "/images/our-brand/Mask group-3.png",
    alt: "Natural honeycomb on a rustic plate",
  },
  {
    name: "Rice",
    src: "/images/our-brand/Mask group-4.png",
    alt: "A variety of fragrant grains and rice",
  },
];

const savaCategories = [
  {
    name: "Skincare",
    src: "/images/our-brand/Mask group-5.png",
    alt: "A woman applying a nourishing skincare cream",
  },
  {
    name: "Haircare",
    src: "/images/our-brand/Mask group-6.png",
    alt: "A botanical oil treatment for healthy hair",
  },
  {
    name: "Body Care",
    src: "/images/our-brand/Mask group-7.png",
    alt: "A calming botanical spa treatment",
  },
  {
    name: "Wellness",
    src: "/images/our-brand/Mask group-8.png",
    alt: "A peaceful moment beside the water",
  },
  {
    name: "Botanical Oils",
    src: "/images/our-brand/Mask group-9.png",
    alt: "A hand blending botanical oils",
  },
];

function CategoryCircles({
  categories,
  dark = false,
}: {
  categories: { name: string; src: string; alt: string }[];
  dark?: boolean;
}) {
  return (
    <div className="mt-10 grid grid-cols-2 justify-items-center gap-x-5 gap-y-8 sm:mt-12 sm:grid-cols-5 sm:gap-x-6 lg:mt-14 lg:gap-x-9">
      {categories.map((category) => (
        <figure
          key={category.name}
          className="w-full max-w-[132px] text-center sm:max-w-[180px] lg:max-w-[210px] [&:last-child:nth-child(odd)]:col-span-2 sm:[&:last-child:nth-child(odd)]:col-span-1"
        >
          <div className="relative aspect-square overflow-hidden rounded-full">
            <Image
              src={category.src}
              alt={category.alt}
              fill
              sizes="(max-width: 639px) 30vw, 18vw"
              className="object-cover transition duration-500 hover:scale-105"
            />
          </div>
          <figcaption
            className={`mt-4 text-sm font-medium sm:text-lg ${
              dark ? "text-white" : "text-[#3f4742]"
            }`}
          >
            {category.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

async function BrandsFeaturedProducts() {
  const homepage = await getDefaultHomepage();
  const featuredProducts = homepage.productSections[0];

  if (!featuredProducts) return null;

  return (
    <HomeProductSection
      eyebrow="How the brands fit together"
      section={{
        ...featuredProducts,
        title: "Every product carries our name",
        description:
          "Every product carries our signature, 'A NANA Organics Brand,' representing our shared values of quality, mindful sourcing and natural care.",
      }}
    />
  );
}

export default function BrandsPage() {
  return (
    <main className="overflow-hidden bg-white">
      <section
        aria-labelledby="brands-hero-title"
        className="relative isolate flex min-h-[650px] items-center overflow-hidden px-5 pb-12 pt-40 sm:min-h-[700px] sm:px-8 sm:pb-14 sm:pt-44 lg:min-h-[803px] lg:px-12 lg:pb-16 lg:pt-48"
      >
        <Image
          src="/images/our-brand/header banner.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="mx-auto grid w-full max-w-[878px] place-items-center">
          <div className="w-full text-center xl:-translate-y-[55px]">
            <h1
              id="brands-hero-title"
              className="font-serif text-[40px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#15191c] sm:text-[54px] lg:text-[64px] lg:leading-[1.1] xl:text-[72px]"
            >
              Two brands.
              <br />
              One shared promise.
            </h1>
            <p className="mx-auto mt-4 max-w-[878px] text-sm leading-6 text-[#292f32] sm:mt-3 sm:text-base sm:leading-[30px] lg:mt-0">
              Everest Organica fills your kitchen. Sava Organics fills your
              self-care shelf. Both come from the same Himalayan roots and the
              same belief: good things should be simple, honest and made with
              care.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:mt-9 lg:mt-[45px]">
              <Link
                href="/?brand=everest-organics"
                className="inline-flex rounded-md h-[50px] items-center justify-center bg-[#285d43] px-[17px] text-sm font-medium text-white transition hover:bg-[#204b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285d43]"
              >
                Shop Food
              </Link>
              <Link
                href="/?brand=sava-organics"
                className="inline-flex rounded-md bg-white h-[50px] items-center justify-center  px-[17px] text-sm font-bold text-[#285d43] transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285d43]"
              >
                Shop Beauty &amp; Wellness
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="brand-family-title"
        className="relative isolate overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-24 lg:flex lg:min-h-[857px] lg:items-center lg:py-16"
      >
        <Image
          src="/images/our-brand/One family, three roles.webp"
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-30 sm:opacity-45 lg:opacity-100"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-white/60 sm:bg-white/55 lg:bg-white/65"
        />
        <div className="mx-auto w-full max-w-[1294px]">
          <div className="mx-auto max-w-[1020px] text-center">
            <p className="brand-family-eyebrow text-xs font-medium uppercase tracking-[0.38em] text-[#252a30] sm:text-sm">
              Brand Family
            </p>
            <h2
              id="brand-family-title"
              className="mt-3 font-serif text-3xl font-semibold tracking-[-0.025em] text-[#252a30] sm:text-4xl lg:mt-5 lg:text-5xl"
            >
              One family, three roles
            </h2>
            <p className="brand-family-intro mt-3 text-sm leading-6 text-[#252a30] sm:text-base sm:leading-7 lg:mt-4">
              Nana Organics is the family and the philosophy. Everest Organica
              and Sava Organics are the two brands you shop. Each has its own
              personality, and each carries our name because we stand behind
              everything we make.
            </p>
          </div>
          <div className="mt-12 grid gap-12 text-center md:grid-cols-3 md:gap-0 lg:mt-16">
            {brandFamily.map((brand, index) => (
              <article
                key={brand.name}
                className="relative mx-auto w-full max-w-[390px] px-4 md:px-8 lg:px-5"
              >
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    className="brand-family-card-separator absolute left-0 top-24 hidden w-px md:block"
                  />
                ) : null}
                <div className="brand-family-card-logo grid h-44 place-items-center">
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    width={brand.logoWidth}
                    height={218}
                    sizes="(max-width: 767px) 260px, (max-width: 1279px) 24vw, 322px"
                    className="w-auto max-w-full object-contain"
                  />
                </div>
                <h3 className="brand-family-card-title mt-5 text-xl font-medium text-[#252a30]">
                  {brand.name}
                </h3>
                <p className="brand-family-card-description mx-auto mt-1 max-w-[350px] text-sm leading-6 text-[#252a30] sm:text-base sm:leading-7">
                  {brand.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="everest-title"
        className="relative isolate overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:flex lg:min-h-[737px] lg:items-center lg:py-16"
      >
        <Image
          src="/images/our-brand/Himalayan flavours for everyday cooking.webp"
          alt=""
          fill
          sizes="100vw"
          className="-z-30 object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-gradient-to-b from-white/35 via-white/0 to-[#0b3721]/5"
        />
        <div className="mx-auto w-full max-w-[1294px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#274f38] sm:text-xs">
              Everest Organica
            </p>
            <h2
              id="everest-title"
              className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#101714] sm:text-4xl lg:text-[54px]"
            >
              Himalayan flavours for everyday cooking
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#24322a] sm:text-base sm:leading-7">
              Everest Organica brings you natural grains, spices, teas, honey,
              and pantry essentials inspired by mountain kitchens. Every product
              celebrates authentic flavour, heritage, and the stories behind
              them.
            </p>
          </div>
          <CategoryCircles categories={everestCategories} dark />
          <div className="mt-8 text-center sm:mt-10 lg:mt-9">
            <Link
              href="/?brand=everest-organics"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-4 text-xs font-medium text-[#26342d] shadow-sm transition hover:bg-[#f4f7f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop Everest Organica
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="sava-title"
        className="relative bg-white px-5 pb-10 pt-16 sm:px-8 sm:pb-12 sm:pt-20 lg:px-12 lg:pb-16 lg:pt-24"
      >
        <div className="mx-auto max-w-[1294px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#527b62] sm:text-xs">
              Sava Organics
            </p>
            <h2
              id="sava-title"
              className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#29312c] sm:text-4xl lg:text-[54px]"
            >
              Nature-led care, made into a ritual
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#566159] sm:text-base sm:leading-7">
              Sava Organics&apos; body and botanical products offer
              nature-inspired skincare, haircare, and botanical essentials made
              with simple, plant-based ingredients for everyday care.
            </p>
          </div>
          <CategoryCircles categories={savaCategories} />
          <div className="mt-8 text-center sm:mt-10">
            <Link
              href="/?brand=sava-organics"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#2d6048] px-4 text-xs font-medium text-white shadow-sm transition hover:bg-[#234e3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6048]"
            >
              Shop Sava Organics
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <WaveDivider className="absolute inset-x-0 bottom-0 h-9 w-full translate-y-1/2 sm:h-12" />
      </section>

      <Suspense
        fallback={
          <div
            className="min-h-[520px] animate-pulse bg-[#f5f7f4]"
            aria-hidden="true"
          />
        }
      >
        <BrandsFeaturedProducts />
      </Suspense>
    </main>
  );
}
