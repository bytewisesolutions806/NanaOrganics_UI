"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronRight,
  CircleCheck,
  Heart,
  Leaf,
  Minus,
  PackageCheck,
  PackageOpen,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBasket,
  Star,
  Truck,
} from "lucide-react";

import { HomeProductCard } from "@/components/home/home-product-section";
import { ProductReviews } from "@/features/products/components/product-reviews";
import { toggleWishlistProduct, useWishlist } from "@/features/wishlist/wishlist-store";
import { addItemToCart } from "@/features/cart/cart-store";
import type { StoreAsset, StoreProduct, StoreProductVariant, StorefrontProductDetail } from "@/types/storefront";

function money(amount: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: currencyCode, minimumFractionDigits: 2 }).format(amount / 100);
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
      const parsed = typeof value === "string" ? JSON.parse(value) as unknown : value;
      if (Array.isArray(parsed)) {
        const items = parsed.flatMap((item) => {
          if (typeof item === "string") return [textOnly(item)];
          if (item && typeof item === "object") {
            const record = item as Record<string, unknown>;
            const candidate = record.description ?? record.content ?? record.text ?? record.title;
            return typeof candidate === "string" ? [textOnly(candidate)] : [];
          }
          return [];
        }).filter(Boolean);
        if (items.length) return items;
      }
    } catch {
      // Non-JSON custom fields are handled as natural-language bullet text.
    }
    if (typeof value === "string") {
      const items = value.split(/\r?\n|•|\|/).map(textOnly).filter(Boolean);
      if (items.length) return items;
    }
  }
  const summary = textOnly(fallback);
  return summary ? [summary] : ["A carefully selected organic product made for simple, everyday wellbeing."];
}

function assetUrl(asset?: StoreAsset | null) {
  return asset?.preview || asset?.source || "";
}

function uniqueAssets(assets: Array<StoreAsset | null | undefined>) {
  return [...new Map(assets.filter((asset): asset is StoreAsset => Boolean(asset)).map((asset) => [asset.id || assetUrl(asset), asset])).values()];
}

function variantLabel(variant: StoreProductVariant) {
  return variant.options?.map((option) => option.name).join(" · ") || variant.name;
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
  const defaultVariant = product.variants.find((variant) => variant.id === initialVariantId)
    ?? product.variants.find((variant) => variant.customFields?.isPopular && variant.stockLevel !== "OUT_OF_STOCK")
    ?? product.variants.find((variant) => variant.stockLevel !== "OUT_OF_STOCK")
    ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? "");
  const [quantity, setQuantity] = useState(Math.min(99, Math.max(1, initialQuantity)));
  const [activeImage, setActiveImage] = useState(assetUrl(defaultVariant?.featuredAsset) || assetUrl(product.featuredAsset));
  const [wishlistError, setWishlistError] = useState("");
  const [cartPending, setCartPending] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant;
  const productTitle = selectedProductTitle(product.name, selectedVariant);
  const inStock = selectedVariant?.stockLevel !== "OUT_OF_STOCK";
  const saved = wishlist.productIds.has(String(product.id));
  const saving = wishlist.pendingIds.has(String(product.id));
  const sellingPrice = selectedVariant?.offerPricing?.sellingPrice && selectedVariant.offerPricing.sellingPrice > 0
    ? selectedVariant.offerPricing.sellingPrice
    : selectedVariant?.priceWithTax ?? 0;
  const configuredOriginal = selectedVariant?.offerPricing?.originalPrice ?? 0;
  const originalPrice = configuredOriginal > sellingPrice
    ? configuredOriginal
    : (selectedVariant?.priceWithTax ?? 0) > sellingPrice ? selectedVariant?.priceWithTax ?? 0 : 0;
  const savingPercentage = originalPrice > sellingPrice
    ? selectedVariant?.offerPricing?.offerPercentage || Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
    : 0;
  const images = useMemo(() => uniqueAssets([
    selectedVariant?.featuredAsset,
    ...(selectedVariant?.assets ?? []),
    product.featuredAsset,
    ...product.assets,
    ...product.variants.flatMap((variant) => [variant.featuredAsset, ...(variant.assets ?? [])]),
  ]), [product, selectedVariant]);
  const brand = product.facetValues.find((value) => value.facet.code === "organic-brand" || /brand/i.test(value.facet.name));
  const tags = product.facetValues.filter((value) => value.id !== brand?.id).slice(0, 4);
  const collection = product.collections.at(-1);
  const bullets = aboutItems(product.customFields?.aboutThisItem, product.description);
  const returnWindowDays = Math.max(
    0,
    product.customFields?.returnWindowDays ?? 0,
  );

  function chooseVariant(variant: StoreProductVariant) {
    setSelectedVariantId(variant.id);
    setQuantity(1);
    const image = assetUrl(variant.featuredAsset) || assetUrl(variant.assets?.[0]);
    if (image) setActiveImage(image);
    setCartMessage("");
  }

  async function toggleWishlist() {
    setWishlistError("");
    try {
      await toggleWishlistProduct(product.id);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not update your wishlist.";
      if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) {
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
      setCartMessage(`${quantity} item${quantity === 1 ? "" : "s"} added to your cart · ${order.totalQuantity} total`);
    } catch (reason) {
      setCartMessage(reason instanceof Error ? reason.message : "Could not add this item to your cart.");
    } finally {
      setCartPending(false);
    }
  }

  return (
    <main className="[font-family:var(--font-plus-jakarta-sans)] text-[#26342d]">
      <div className="mx-auto max-w-[1240px] px-5 pb-14 pt-8 sm:px-8 lg:pb-20 lg:pt-11">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#718078] sm:text-sm">
          <Link href={`/?brand=${encodeURIComponent(brandSlug)}`} className="hover:text-[#315f48]">Home</Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          {collection ? <><Link href={`/shop/${collection.slug}?brand=${encodeURIComponent(brandSlug)}`} className="hover:text-[#315f48]">{collection.name}</Link><ChevronRight className="size-3.5" aria-hidden="true" /></> : null}
          <span className="max-w-[20rem] truncate font-medium text-[#34483c]" aria-current="page">{productTitle}</span>
        </nav>

        <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)] lg:gap-16">
          <section aria-label={`${product.name} image gallery`} className="min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[#f3f7f3]">
              {activeImage ? (
                <Image src={activeImage} alt={product.name} fill priority unoptimized sizes="(max-width: 1023px) 92vw, 600px" className="object-contain p-8 sm:p-12" />
              ) : (
                <div className="grid size-full place-items-center text-[#7b9182]"><PackageOpen className="size-20" aria-hidden="true" /></div>
              )}
              {savingPercentage > 0 ? <span className="absolute left-5 top-5 rounded-full bg-[#68bd45] px-4 py-2 text-xs font-bold text-white">SAVE {savingPercentage}%</span> : null}
            </div>
            {images.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.slice(0, 10).map((asset) => {
                  const url = assetUrl(asset);
                  return <button key={asset.id} type="button" onClick={() => setActiveImage(url)} aria-label={`View ${asset.name || product.name} image`} aria-pressed={activeImage === url} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-[#f7f9f7] transition ${activeImage === url ? "border-[#68bd45]" : "border-transparent hover:border-[#b8cbbb]"}`}><Image src={url} alt="" fill unoptimized sizes="110px" className="object-contain p-2" /></button>;
                })}
              </div>
            ) : null}
          </section>

          <section aria-labelledby="product-title" className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {product.customFields?.isVegetarian ? <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8e9] px-3 py-1.5 text-xs font-semibold text-[#4d8f3d]"><Leaf className="size-3.5" aria-hidden="true" />Vegetarian</span> : null}
              {product.customFields?.isOrganic ? <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f7ee] px-3 py-1.5 text-xs font-semibold text-[#527845]"><BadgeCheck className="size-3.5" aria-hidden="true" />Organic</span> : null}
              {inStock ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4d8f3d]"><CircleCheck className="size-3.5" aria-hidden="true" />In stock</span> : <span className="text-xs font-semibold text-red-700">Out of stock</span>}
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                {brand ? <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#67b84d]">{brand.name}</p> : null}
                <h1 id="product-title" className="mt-2 font-serif text-[34px] font-semibold leading-[1.12] tracking-[-0.025em] text-[#242e28] sm:text-[44px]">{productTitle}</h1>
              </div>
              <button type="button" onClick={() => void toggleWishlist()} disabled={saving} aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={saved} className="grid size-12 shrink-0 place-items-center rounded-full border border-[#cbd9cf] text-[#5eb345] transition hover:bg-[#eef8e9] disabled:opacity-60">
                <Heart className={`size-5 ${saved ? "fill-current" : ""}`} aria-hidden="true" />
              </button>
            </div>
            {wishlistError ? <p role="alert" className="mt-2 text-sm text-red-700">{wishlistError}</p> : null}

            <a href="#customer-reviews" className="mt-4 inline-flex items-center gap-2 text-sm text-[#607068] hover:text-[#315f48]">
              <span className="inline-flex gap-0.5 text-[#f2b84b]">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-4 fill-current" aria-hidden="true" />)}</span>
              Read customer reviews
            </a>
            <p className="mt-5 text-[15px] leading-7 text-[#53635a]">{textOnly(product.description) || bullets[0]}</p>
            {tags.length ? <div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag.id} className="rounded-full border border-[#d9e5dc] px-3 py-1.5 text-xs text-[#607068]">{tag.name}</span>)}</div> : null}

            <div className="mt-7 border-y border-[#dbe6dd] py-6">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <strong className="font-serif text-4xl font-semibold text-[#63b84a]">{money(sellingPrice, selectedVariant?.currencyCode || "INR")}</strong>
                {originalPrice > sellingPrice ? <span className="pb-1 text-sm text-[#9aa49e] line-through">{money(originalPrice, selectedVariant?.currencyCode || "INR")}</span> : null}
                {savingPercentage > 0 ? <span className="mb-1 rounded-full bg-[#68bd45] px-3 py-1 text-xs font-semibold text-white">Save {savingPercentage}%</span> : null}
              </div>
              <p className="mt-1 text-xs text-[#7c8881]">Inclusive of all taxes</p>

              {product.variants.length > 1 ? (
                <fieldset className="mt-6">
                  <legend className="text-sm font-semibold text-[#34483c]">Choose an option</legend>
                  <div
                    role="group"
                    aria-label="Choose a product option"
                    className="mt-3 flex flex-wrap gap-2 border-b border-[#dbe6dd]"
                  >
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        aria-pressed={selectedVariant?.id === variant.id}
                        disabled={variant.stockLevel === "OUT_OF_STOCK"}
                        onClick={() => chooseVariant(variant)}
                        className={`min-h-12 border-b-2 px-4 py-2 text-base font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5D43] disabled:cursor-not-allowed disabled:opacity-45 sm:px-6 sm:text-lg ${
                          selectedVariant?.id === variant.id
                            ? "border-[#2C5D43] text-[#2C5D43]"
                            : "border-transparent text-[#66756c] hover:border-[#9db5a3] hover:text-[#2C5D43]"
                        }`}
                      >
                        {variantLabel(variant)}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ) : selectedVariant ? <p className="mt-5 text-sm"><span className="font-semibold">Option:</span> {variantLabel(selectedVariant)}</p> : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex h-13 items-center justify-between rounded-lg border border-[#cbd9cf] px-2 sm:w-36">
                  <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity === 1} aria-label="Decrease quantity" className="grid size-9 place-items-center rounded-md text-[#315f48] hover:bg-[#f1f7f2] disabled:opacity-40"><Minus className="size-4" aria-hidden="true" /></button>
                  <output className="font-semibold tabular-nums" aria-live="polite">{quantity}</output>
                  <button type="button" onClick={() => setQuantity((current) => Math.min(99, current + 1))} disabled={quantity === 99} aria-label="Increase quantity" className="grid size-9 place-items-center rounded-md text-[#315f48] hover:bg-[#f1f7f2] disabled:opacity-40"><Plus className="size-4" aria-hidden="true" /></button>
                </div>
                <button type="button" onClick={() => void addToCart()} disabled={!inStock || !selectedVariant || cartPending} className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-lg bg-[#2C5D43] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(44,93,67,0.2)] transition hover:bg-[#244f3b] disabled:cursor-not-allowed disabled:bg-[#9aa9a0]">
                  <ShoppingBasket className="size-5" aria-hidden="true" />{cartPending ? "Adding…" : inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
              {cartMessage ? <p role="status" className={`mt-3 text-sm ${/could not|error|failed/i.test(cartMessage) ? "text-red-700" : "text-[#4d8f3d]"}`}>{cartMessage}</p> : null}
            </div>

            <div className="grid gap-4 py-6 sm:grid-cols-3">
              {[{ icon: Truck, title: "Free delivery", text: "On eligible orders" }, { icon: ShieldCheck, title: "Secure payment", text: "Protected checkout" }, { icon: RotateCcw, title: returnWindowDays > 0 ? "Easy returns" : "No returns", text: returnWindowDays > 0 ? `${returnWindowDays}-day returns` : "No refunds" }].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eef7ed] text-[#5eae47]"><Icon className="size-5" aria-hidden="true" /></span><span><strong className="block text-xs text-[#34483c]">{title}</strong><small className="text-[11px] text-[#7c8881]">{text}</small></span></div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#f4f8f4] p-6">
              <h2 className="font-serif text-2xl font-semibold">About this item</h2>
              <ul className="mt-4 space-y-3">
                {bullets.slice(0, 6).map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#53635a]"><CircleCheck className="mt-1 size-4 shrink-0 text-[#68bd45]" aria-hidden="true" />{item}</li>)}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <section className="bg-[#2d6048] px-5 py-10 text-white sm:px-8" aria-label="Nana Organics product promise">
        <div className="mx-auto grid max-w-[1100px] gap-7 sm:grid-cols-3">
          {[{ icon: PackageCheck, value: "Quality checked", text: "Carefully sourced products" }, { icon: Leaf, value: "Organic choices", text: "Better everyday ingredients" }, { icon: ShieldCheck, value: "Shop confidently", text: "Secure support and checkout" }].map(({ icon: Icon, value, text }) => (
            <div key={value} className="flex items-center justify-center gap-4 text-center sm:flex-col"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/12"><Icon className="size-6" aria-hidden="true" /></span><div><strong className="block font-serif text-xl">{value}</strong><span className="mt-1 block text-xs text-white/75">{text}</span></div></div>
          ))}
        </div>
      </section>

      <ProductReviews productId={product.id} />

      {relatedProducts.length ? (
        <section className="bg-[#f2f7f3] px-5 py-14 sm:px-8 lg:py-20" aria-labelledby="related-products-title">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex items-end justify-between gap-5">
              <div><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#67b84d]">You may also like</p><h2 id="related-products-title" className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">Related Products</h2></div>
              {collection ? <Link href={`/shop/${collection.slug}?brand=${encodeURIComponent(brandSlug)}`} className="hidden items-center gap-1 text-sm font-semibold text-[#315f48] hover:text-[#68bd45] sm:inline-flex">Browse all <ChevronRight className="size-4" aria-hidden="true" /></Link> : null}
            </div>
            <div className="mt-9 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => <HomeProductCard key={related.id} product={related} brandSlug={brandSlug} />)}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
