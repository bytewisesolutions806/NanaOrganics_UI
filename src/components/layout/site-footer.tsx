import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  AtSign,
  Camera,
  CirclePlay,
  BriefcaseBusiness,
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
  { label: "Everest Organics", slug: "everest-organics" },
  { label: "Sava Organics", slug: "sava-organics" },
];

const socialLinks = [
  { label: "Social network", Icon: AtSign },
  { label: "Photo sharing", Icon: Camera },
  { label: "Video channel", Icon: CirclePlay },
  { label: "Professional network", Icon: BriefcaseBusiness },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 text-white">
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
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-9 px-6 py-8 sm:grid-cols-2 lg:grid-cols-[120px_minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
          <Link
            href="/"
            aria-label="Nana Organics home"
            className="mx-auto flex items-center justify-center lg:mx-0"
          >
            <Image
              src="/images/AppLogo-footer.png"
              alt="Nana Organics"
              width={120}
              height={103}
              unoptimized
              className="h-[88px] w-auto object-contain"
            />
          </Link>

          <section aria-labelledby="footer-links-heading">
            <h2 id="footer-links-heading" className="mb-3 font-serif text-lg">
              Quick Links
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-white/85">
              <div className="flex flex-col gap-2.5">
                {quickLinks.slice(0, 5).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                {quickLinks.slice(5).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-1 flex flex-col gap-1.5">
                  {brands.map((brand) => (
                    <Link
                      key={brand.slug}
                      href={{ pathname: "/", query: { brand: brand.slug } }}
                      className="rounded border border-white/20 px-2 py-1 text-center text-[10px] transition-colors hover:bg-white/10"
                    >
                      {brand.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="footer-contact-heading">
            <h2 id="footer-contact-heading" className="mb-3 font-serif text-lg">
              Get In Touch
            </h2>
            <address className="flex flex-col gap-3 text-xs not-italic text-white/85">
              <p className="flex items-start gap-2">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <span>123 Street Name, City, State, ZIP</span>
              </p>
              <a
                href="mailto:support@nanaorganics.com"
                className="flex items-center gap-2 hover:text-white"
              >
                <Mail aria-hidden="true" className="size-3.5 shrink-0" />
                support@nanaorganics.com
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

          <section aria-labelledby="footer-social-heading">
            <h2 id="footer-social-heading" className="mb-3 font-serif text-lg">
              Social Connection
            </h2>
            <ul className="flex items-center gap-3 text-white/85">
              {socialLinks.map(({ label, Icon }) => (
                <li key={label}>
                  <span
                    role="img"
                    aria-label={label}
                    className="inline-flex size-5 items-center justify-center"
                  >
                    <Icon aria-hidden="true" className="size-3.5" />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mx-auto flex max-w-[1120px] flex-col gap-3 border-t border-white/20 px-6 py-4 text-[10px] text-white/75 sm:flex-row sm:items-center sm:justify-between">
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
