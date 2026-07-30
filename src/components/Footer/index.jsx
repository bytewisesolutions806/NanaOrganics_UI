"use client";
import Image from "next/image";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import "primeicons/primeicons.css";
import { useRouter } from "next/navigation";
import footerImage from "../../assets/images/FooterBg.png";
import footerLogo from "../../assets/images/FooterLogo.png";

export default function Footer() {
  const router = useRouter();

  const links = [
    { label: "Shop Now", path: "/shop" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact-us" },
    { label: "FAQs", path: "/faq" },
    { label: "Blog Posts", path: "/blog" },
  ];

  const contacts = [
    { label: "Newsletter", path: "/newsletter" },
    { label: "Events", path: "/events" },
    { label: "Partnership", path: "/partnership" },
    { label: "Careers", path: "/careers" },
    { label: "Testimonials", path: "/testimonials" },
  ];

  const socials = [
    { label: "Facebook", icon: "pi-facebook", path: "https://www.facebook.com/" },
    { label: "Instagram", icon: "pi-instagram", path: "https://www.instagram.com/" },
    { label: "Twitter", icon: "pi-twitter", path: "https://x.com/" },
    { label: "LinkedIn", icon: "pi-linkedin", path: "https://in.linkedin.com/" },
    { label: "YouTube", icon: "pi-youtube", path: "https://www.youtube.com/" },
  ];

  return (
    <footer className="">
      {/* ================= SUBSCRIBE SECTION ================= */}
      <div className="relative h-[280px] sm:h-[340px] lg:h-[200px]">
        <Image
          src={footerImage}
          alt="Footer Banner"
          fill
          priority
          className="object-cover bg-[#375653]"
        />

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* LEFT */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Stay Updated with NANA
              </h2>
              <p className="text-white/90 max-w-md mx-auto lg:mx-0">
                Subscribe for exclusive offers, tips and updates
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4 items-center lg:items-start">
              <div className="relative flex flex-col sm:flex-row w-full max-w-md gap-3">
                <div className="relative w-full">
                  {/* Icon container */}
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <i className="pi pi-envelope text-[#2C665E]" />
                  </span>

                  {/* Input */}
                  <InputText
                    placeholder="Enter your Email"
                    className="w-full h-[42px] sm:h-[46px] pl-10 bg-white rounded-lg border border-[#cfe2e0]"
                  />
                </div>

                <Button className="w-full sm:w-40 h-[42px] sm:h-[46px] bg-[#1EA766] text-white rounded-lg font-semibold justify-center">
                  Subscribe
                </Button>
              </div>

              {/* <div className="flex items-center gap-2 text-white/70 text-sm">
                <Checkbox inputId="terms" />
                <label htmlFor="terms">I agree to receive emails</label>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="bg-[#212C29] text-white">
        {/* TOP GRID */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          {/* LOGO */}
          <div>
            <img
              src="/footerLogo.svg"
              alt="Footer Logo"
              className="mx-auto sm:mx-0 w-[140px] sm:w-[160px] lg:w-[180px] h-auto]"
            />
            <p className="mt-4 flex items-center justify-center sm:justify-start text-[#C6D8D7]">
              <i className="pi pi-envelope mr-2 text-[#5EA087]"></i>
              support@nanaorganics.com
            </p>
            <p className="mt-3 flex items-center justify-center sm:justify-start text-[#C6D8D7]">
              <i className="pi pi-phone mr-2 text-[14px] sm:text-[16px] text-[#5EA087]" />
              +91 123 456 789
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3 text-white/70">
              {links.map((l) => (
                <li
                  key={l.path}
                  onClick={() => router.push(l.path)}
                  className="cursor-pointer hover:text-white"
                >
                  {l.label}
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact With Us</h3>
            <ul className="space-y-3 text-white/70">
              {contacts.map((c) => (
                <li
                  key={c.path}
                  onClick={() => router.push(c.path)}
                  className="cursor-pointer hover:text-white"
                >
                  {c.label}
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Social</h3>
            <ul className="space-y-3 text-white/70 flex flex-col items-center sm:items-start">
              {socials.map((s) => (
                <li
                  key={s.label}
                  onClick={() => window.open(s.path, "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-2 cursor-pointer hover:text-white"
                >
                  <i className={`pi ${s.icon} text-[#5EA087]`} />
                  {s.label}
                </li>
              ))}

            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/20" />

        {/* BOTTOM */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-white/60 text-sm text-center sm:text-left">
          <span>© 2025 Nana Organics. All Rights Reserved</span>
          <span className="cursor-pointer hover:text-white">
            Privacy Policy · Terms · Cookies
          </span>
        </div>
      </div>
    </footer>
  );
}
