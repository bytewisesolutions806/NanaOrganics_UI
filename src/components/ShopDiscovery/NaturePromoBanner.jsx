import Image from 'next/image';
import Link from 'next/link';
import natureBanner from '@/assets/images/gallery/gallery_image_4.png';
import spiceBanner from '@/assets/images/shop-spice-banner.jpg';

const bannerContent = {
  nature: {
    image: natureBanner,
    alt: 'Organic ingredients from Nana Organics',
    title: 'Bring Nature Home Today',
    description:
      'Experience the pure goodness of organic living with Nana Organics. From farm-fresh ingredients to natural care essentials — everything your body and home deserve.',
    primaryAction: { label: 'Shop Now', href: '/shop' },
    secondaryAction: { label: 'Explore Collections', href: '/shop' },
  },
  spices: {
    image: spiceBanner,
    alt: 'Natural ingredients and home essentials from Nana Organics',
    title: 'A New Way to Feel at Home',
    description:
      'Pure ingredients. Natural essentials. Better living. Nana Organics brings together thoughtfully sourced products designed to make everyday living feel more natural.',
    primaryAction: { label: 'View Deal', href: '/deals' },
    secondaryAction: { label: 'Contact Us', href: '/contact-us' },
  },
};

export default function NaturePromoBanner({ variant = 'nature' }) {
  const content = bannerContent[variant] || bannerContent.nature;

  return (
    <section className="site-shell">
      <div className="relative min-h-[380px] overflow-hidden rounded-2xl sm:min-h-[360px] md:h-[400px]">
        <Image
          src={content.image}
          alt={content.alt}
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
            {content.title}
          </h2>
          <p className="mt-3 text-[13px] font-medium leading-6 sm:text-sm md:mt-[14px] md:text-base md:leading-7">
            {content.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-[14px]">
            <Link
              href={content.primaryAction.href}
              className="inline-flex min-h-[50px] items-center justify-center rounded-xl border-[1.5px] border-[#C6D8D7] bg-white px-8 text-sm font-semibold text-black shadow-[0_6px_6px_rgba(60,87,80,0.1)] sm:text-base"
            >
              {content.primaryAction.label}
            </Link>
            <Link
              href={content.secondaryAction.href}
              className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-[#1EA766] px-8 text-sm font-semibold text-white shadow-[0_6px_6px_rgba(60,87,80,0.1)] sm:text-base"
            >
              {content.secondaryAction.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
