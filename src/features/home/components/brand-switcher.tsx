import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";

import type { StoreBrand } from "@/types/storefront";

interface BrandSwitcherProps {
  brands: StoreBrand[];
  activeBrandSlug: string;
  onBrandSelect?: () => void;
}

export function BrandSwitcher({
  brands,
  activeBrandSlug,
  onBrandSelect,
}: BrandSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Choose a brand"
      className="flex max-w-full items-center gap-2 overflow-x-auto"
    >
      {brands.map((brand) => {
        const active = brand.slug === activeBrandSlug;

        return (
          <Link
            key={brand.id}
            href={{ pathname: "/", query: { brand: brand.slug } }}
            scroll={false}
            onClick={onBrandSelect}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[#2C5D43] px-4 text-sm font-semibold text-white shadow-sm"
                : "inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-[#a9b9ac] bg-white/90 px-4 text-sm font-semibold text-[#244532] transition hover:border-[#3f7652] hover:bg-[#f1f6f1]"
            }
          >
            <span
              className={
                active
                  ? "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white p-0.5 shadow-sm ring-1 ring-white/80"
                  : "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f7f9f4] p-0.5 ring-1 ring-[#d6e1d7]"
              }
            >
              {brand.logoAsset?.source ? (
                <Image
                  src={brand.logoAsset.source}
                  alt={`${brand.name} logo`}
                  width={24}
                  height={24}
                  unoptimized
                  className="size-6 object-contain"
                />
              ) : (
                <Leaf
                  className="size-4 text-[#2C5D43]"
                  aria-hidden="true"
                />
              )}
            </span>
            {brand.name}
          </Link>
        );
      })}
    </div>
  );
}
