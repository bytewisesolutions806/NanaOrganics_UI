/**
 * Maps one row from GET /wishlist to WishlistItem UI props.
 */
export function mapWishlistApiRow(row) {
  const p = row?.product;
  if (!p) return null;

  const min = p.price_range?.min;
  const price =
    typeof min === "number" && !Number.isNaN(min) ? min : 0;

  const disc = Number(p.discount_percentage) || 0;
  let originalPrice = price;
  if (disc > 0 && disc < 100) {
    originalPrice = Math.round((price / (1 - disc / 100)) * 100) / 100;
  }

  const v0 = p.variants?.[0];
  const weight = v0?.title || v0?.sku || "";

  const thumb = p.thumbnail || "/AppLogo.png";

  return {
    id: row.product_id,
    product_id: row.product_id,
    name: p.title || "",
    weight,
    price,
    originalPrice,
    discount: Math.round(disc),
    image: thumb,
  };
}
