import { HandHeart, Leaf, Star, UsersRound } from "lucide-react";

import type { ProductReviewSummary } from "@/features/products/components/product-reviews";
import type { StoreProduct } from "@/types/storefront";

export function ProductHighlights({
  product,
  reviewSummary,
}: {
  product: StoreProduct;
  reviewSummary: ProductReviewSummary | null;
}) {
  const claims = [
    { icon: UsersRound, value: product.customFields?.dermatologistClaimValue, label: product.customFields?.dermatologistClaimLabel },
    { icon: Leaf, value: product.customFields?.ingredientClaimValue, label: product.customFields?.ingredientClaimLabel },
    { icon: HandHeart, value: product.customFields?.guaranteeClaimValue, label: product.customFields?.guaranteeClaimLabel },
  ].filter((claim) => claim.value?.trim() && claim.label?.trim());
  const rating = reviewSummary?.productId === product.id && reviewSummary.totalReviewCount > 0
    ? reviewSummary.averageRating
    : null;

  if (rating === null && claims.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8" aria-label="Product highlights">
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {rating !== null ? (
          <div className="flex min-h-36 w-[calc((100%-0.75rem)/2)] flex-col items-center justify-center rounded-xl border border-[#dbe6dd] px-3 py-5 text-center text-[#2c5d43] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <Star className="size-8" strokeWidth={1.5} aria-hidden="true" />
            <strong className="mt-3 text-xl font-semibold">{rating.toFixed(1)}/5</strong>
            <span className="mt-1 text-xs">Average Rating</span>
          </div>
        ) : null}
        {claims.map(({ icon: Icon, value, label }, index) => (
          <div key={index} className="flex min-h-36 w-[calc((100%-0.75rem)/2)] flex-col items-center justify-center rounded-xl border border-[#dbe6dd] px-3 py-5 text-center text-[#2c5d43] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
            <Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
            <strong className="mt-3 text-xl font-semibold">{value?.trim()}</strong>
            <span className="mt-1 text-xs">{label?.trim()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
