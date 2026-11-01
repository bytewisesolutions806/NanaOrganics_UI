import { DEFAULT_IMAGE } from '@/lib/defaultImage';
import { resolveAssetUrl } from '@/lib/assetUrl';

/** Maps one Shop API WishlistItem into the profile wishlist view model. */
export function mapWishlistApiRow(row) {
  const product = row?.product;
  if (!product) return null;

  const variants = product.variants || [];
  const pricedVariants = variants.filter((variant) =>
    Number.isFinite(Number(variant?.priceWithTax)),
  );
  const lowestPricedVariant = pricedVariants.reduce(
    (lowest, variant) =>
      !lowest || Number(variant.priceWithTax) < Number(lowest.priceWithTax)
        ? variant
        : lowest,
    null,
  );
  const displayVariant = lowestPricedVariant || variants[0];

  return {
    id: String(row.id),
    product_id: String(product.id),
    name: product.name || '',
    slug: product.slug || '',
    weight: displayVariant?.name || displayVariant?.sku || '',
    price: Number(displayVariant?.priceWithTax || 0) / 100,
    currency: displayVariant?.currencyCode || 'INR',
    variant_id: displayVariant?.id ? String(displayVariant.id) : null,
    image: resolveAssetUrl(product.preview || displayVariant?.preview) || DEFAULT_IMAGE,
  };
}
