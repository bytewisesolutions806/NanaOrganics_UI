import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Nana Organics",
  description:
    "Get in touch with Nana Organics. Send our team a message and we will be happy to help.",
};

const contactDetails = [
  {
    label: "Address",
    value: "3892 Scottsville Rd, Scottsville, NY 14546",
    href: undefined,
    Icon: MapPin,
  },
  {
    label: "Phone",
    value: "(585) 889-8570",
    href: "tel:+15858898570",
    Icon: Phone,
  },
  {
    label: "Email",
    value: "support@nanaorganics.co",
    href: "mailto:support@nanaorganics.co",
    Icon: Mail,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-white">
      <section
        aria-labelledby="contact-hero-title"
        className="relative isolate flex min-h-[390px] items-center justify-center overflow-hidden px-5 py-20 text-center sm:min-h-[470px] lg:min-h-[560px]"
      >
        <Image
          src="/images/Auth-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[#12291f]/35 via-[#12291f]/40 to-[#12291f]/55"
        />
        <div className="relative z-10 mx-auto max-w-3xl text-white mt-20">
          <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-white/85 sm:text-xs">
            Pure by Nature
          </p>
          <h1
            id="contact-hero-title"
            className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.02em] sm:text-5xl lg:text-6xl"
          >
            Get in Touch With Us
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/90 sm:text-base sm:leading-7">
            We&apos;re here to help and answer any questions you might have. We
            look forward to hearing from you.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center justify-center bg-white px-6 text-sm font-medium text-[#285d43] transition hover:bg-[#eff5ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Shop Now
            </Link>
            <Link
              href="/our-story"
              className="inline-flex min-h-11 items-center justify-center border border-white/80 px-6 text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="contact-information-title"
        className="px-5 py-14 sm:px-8 sm:py-20"
      >
        <div className="mx-auto grid max-w-[1080px] gap-10 md:grid-cols-[1fr_0.9fr] md:items-start md:gap-16 lg:gap-24">
          <div className="pt-1">
            <h2
              id="contact-information-title"
              className="font-serif text-2xl font-semibold text-[#252a2c] sm:text-3xl"
            >
              Contact Information
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#68736b]">
              Have a question about our products or your order? We&apos;re
              always happy to help.
            </p>

            <address className="mt-7 flex flex-col gap-5 not-italic">
              {contactDetails.map(({ label, value, href, Icon }) => {
                const detail = href ? (
                  <a
                    href={href}
                    className="text-xs leading-5 text-[#69746c] transition-colors hover:text-[#285d43]"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-xs leading-5 text-[#69746c]">{value}</p>
                );

                return (
                  <div key={label} className="flex items-center gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-[#285d43] text-white">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#303b33]">
                        {label}
                      </h3>
                      {detail}
                    </div>
                  </div>
                );
              })}
            </address>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
