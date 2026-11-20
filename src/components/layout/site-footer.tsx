import Image from "next/image";
import Link from "next/link";
import {
  AtSign,
  Camera,
  CirclePlay,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { NewsletterSignup } from "@/components/layout/newsletter-signup";

const quickLinks = [
  { label: "Our Brand", href: "/brands" },
  { label: "Bundles & Gifts", href: "/categories/bundles" },
  { label: "Ingredients & Provenance", href: "/ingredients" },
  { label: "Natural Living", href: "/natural-living" },
  { label: "Our Story", href: "/our-story" },
  { label: "Journal", href: "/journal" },
  { label: "FAQ's", href: "/faqs" },
  { label: "Contacts", href: "/contact" },
  { label: "Return policy", href: "/return-policy" },
];

const brands = [
  { label: "Everest Organica", slug: "everest-organics" },
  { label: "Sava Organics", slug: "sava-organics" },
];

const socialLinks: {
  label: string;
  Icon?: typeof AtSign;
  mark?: string;
}[] = [
  { label: "Facebook", mark: "f" },
  { label: "Instagram", Icon: Camera },
  { label: "X", mark: "X" },
  { label: "LinkedIn", mark: "in" },
  { label: "YouTube", Icon: CirclePlay },
];

export function SiteFooter() {
  return (
    <footer className="text-white">
      <section
        aria-labelledby="newsletter-heading"
        className="relative flex min-h-[230px] items-center justify-center overflow-hidden bg-cover bg-center px-5 py-12 sm:min-h-[250px]"
        style={{ backgroundImage: "url('/images/footer-image.png')" }}
      >
        <div className="absolute inset-0 bg-[#102c22]/30" aria-hidden="true" />
        <div className="relative z-10 w-full text-center">
          <h2
            id="newsletter-heading"
            className="font-serif text-3xl font-semibold sm:text-4xl"
          >
            Join The NANA Circle
          </h2>
          <p className="mt-3 text-sm text-white/95">
            Be part of something rooted in nature.
          </p>
          <div className="mt-5">
            <NewsletterSignup />
          </div>
        </div>
      </section>

      <div className="bg-[#285d43]">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-5 py-8 sm:grid-cols-2 sm:gap-9 lg:min-h-[200px] lg:grid-cols-[120px_minmax(0,1.8fr)_minmax(220px,1fr)_minmax(170px,0.8fr)] lg:gap-6 lg:px-10 lg:py-9 2xl:px-12">
          <Link
            href="/"
            aria-label="Nana Organics home"
            className="mx-auto flex items-center justify-center lg:mx-0"
          >
            <Image
              src="/images/AppLogo-footer.png"
              alt="Nana Organics"
              width={130}
              height={112}
              unoptimized
              className="h-[104px] w-auto object-contain"
            />
          </Link>

          <section aria-labelledby="footer-links-heading" className="min-w-0">
            <h2 id="footer-links-heading" className="mb-3 font-serif text-lg leading-6">
              Quick Links
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs leading-[1.5] text-white/85 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(100px,1fr)] lg:gap-x-3">
              <div className="flex min-w-0 flex-col gap-2">
                {quickLinks.slice(0, 3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                {quickLinks.slice(3, 6).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                {quickLinks.slice(6).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={{ pathname: "/", query: { brand: brand.slug } }}
                    className="rounded border border-white/20 px-2 py-1.5 text-center text-[10px] leading-3 transition-colors hover:bg-white/10"
                  >
                    {brand.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="footer-contact-heading" className="min-w-0">
            <h2 id="footer-contact-heading" className="mb-3 font-serif text-lg leading-6">
              Get In Touch
            </h2>
            <address className="flex flex-col gap-2.5 text-xs leading-[1.5] not-italic text-white/85">
              <p className="flex items-start gap-2">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <span>123 Street Name, City, State, ZIP</span>
              </p>
              <a
                href="mailto:support@nanaorganics.co"
                className="flex items-center gap-2 hover:text-white"
              >
                <Mail aria-hidden="true" className="size-3.5 shrink-0" />
                support@nanaorganics.co
              </a>
              <a
                href="tel:+91123456789"
                className="flex items-center gap-2 hover:text-white"
              >
                <Phone aria-hidden="true" className="size-3.5 shrink-0" />
                +91 123 456 789
              </a>
            </address>
          </section>

          <section aria-labelledby="footer-social-heading" className="min-w-0">
            <h2 id="footer-social-heading" className="mb-3 font-serif text-lg leading-6">
              Social Connection
            </h2>
            <ul className="flex items-center gap-3 text-white/85">
              {socialLinks.map(({ label, Icon, mark }) => (
                <li key={label} className="flex size-5 items-center justify-center">
                  <span
                    role="img"
                    aria-label={label}
                    className="grid size-4 place-items-center text-[10px] font-semibold leading-none"
                  >
                    {Icon ? (
                      <Icon aria-hidden="true" className="size-3.5" />
                    ) : (
                      mark
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 border-t border-white/20 px-5 py-3 text-[10px] text-white/75 sm:flex-row sm:items-center sm:justify-between lg:px-10 2xl:px-12">
          <p>© 2025 Nana Organics. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms-of-service" className="hover:text-white">
              Terms of Service
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/cookie-settings" className="hover:text-white">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
