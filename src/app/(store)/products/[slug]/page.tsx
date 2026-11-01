import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/features/products/components/product-detail";
import { getRelatedStorefrontProducts, getStorefrontProduct } from "@/services/api/storefront";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string | string[];
    variant?: string | string[];
    quantity?: string | string[];
  }>;
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function ProductPageContent({ params, searchParams }: ProductPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedStorefrontProducts(product);
  const inferredBrand = product.facetValues.find((value) => value.facet.code === "organic-brand" || /brand/i.test(value.facet.name));
  const requestedQuantity = Number.parseInt(first(query.quantity) ?? "1", 10);

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      brandSlug={first(query.brand) || inferredBrand?.code || "sava-organics"}
      initialVariantId={first(query.variant)}
      initialQuantity={Number.isFinite(requestedQuantity) ? requestedQuantity : 1}
    />
  );
}

function ProductPageFallback() {
  return (
    <main className="mx-auto max-w-[1240px] animate-pulse px-5 py-10 sm:px-8">
      <div className="h-4 w-60 rounded bg-[#e7eee8]" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-square rounded-[28px] bg-[#eef4ef]" />
        <div className="space-y-5 py-5">
          <div className="h-4 w-28 rounded bg-[#e7eee8]" />
          <div className="h-12 w-4/5 rounded bg-[#e7eee8]" />
          <div className="h-5 w-2/3 rounded bg-[#e7eee8]" />
          <div className="h-28 rounded bg-[#eef4ef]" />
          <div className="h-14 rounded bg-[#dce8df]" />
        </div>
      </div>
    </main>
  );
}

export default function ProductPage(props: ProductPageProps) {
  return (
    <Suspense fallback={<ProductPageFallback />}>
      <ProductPageContent {...props} />
    </Suspense>
  );
}
