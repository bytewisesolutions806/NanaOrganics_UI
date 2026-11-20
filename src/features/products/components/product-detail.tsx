"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Heart,
  Minus,
  PackageOpen,
  Plus,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

import { HomeProductCard } from "@/components/home/home-product-section";
import { ProductHighlights } from "@/features/products/components/product-highlights";
import {
  ProductReviews,
  type ProductReviewSummary,
} from "@/features/products/components/product-reviews";
import {
  toggleWishlistProduct,
  useWishlist,
} from "@/features/wishlist/wishlist-store";
import { addItemToCart } from "@/features/cart/cart-store";
import type {
  StoreAsset,
  StoreProduct,
  StoreProductVariant,
  StorefrontProductDetail,
} from "@/types/storefront";

function money(amount: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  } catch {
    return `${currencyCode} ${(amount / 100).toFixed(2)}`;
  }
}

function textOnly(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function aboutItems(value: unknown, fallback?: string | null) {
  if (value) {
    try {
      const parsed =
        typeof value === "string" ? (JSON.parse(value) as unknown) : value;
      if (Array.isArray(parsed)) {
        const items = parsed
          .flatMap((item) => {
            if (typeof item === "string") return [textOnly(item)];
            if (item && typeof item === "object") {
              const record = item as Record<string, unknown>;
              const candidate =
                record.description ??
                record.content ??
                record.text ??
                record.title;
              return typeof candidate === "string" ? [textOnly(candidate)] : [];
            }
            return [];
          })
          .filter(Boolean);
        if (items.length) return items;
      }
    } catch {
      // Non-JSON custom fields are handled as natural-language bullet text.
    }
    if (typeof value === "string") {
      const items = value
        .split(/\r?\n|•|\|/)
        .map(textOnly)
        .filter(Boolean);
      if (items.length) return items;
    }
  }
  const summary = textOnly(fallback);
  return summary
    ? [summary]
    : [
        "A carefully selected organic product made for simple, everyday wellbeing.",
      ];
}

function AboutItem({ text }: { text: string }) {
  const match = text.match(/^(.+?)\s+[-–—]\s+(.+)$/);

  if (!match) return <>{text}</>;

  return (
    <>
      <strong className="font-semibold text-[#242b32]">{match[1]}</strong>
      {" – "}
      {match[2]}
    </>
  );
}

function assetUrl(asset?: StoreAsset | null) {
  return asset?.preview || asset?.source || "";
}

function uniqueAssets(assets: Array<StoreAsset | null | undefined>) {
  return [
    ...new Map(
      assets
        .filter((asset): asset is StoreAsset => Boolean(asset))
        .map((asset) => [asset.id || assetUrl(asset), asset]),
    ).values(),
  ];
}

function variantLabel(variant: StoreProductVariant) {
  return (
    variant.options?.map((option) => option.name).join(" · ") || variant.name
  );
}

function selectedProductTitle(
  productName: string,
  variant?: StoreProductVariant,
) {
  if (!variant) return productName;

  const label = variantLabel(variant).trim();
  if (!label || /^default$/i.test(label) || label === productName) {
    return productName;
  }

  return `${productName} - ${label}`;
}

export function ProductDetail({
  product,
  relatedProducts,
  brandSlug,
  initialVariantId,
  initialQuantity,
}: {
  product: StorefrontProductDetail;
  relatedProducts: StoreProduct[];
  brandSlug: string;
  initialVariantId?: string;
  initialQuantity: number;
}) {
  const router = useRouter();
  const wishlist = useWishlist();
  const defaultVariant =
    product.variants.find((variant) => variant.id === initialVariantId) ??
    product.variants.find(
      (variant) =>
        variant.customFields?.isPopular &&
        variant.stockLevel !== "OUT_OF_STOCK",
    ) ??
    product.variants.find((variant) => variant.stockLevel !== "OUT_OF_STOCK") ??
    product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? "",
  );
  const [quantity, setQuantity] = useState(
    Math.min(99, Math.max(1, initialQuantity)),
  );
  const [activeImage, setActiveImage] = useState(
    assetUrl(defaultVariant?.featuredAsset) || assetUrl(product.featuredAsset),
  );
  const [wishlistError, setWishlistError] = useState("");
  const [cartPending, setCartPending] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [reviewSummary, setReviewSummary] =
    useState<ProductReviewSummary | null>(null);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    defaultVariant;
  const productTitle = selectedProductTitle(product.name, selectedVariant);
  const inStock = !!selectedVariant && selectedVariant.stockLevel !== "OUT_OF_STOCK";
  const saved = wishlist.productIds.has(String(product.id));
  const saving = wishlist.pendingIds.has(String(product.id));
  const sellingPrice =
    selectedVariant?.offerPricing?.sellingPrice &&
    selectedVariant.offerPricing.sellingPrice > 0
      ? selectedVariant.offerPricing.sellingPrice
      : (selectedVariant?.priceWithTax ?? 0);
  const configuredOriginal = selectedVariant?.offerPricing?.originalPrice ?? 0;
  const originalPrice =
    configuredOriginal > sellingPrice
      ? configuredOriginal
      : (selectedVariant?.priceWithTax ?? 0) > sellingPrice
        ? (selectedVariant?.priceWithTax ?? 0)
        : 0;
  const savingPercentage =
    originalPrice > sellingPrice
      ? selectedVariant?.offerPricing?.offerPercentage ||
        Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;
  const images = useMemo(
    () =>
      uniqueAssets([
        selectedVariant?.featuredAsset,
        ...(selectedVariant?.assets ?? []),
        product.featuredAsset,
        ...product.assets,
        ...product.variants.flatMap((variant) => [
          variant.featuredAsset,
          ...(variant.assets ?? []),
        ]),
      ]),
    [product, selectedVariant],
  );
  const brandFacet = product.facetValues.find(
    (value) =>
      value.facet.code === "organic-brand" || /brand/i.test(value.facet.name),
  );
  const tags = product.facetValues
    .filter((value) => value.id !== brandFacet?.id)
    .slice(0, 4);
  const brandName = product.customFields?.brand?.name || brandFacet?.name;
  const currentReviewSummary =
    reviewSummary?.productId === product.id ? reviewSummary : null;
  const collection = product.collections.at(-1);
  const bullets = aboutItems(
    product.customFields?.aboutThisItem,
    product.description,
  );
  const returnWindowDays = Math.max(
    0,
    product.customFields?.returnWindowDays ?? 0,
  );

  function chooseVariant(variant: StoreProductVariant) {
    setSelectedVariantId(variant.id);
    setQuantity(1);
    const image =
      assetUrl(variant.featuredAsset) || assetUrl(variant.assets?.[0]);
    if (image) setActiveImage(image);
    setCartMessage("");
  }

  async function toggleWishlist() {
    setWishlistError("");
    try {
      await toggleWishlistProduct(product.id);
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Could not update your wishlist.";
      if (
        /not (?:currently )?authorized|unauthorized|session|login/i.test(
          message,
        )
      ) {
        router.push("/login");
        return;
      }
      setWishlistError(message);
    }
  }

  async function addToCart() {
    if (!selectedVariant || !inStock) return;
    setCartPending(true);
    setCartMessage("");
    try {
      const order = await addItemToCart(selectedVariant.id, quantity);
      setCartMessage(
        `${quantity} item${quantity === 1 ? "" : "s"} added to your cart · ${order.totalQuantity} total`,
      );
    } catch (reason) {
      setCartMessage(
        reason instanceof Error
          ? reason.message
          : "Could not add this item to your cart.",
      );
    } finally {
      setCartPending(false);
    }
  }

  return (
    <main className="[font-family:var(--font-plus-jakarta-sans)] text-[#26342d]">
      <div className="mx-auto max-w-[1240px] px-5 pb-14 pt-8 sm:px-8 lg:pb-20 lg:pt-11">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-[#718078] sm:text-sm"
        >
          <Link
            href={`/?brand=${encodeURIComponent(brandSlug)}`}
            className="hover:text-[#315f48]"
          >
            Home
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          {collection ? (
            <>
              <Link
                href={`/shop/${collection.slug}?brand=${encodeURIComponent(brandSlug)}`}
                className="hover:text-[#315f48]"
              >
                {collection.name}
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </>
          ) : null}
          <span
            className="max-w-[20rem] truncate font-medium text-[#34483c]"
            aria-current="page"
          >
            {productTitle}
          </span>
        </nav>

        <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)] lg:gap-16">
          <section
            aria-label={`${product.name} image gallery`}
            className="min-w-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[#f3f7f3]">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1023px) 92vw, 600px"
                  className="object-contain p-8 sm:p-12"
                />
              ) : (
                <div className="grid size-full place-items-center text-[#7b9182]">
                  <PackageOpen className="size-20" aria-hidden="true" />
                </div>
              )}
              {savingPercentage > 0 ? (
                <span className="absolute left-5 top-5 rounded-full bg-[#68bd45] px-4 py-2 text-xs font-bold text-white">
                  SAVE {savingPercentage}%
                </span>
              ) : null}
            </div>
            {images.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.slice(0, 10).map((asset) => {
                  const url = assetUrl(asset);
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setActiveImage(url)}
                      aria-label={`View ${asset.name || product.name} image`}
                      aria-pressed={activeImage === url}
                      className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-[#f7f9f7] transition ${activeImage === url ? "border-[#68bd45]" : "border-transparent hover:border-[#b8cbbb]"}`}
                    >
                      <Image
                        src={url}
                        alt=""
                        fill
                        unoptimized
                        sizes="110px"
                        className="object-contain p-2"
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>

          <section aria-labelledby="product-title" className="min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-h-10 flex-wrap items-center gap-2 text-sm text-[#242b32]">
                {product.customFields?.isVegetarian ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded border-2 border-[#68bd45]" aria-hidden="true">
                      <span className="size-2.5 rounded-full bg-[#68bd45]" />
                    </span>
                    This is a Vegetarian product
                  </span>
                ) : null}
                {product.customFields?.isOrganic ? (
                  <span className="rounded-full bg-[#68bd45] px-2 py-1 text-xs font-semibold leading-none text-white">
                    Organic
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void toggleWishlist()}
                disabled={saving}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={saved}
                className="grid size-10 shrink-0 place-items-center rounded-md border border-[#2c5d43] text-[#2c5d43] transition hover:bg-[#eef8e9] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43]"
              >
                <Heart
                  className={`size-5 ${saved ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </div>
            <h1
              id="product-title"
              className="mt-3 font-serif text-[34px] font-semibold leading-[1.12] tracking-[-0.025em] text-[#242b32] sm:text-[44px]"
            >
              {productTitle}
            </h1>
            <p className={`mt-4 flex items-center gap-2 text-sm font-semibold ${inStock ? "text-[#34483c]" : "text-red-700"}`}>
              <span className={`size-1.5 rounded-full ${inStock ? "bg-[#68bd45]" : "bg-red-700"}`} aria-hidden="true" />
              {inStock ? "In stock" : "Out of stock"}
            </p>
            {wishlistError ? (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {wishlistError}
              </p>
            ) : null}

            {tags.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-md border border-[#d9e5dc] px-2.5 py-1.5 text-sm text-[#34483c]"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6 text-base text-[#59616d]">
              <div className="flex items-center justify-between gap-3">
                {product.customFields?.isOrganic ? <p>Item form: <strong className="text-[#34483c]">Organic</strong></p> : <span />}
                <a href="#about-this-item" className="font-semibold text-[#2c5d43] underline underline-offset-2">More Details</a>
              </div>
              <dl className="mt-3 grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm text-[#242b32] sm:grid-cols-[7rem_minmax(0,1fr)]">
                {brandName ? <><dt className="font-semibold">Brand</dt><dd>{brandName}</dd></> : null}
                {selectedVariant ? <><dt className="font-semibold">Option</dt><dd>{variantLabel(selectedVariant)}</dd></> : null}
                {product.customFields?.isOrganic ? <><dt className="font-semibold">Item Form</dt><dd>Organic</dd></> : null}
                {product.customFields?.isVegetarian ? <><dt className="font-semibold">Diet Type</dt><dd>Vegetarian</dd></> : null}
              </dl>
            </div>

            <div className="mt-6 border-t border-[#dbe6dd] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-[#2c5d43]">
                  {currentReviewSummary && currentReviewSummary.totalReviewCount > 0 ? (
                    <>
                      <span className="inline-flex gap-0.5" aria-label={`${currentReviewSummary.averageRating.toFixed(1)} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={index} className="grid size-5 place-items-center rounded-sm bg-[#2c5d43]">
                            <Star className={`size-3.5 text-white ${index < Math.round(currentReviewSummary.averageRating) ? "fill-white" : ""}`} aria-hidden="true" />
                          </span>
                        ))}
                      </span>
                      <span>{currentReviewSummary.totalReviewCount} {currentReviewSummary.totalReviewCount === 1 ? "review" : "reviews"}</span>
                    </>
                  ) : <span>{currentReviewSummary ? "No reviews yet" : "Customer reviews"}</span>}
                </div>
                <a href="#customer-reviews" className="text-base font-semibold text-[#2c5d43] underline underline-offset-2">Read Reviews</a>
              </div>
              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  {selectedVariant ? (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <strong className="text-3xl font-medium text-[#242b32]">{money(sellingPrice, selectedVariant.currencyCode)}</strong>
                      {originalPrice > sellingPrice ? <span className="text-base text-[#9aa49e] line-through">{money(originalPrice, selectedVariant.currencyCode)}</span> : null}
                      {savingPercentage > 0 ? <span className="rounded-full bg-[#68bd45] px-2 py-0.5 text-xs font-semibold text-white">Save {savingPercentage}%</span> : null}
                    </div>
                  ) : null}
                  <p className="mt-1 text-sm text-[#7c8881]">Inclusive of all taxes</p>
                </div>
                <div>
                  <p className="mb-2 text-sm text-[#242b32]">Quantity</p>
                  <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    disabled={quantity === 1}
                    aria-label="Decrease quantity"
                    className="grid size-8 place-items-center rounded-full border border-[#2c5d43] text-[#315f48] hover:bg-[#f1f7f2] disabled:opacity-40"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <output
                    className="font-semibold tabular-nums"
                    aria-live="polite"
                  >
                    {quantity}
                  </output>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.min(99, current + 1))
                    }
                    disabled={quantity === 99}
                    aria-label="Increase quantity"
                    className="grid size-8 place-items-center rounded-full border border-[#2c5d43] text-[#315f48] hover:bg-[#f1f7f2] disabled:opacity-40"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-[#34483c]">
                <p className="flex items-center gap-2"><Truck className="size-5 text-[#2c5d43]" aria-hidden="true" />Free delivery on eligible orders</p>
                <p className="flex items-center gap-2"><ShieldCheck className="size-5 text-[#2c5d43]" aria-hidden="true" />Secure payment</p>
                {product.customFields?.guaranteeClaimValue?.trim() && product.customFields?.guaranteeClaimLabel?.trim() ? (
                  <p className="flex items-center gap-2"><ShieldCheck className="size-5 text-[#2c5d43]" aria-hidden="true" />{product.customFields.guaranteeClaimValue} {product.customFields.guaranteeClaimLabel}</p>
                ) : null}
                <p className="flex items-center gap-2"><RotateCcw className="size-5 text-[#2c5d43]" aria-hidden="true" />{returnWindowDays > 0 ? `Returns accepted within ${returnWindowDays} days` : "No returns or refunds"}</p>
              </div>

              {product.variants.length > 1 ? (
                <fieldset className="mt-6">
                  <legend className="text-base text-[#59616d]">
                    Option: <span className="font-semibold text-[#34483c]">{selectedVariant ? variantLabel(selectedVariant) : ""}</span>
                  </legend>
                  <div className="mt-3 space-y-2">
                    {product.variants.map((variant) => {
                      const variantPrice = variant.offerPricing?.sellingPrice && variant.offerPricing.sellingPrice > 0 ? variant.offerPricing.sellingPrice : variant.priceWithTax;
                      const variantOriginal = variant.offerPricing?.originalPrice ?? 0;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          aria-pressed={selectedVariant?.id === variant.id}
                          disabled={variant.stockLevel === "OUT_OF_STOCK"}
                          onClick={() => chooseVariant(variant)}
                          className={`relative flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43] disabled:cursor-not-allowed disabled:opacity-45 ${selectedVariant?.id === variant.id ? "border-[#68bd45] shadow-sm" : "border-[#dbe6dd] hover:border-[#9db5a3]"}`}
                        >
                          <span className="grid size-5 shrink-0 place-items-center rounded-full border border-[#2c5d43]" aria-hidden="true">{selectedVariant?.id === variant.id ? <span className="size-3 rounded-full bg-[#2c5d43]" /> : null}</span>
                          <span className="min-w-0 flex-1 text-base font-semibold text-[#242b32]">{variantLabel(variant)}</span>
                          <span className="shrink-0 text-right">
                            <strong className="block text-lg text-[#242b32]">{money(variantPrice, variant.currencyCode)}</strong>
                            {variantOriginal > variantPrice ? <span className="block text-sm text-[#718078] line-through">{money(variantOriginal, variant.currencyCode)}</span> : null}
                          </span>
                          {variant.customFields?.isPopular ? <span className="absolute -top-2 right-3 rounded bg-[#68bd45] px-2 py-0.5 text-xs font-medium text-white">Most Popular</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ) : selectedVariant ? (
                <p className="mt-5 text-base"><span className="font-semibold">Option:</span> {variantLabel(selectedVariant)}</p>
              ) : null}

                <button
                  type="button"
                  onClick={() => void addToCart()}
                  disabled={!inStock || !selectedVariant || cartPending}
                  className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-lg bg-[#2C5D43] px-6 text-base font-semibold text-white shadow-[0_8px_20px_rgba(44,93,67,0.2)] transition hover:bg-[#244f3b] disabled:cursor-not-allowed disabled:bg-[#9aa9a0]"
                >
                  {cartPending
                    ? "Adding…"
                    : inStock
                      ? "Add to Cart"
                      : "Out of Stock"}
                </button>
              {cartMessage ? (
                <p
                  role="status"
                  className={`mt-3 text-sm ${/could not|error|failed/i.test(cartMessage) ? "text-red-700" : "text-[#4d8f3d]"}`}
                >
                  {cartMessage}
                </p>
              ) : null}
            </div>

            <div id="about-this-item" className="scroll-mt-40 py-6">
              {textOnly(product.description) ? (
                <p className="mb-5 text-sm leading-6 text-[#53635a]">
                  {textOnly(product.description)}
                </p>
              ) : null}
              <h2 className="text-base font-semibold text-[#242b32]">
                About this item
              </h2>
              <ul className="mt-2 space-y-2">
                {bullets.slice(0, 6).map((item, index) => (
                  <li
                    key={`${index}-${item}`}
                    className="text-sm leading-5 text-[#59616d]"
                  >
                    <AboutItem text={item} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <ProductHighlights product={product} reviewSummary={reviewSummary} />

      {/* <section className="bg-[#2d6048] px-5 py-10 text-white sm:px-8" aria-label="Nana Organics product promise">
        <div className="mx-auto grid max-w-[1100px] gap-7 sm:grid-cols-3">
          {[{ icon: PackageCheck, value: "Quality checked", text: "Carefully sourced products" }, { icon: Leaf, value: "Organic choices", text: "Better everyday ingredients" }, { icon: ShieldCheck, value: "Shop confidently", text: "Secure support and checkout" }].map(({ icon: Icon, value, text }) => (
            <div key={value} className="flex items-center justify-center gap-4 text-center sm:flex-col"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/12"><Icon className="size-6" aria-hidden="true" /></span><div><strong className="block font-serif text-xl">{value}</strong><span className="mt-1 block text-xs text-white/75">{text}</span></div></div>
          ))}
        </div>
      </section> */}

      <ProductReviews
        productId={product.id}
        onSummaryChange={setReviewSummary}
      />

      {relatedProducts.length ? (
        <section
          className="bg-[#f2f7f3] px-5 py-14 sm:px-8 lg:py-20"
          aria-labelledby="related-products-title"
        >
          <div className="mx-auto max-w-[1240px]">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#67b84d]">
                  You may also like
                </p>
                <h2
                  id="related-products-title"
                  className="mt-2 font-serif text-3xl font-semibold sm:text-4xl"
                >
                  Related Products
                </h2>
              </div>
              {collection ? (
                <Link
                  href={`/shop/${collection.slug}?brand=${encodeURIComponent(brandSlug)}`}
                  className="hidden items-center gap-1 text-sm font-semibold text-[#315f48] hover:text-[#68bd45] sm:inline-flex"
                >
                  Browse all{" "}
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <HomeProductCard
                  key={related.id}
                  product={related}
                  brandSlug={brandSlug}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
