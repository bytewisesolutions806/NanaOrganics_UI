import Image from 'next/image';
import Link from 'next/link';
import natureBanner from '@/assets/images/gallery/gallery_image_4.png';
import spiceBanner from '@/assets/images/shop-spice-banner.jpg';

const bannerImages = {
  nature: natureBanner,
  spices: spiceBanner,
};

export default function NaturePromoBanner({ variant = 'nature' }) {
  return (
    <section className="mx-auto w-[calc(100%_-_32px)] max-w-[1296px] md:w-[calc(100%_-_40px)]">
      <div className="relative min-h-[380px] overflow-hidden rounded-2xl sm:min-h-[360px] md:h-[400px]">
        <Image
          src={bannerImages[variant] || natureBanner}
          alt="Organic ingredients from Nana Organics"
          fill
          sizes="(max-width: 768px) calc(100vw - 40px), 1296px"
          className="object-cover"
          priority={variant === 'nature'}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />

        <div className="relative z-10 flex min-h-[380px] max-w-[680px] flex-col justify-center px-5 py-9 text-white sm:min-h-[360px] sm:px-10 md:h-[400px] md:px-[81px]">
          <h2
            className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl"
            style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            Bring Nature Home Today
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-6 sm:text-sm md:mt-[14px] md:text-base md:leading-7">
            Experience the pure goodness of organic living with Nana Organics.
            From farm-fresh ingredients to natural care essentials — everything
            your body and home deserve.
          </p>
          <div className="mt-7 flex flex-wrap gap-[14px]">
            <Link
              href="/shop"
              className="inline-flex min-h-[50px] items-center justify-center rounded-xl border-[1.5px] border-[#C6D8D7] bg-white px-8 text-sm font-semibold text-black shadow-[0_6px_6px_rgba(60,87,80,0.1)] sm:text-base"
            >
              Shop Now
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-[#1EA766] px-8 text-sm font-semibold text-white shadow-[0_6px_6px_rgba(60,87,80,0.1)] sm:text-base"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
