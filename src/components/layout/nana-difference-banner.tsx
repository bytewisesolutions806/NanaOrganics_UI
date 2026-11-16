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
      className="relative isolate min-h-[330px] overflow-hidden bg-[#f7f8f2] px-5 py-14 sm:min-h-[380px] sm:px-8 sm:py-20 lg:min-h-[420px] lg:py-24"
    >
      <Image
        src="/images/what-makes-different-banner.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden="true"
        className="object-cover object-center -z-10"
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
