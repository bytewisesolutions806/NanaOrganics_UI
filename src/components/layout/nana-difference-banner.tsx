import Image from "next/image";
import { CreditCard, Leaf, RefreshCw, Truck } from "lucide-react";

const benefits = [
  { label: "100% Natural", Icon: Leaf },
  { label: "Free Shipping $50+", Icon: Truck },
  { label: "Secure Payment", Icon: CreditCard },
  { label: "Easy Returns", Icon: RefreshCw },
];

export function NanaDifferenceBanner() {
  return (
    <section
      aria-labelledby="nana-difference-heading"
      className="relative isolate min-h-[300px] overflow-hidden bg-[#f7f8f2] px-5 py-14 sm:min-h-[360px] sm:px-8 sm:py-20 lg:min-h-[400px] lg:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(246,247,239,0.88)_58%,rgba(219,225,215,0.9)_100%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 -z-10 h-28 w-full sm:h-36"
      >
        <path
          d="M0 166 130 142 246 172 383 130 520 163 676 122 827 166 960 135 1112 172 1253 126 1440 156V220H0Z"
          fill="#d2d9cf"
          fillOpacity=".42"
        />
        <path
          d="m0 188 164-27 156 34 174-31 160 27 184-40 183 38 160-30 129 27 130-29v63H0Z"
          fill="#c7d0c4"
          fillOpacity=".55"
        />
      </svg>
      <Image
        src="/images/homepage-leaf-left-bottom.png"
        alt=""
        width={240}
        height={190}
        unoptimized
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-14 -z-0 w-40 rotate-[-18deg] sm:-left-12 sm:-top-20 sm:w-56"
      />
      <Image
        src="/images/homepage-leaf-right-top.png"
        alt=""
        width={260}
        height={190}
        unoptimized
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-14 -z-0 w-40 rotate-[-8deg] sm:-bottom-20 sm:-right-12 sm:w-60"
      />

      <div className="relative z-10 mx-auto max-w-[920px] text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.42em] text-[#36443b] sm:text-[11px]">
          Pure by nature
        </p>
        <h2
          id="nana-difference-heading"
          className="mt-2 font-serif text-2xl font-semibold tracking-[-0.025em] text-[#252a2f] sm:text-3xl"
        >
          What Makes NANA Different
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-[#343c38] sm:text-sm">
          Rooted in Himalayan wisdom, crafted with nature, and made for modern
          living.
        </p>

        <ul className="mt-7 grid grid-cols-2 sm:mt-8 sm:grid-cols-4">
          {benefits.map(({ label, Icon }, index) => (
            <li
              key={label}
              className={`flex min-h-[76px] flex-col items-center justify-center gap-2 px-2 text-sm font-medium text-[#222c27] sm:min-h-[60px] sm:px-3 ${
                index % 2 === 1 ? "border-l border-[#cbd3cc]" : ""
              } ${index >= 2 ? "border-t border-[#cbd3cc] sm:border-t-0" : ""} ${
                index > 0 && index % 2 === 0 ? "sm:border-l" : ""
              }`}
            >
              <Icon
                aria-hidden="true"
                className="size-8 text-[#65bd43] sm:size-9"
                strokeWidth={2.8}
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
