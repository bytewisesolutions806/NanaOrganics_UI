import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getStorefrontBrands } from "@/services/api/storefront";

async function SolidStoreHeader() {
  const brands = await getStorefrontBrands();

  if (!brands.length) return null;

  const selectedBrand =
    brands.find((brand) => brand.featured) ?? brands[0];

  return (
    <SiteHeader
      brands={brands}
      activeBrandSlug={selectedBrand.slug}
      variant="solid"
    />
  );
}

function SolidHeaderLoading() {
  return (
    <div
      className="h-[180px] animate-pulse border-b border-[#dbe4dc] bg-white"
      aria-hidden="true"
    />
  );
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<SolidHeaderLoading />}>
        <SolidStoreHeader />
      </Suspense>
      {children}
      <SiteFooter />
    </>
  );
}
