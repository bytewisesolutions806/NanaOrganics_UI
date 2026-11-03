"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  PackageOpen,
  Plus,
} from "lucide-react";

import type {
  HomepageProductSection,
  StoreProduct,
  StoreProductVariant,
} from "@/types/storefront";
import {
  toggleWishlistProduct,
  useWishlist,
} from "@/features/wishlist/wishlist-store";
import { addItemToCart } from "@/features/cart/cart-store";

function getVariantWeight(name: string) {
  const match = name.match(
    /(?:^|[^a-z0-9])(\d+(?:[.,]\d+)?)[\s_-]*(kilograms?|kgs?|kg|milligrams?|mgs?|mg|grams?|gms?|grms?|gm|grm|g|milliliters?|millilitres?|ml|centiliters?|centilitres?|cl|liters?|litres?|l|ounces?|oz|pounds?|lbs?|lb|pieces?|pcs?|pc)(?=$|[^a-z])/i,
  );

  if (!match) return "";

  const amount = match[1].replace(",", ".");
  const rawUnit = match[2].toLowerCase();
  const unit = /^(kilograms?|kgs?|kg)$/.test(rawUnit)
    ? "kg"
    : /^(milligrams?|mgs?|mg)$/.test(rawUnit)
      ? "mg"
      : /^(grams?|gms?|grms?|gm|grm|g)$/.test(rawUnit)
        ? "g"
        : /^(milliliters?|millilitres?|ml)$/.test(rawUnit)
          ? "ml"
          : /^(centiliters?|centilitres?|cl)$/.test(rawUnit)
            ? "cl"
            : /^(liters?|litres?|l)$/.test(rawUnit)
              ? "l"
              : /^(ounces?|oz)$/.test(rawUnit)
                ? "oz"
                : /^(pounds?|lbs?|lb)$/.test(rawUnit)
                  ? "lb"
                  : "pcs";

  return `${amount}${unit}`;
}

function getProductSummary(description?: string | null) {
  if (!description) return "Botanical care • Everyday ritual";

  const summary = description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  return summary || "Botanical care • Everyday ritual";
}

function formatPriceParts(amount: number, currencyCode: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).formatToParts(amount / 100);
  } catch {
    return [
      { type: "currency", value: currencyCode },
      { type: "literal", value: " " },
      { type: "fraction", value: (amount / 100).toFixed(2) },
    ];
  }
}

function Price({
  amount,
  currencyCode,
  muted = false,
}: {
  amount: number;
  currencyCode: string;
  muted?: boolean;
}) {
  return (
    <>
      {formatPriceParts(amount, currencyCode).map((part, index) => (
        <span
          key={`${part.type}-${index}`}
          className={
            part.type === "currency"
              ? muted
                ? "text-[0.58em] text-[#999da0]"
                : "text-[0.58em] text-[#63b84a]"
              : undefined
          }
        >
          {part.value}
        </span>
      ))}
    </>
  );
}

function getProductHref(
  product: StoreProduct,
  brandSlug: string,
  variant?: StoreProductVariant,
  quantity?: number,
) {
  const query = `brand=${encodeURIComponent(brandSlug)}${
    variant ? `&variant=${encodeURIComponent(variant.id)}` : ""
  }${quantity ? `&quantity=${quantity}` : ""}`;

  return `/products/${product.slug}?${query}`;
}

export function HomeProductCard({
  product,
  brandSlug,
}: {
  product: StoreProduct;
  brandSlug: string;
}) {
  const router = useRouter();
  const wishlist = useWishlist();
  const variantsWithWeight = product.variants
    .map((variant) => ({ variant, weight: getVariantWeight(variant.name) }))
    .filter((entry) => entry.weight);
  const defaultVariant =
    product.variants.find(
      (variant) =>
        variant.customFields?.isPopular &&
        variant.stockLevel !== "OUT_OF_STOCK",
    ) ??
    product.variants.find((variant) => variant.customFields?.isPopular) ??
    variantsWithWeight.find((entry) => entry.weight === "500g")?.variant ??
    variantsWithWeight[0]?.variant ??
    product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [wishlistError, setWishlistError] = useState("");
  const [cartPending, setCartPending] = useState(false);
  const [cartMessage, setCartMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const isSaved = wishlist.productIds.has(String(product.id));
  const wishlistPending = wishlist.pendingIds.has(String(product.id));
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0];
  const inStock = selectedVariant?.stockLevel !== "OUT_OF_STOCK";
  const image = product.featuredAsset?.preview ?? product.featuredAsset?.source;
  const basePrice = selectedVariant?.priceWithTax;
  const configuredSellingPrice = selectedVariant?.offerPricing?.sellingPrice;
  const sellingPrice =
    configuredSellingPrice !== null &&
    configuredSellingPrice !== undefined &&
    configuredSellingPrice > 0
      ? configuredSellingPrice
      : basePrice;
  const configuredOriginalPrice = selectedVariant?.offerPricing?.originalPrice;
  const originalPrice =
    configuredOriginalPrice !== null &&
    configuredOriginalPrice !== undefined &&
    sellingPrice !== undefined &&
    configuredOriginalPrice > sellingPrice
      ? configuredOriginalPrice
      : basePrice !== undefined &&
          sellingPrice !== undefined &&
          basePrice > sellingPrice
        ? basePrice
        : null;
  const calculatedOfferPercentage =
    originalPrice && sellingPrice
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;
  const configuredOfferPercentage =
    selectedVariant?.offerPricing?.offerPercentage ?? 0;
  const offerPercentage =
    originalPrice && originalPrice > (sellingPrice ?? originalPrice)
      ? configuredOfferPercentage > 0
        ? configuredOfferPercentage
        : calculatedOfferPercentage
      : 0;
  const selectedWeight = selectedVariant
    ? getVariantWeight(selectedVariant.name)
    : "";
  const productTitle = selectedWeight
    ? `${product.name} - ${selectedWeight.replace(/^(\d+(?:\.\d+)?)([a-z]+)$/i, "$1 $2")}`
    : product.name;
  const productSummary = getProductSummary(product.description);

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setCartMessage(null);
  }

  async function addToCart() {
    if (!selectedVariant || !inStock || cartPending) return;

    setCartPending(true);
    setCartMessage(null);
    try {
      const order = await addItemToCart(selectedVariant.id, quantity);
      setCartMessage({
        text: `${quantity} item${quantity === 1 ? "" : "s"} added to your cart · ${order.totalQuantity} total`,
        isError: false,
      });
    } catch (error) {
      setCartMessage({
        text:
          error instanceof Error
            ? error.message
            : "Could not add this item to your cart.",
        isError: true,
      });
    } finally {
      setCartPending(false);
    }
  }

  async function toggleWishlist() {
    setWishlistError("");
    try {
      await toggleWishlistProduct(product.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update your wishlist.";
      if (/not (?:currently )?authorized|unauthorized|session|login/i.test(message)) {
        router.push("/login");
        return;
      }
      setWishlistError(message);
    }
  }

  return (
    <article className="relative flex min-h-[510px] w-full max-w-[304px] flex-col overflow-visible rounded-[12px] border border-[#cfded6] bg-white px-[27px] pb-5 shadow-[0_8px_24px_rgba(35,75,52,0.05)] [font-family:var(--font-plus-jakarta-sans)]">
      <div className="relative h-[250px] shrink-0 bg-white">
        {selectedWeight ? (
          <div className="absolute left-[-27px] top-5 z-20 h-10 w-[94px]">
            <span
              aria-hidden="true"
              className="absolute -top-3 left-0 -z-10 h-3 w-3 bg-[#2f7b32] [clip-path:polygon(0_100%,100%_0,100%_100%)]"
            />
            <span className="flex h-full w-full items-center bg-[#69BD45] pl-4 pr-7 text-[15px] font-medium leading-none text-white [clip-path:polygon(0_0,100%_0,86%_50%,100%_100%,0_100%)] [font-family:var(--font-plus-jakarta-sans)]">
              {selectedWeight}
            </span>
          </div>
        ) : null}
        <Link
          href={getProductHref(product, brandSlug, selectedVariant)}
          aria-label={`View ${product.name}`}
          className="absolute inset-0"
        >
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 639px) 250px, (max-width: 1023px) 260px, 280px"
              className="object-contain pt-10 transition duration-500 hover:scale-[1.04]"
            />
          ) : (
            <div className="grid size-full place-items-center pt-10 text-[#719078]">
              <PackageOpen className="size-12" aria-hidden="true" />
            </div>
          )}
        </Link>
      </div>

      <button
        type="button"
        aria-label={
          isSaved
            ? `Remove ${product.name} from wishlist`
            : `Add ${product.name} to wishlist`
        }
        aria-pressed={isSaved}
        disabled={wishlistPending}
        onClick={() => void toggleWishlist()}
        className="absolute right-4 top-5 z-20 grid size-8 place-items-center rounded-full bg-white text-[#65b94c] transition hover:bg-[#f1f8ed] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#65b94c]"
      >
        <Heart
          className={`size-[17px] ${isSaved ? "fill-current" : ""}`}
          aria-hidden="true"
        />
      </button>

      {wishlistError ? (
        <p role="alert" className="absolute right-3 top-14 z-30 max-w-48 rounded-md bg-red-50 px-2 py-1 text-right text-[10px] leading-4 text-red-700 shadow-sm">
          {wishlistError}
        </p>
      ) : null}

      <div className="flex flex-1 flex-col">
        <Link
          href={getProductHref(product, brandSlug, selectedVariant)}
          className="line-clamp-2 h-[58px] shrink-0 text-[24px] font-medium leading-[29px] tracking-[-0.025em] text-[#242b32] hover:text-[#315f48]"
        >
          {productTitle}
        </Link>
        <p
          title={productSummary}
          className="mt-1 h-[18px] shrink-0 truncate text-[11px] leading-[18px] text-[#3f4844]"
        >
          {productSummary}
        </p>

        {selectedVariant && sellingPrice !== undefined ? (
          <div className="mt-2.5 flex min-h-8 shrink-0 items-center gap-2 whitespace-nowrap">
            <span className="text-[26px] leading-8 text-[#293139]">
              <Price
                amount={sellingPrice}
                currencyCode={selectedVariant.currencyCode}
              />
            </span>
            {originalPrice !== null &&
            originalPrice !== undefined &&
            originalPrice > sellingPrice ? (
              <>
                <span className="text-[12px] text-[#9a9da0] line-through">
                  <Price
                    amount={originalPrice}
                    currencyCode={selectedVariant.currencyCode}
                    muted
                  />
                </span>
                {offerPercentage > 0 ? (
                  <span className="rounded-full bg-[#68bd45] px-4 py-1.5 text-[10px] font-medium leading-[10px] text-white">
                    Save {offerPercentage}%
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
        ) : (
          <div className="mt-2.5 min-h-8 shrink-0" />
        )}

        {variantsWithWeight.length > 0 ? (
          <div className="relative mt-2.5 shrink-0">
            <select
              value={selectedVariant?.id ?? ""}
              onChange={(event) => selectVariant(event.target.value)}
              disabled={cartPending || variantsWithWeight.length === 1}
              aria-label={`Choose a weight for ${product.name}`}
              className="h-10 w-full cursor-pointer appearance-none rounded-md border border-[#2C5D43] bg-white pl-3 pr-9 text-sm font-medium text-[#2C5D43] outline-none transition disabled:cursor-not-allowed disabled:bg-[#f5f7f5] disabled:text-[#557060] disabled:opacity-100 focus-visible:ring-2 focus-visible:ring-[#2C5D43] focus-visible:ring-offset-2"
            >
              {variantsWithWeight.map(({ variant, weight }) => (
                <option
                  key={variant.id}
                  value={variant.id}
                  className="bg-[#2C5D43] text-white"
                >
                  {weight}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#2C5D43]"
              aria-hidden="true"
            />
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-2.5 pt-3">
          <div
            aria-label="Quantity"
            className="flex w-[122px] shrink-0 items-center justify-between"
          >
            <button
              type="button"
              onClick={() => {
                setCartMessage(null);
                setQuantity((current) => Math.max(1, current - 1));
              }}
              disabled={quantity === 1 || cartPending}
              aria-label="Decrease quantity"
              className="grid size-8 place-items-center rounded-full border border-[#a8c0b0] bg-white text-[#315f48] shadow-[0_1px_3px_rgba(35,75,52,0.06)] transition-colors hover:border-[#315f48] hover:bg-[#f1f7f2] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68bd45] focus-visible:ring-offset-2"
            >
              <Minus
                className="size-3.5"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
            <output
              className="min-w-9 text-center text-[14px] font-semibold tabular-nums tracking-[0.03em] text-[#35433a]"
              aria-live="polite"
              aria-atomic="true"
            >
              {String(quantity).padStart(2, "0")}
            </output>
            <button
              type="button"
              onClick={() => {
                setCartMessage(null);
                setQuantity((current) => Math.min(99, current + 1))
              }}
              disabled={quantity === 99 || cartPending}
              aria-label="Increase quantity"
              className="grid size-8 place-items-center rounded-full border border-[#315f48] bg-white text-[#315f48] shadow-[0_1px_3px_rgba(35,75,52,0.06)] transition-colors hover:bg-[#315f48] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68bd45] focus-visible:ring-offset-2"
            >
              <Plus className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => void addToCart()}
            disabled={!selectedVariant || !inStock || cartPending}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-[#2d6048] px-2.5 text-[13px] font-medium text-white shadow-[0_4px_10px_rgba(35,75,52,0.15)] transition hover:bg-[#234e3a] disabled:cursor-not-allowed disabled:bg-[#9aa9a0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315f48] focus-visible:ring-offset-2"
          >
            {cartPending
              ? "Adding..."
              : !inStock
                ? "Out of Stock"
                : "Add to Cart"}
          </button>
        </div>
        {cartMessage ? (
          <p
            role={cartMessage.isError ? "alert" : "status"}
            className={`mt-2 text-center text-[11px] leading-4 ${
              cartMessage.isError ? "text-red-700" : "text-[#2d6048]"
            }`}
          >
            {cartMessage.text}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function HomeProductSection({
  section,
  brandSlug,
  eyebrow = "Featured Products",
  showViewAll = true,
}: {
  section: HomepageProductSection;
  brandSlug: string;
  eyebrow?: string;
  showViewAll?: boolean;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const headingId = `homepage-products-${section.code.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const viewAllHref = section.ctaLink
    ? section.ctaLink.startsWith("/")
      ? `${section.ctaLink}${section.ctaLink.includes("?") ? "&" : "?"}brand=${encodeURIComponent(brandSlug)}`
      : section.ctaLink
    : `/categories?section=${encodeURIComponent(section.code)}&brand=${encodeURIComponent(brandSlug)}`;

  function scrollProducts(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0;
    const visibleCards =
      window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1;
    const cardWidth =
      (carousel.clientWidth - gap * (visibleCards - 1)) / visibleCards;
    carousel.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-[#f2f7f3] px-5 py-14 sm:px-8 sm:py-[68px]"
      aria-labelledby={headingId}
    >
      <Image
        src="/images/homepage-leaf-left-bottom.png"
        alt=""
        width={320}
        height={320}
        sizes="320px"
        className="pointer-events-none absolute -left-16 top-6 -z-10 w-[250px] opacity-[0.12] sm:w-[320px]"
      />
      <div className="mx-auto max-w-[1240px]">
        <header className="mx-auto max-w-4xl text-center">
          {eyebrow ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#26342d] sm:text-xs">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-[-0.025em] text-[#252a2f] sm:text-4xl lg:text-[42px]"
          >
            {section.title}
          </h2>
          {section.description ? (
            <p className="mx-auto mt-2 max-w-4xl text-[13px] leading-6 text-[#31383d] sm:text-sm">
              {section.description}
            </p>
          ) : null}
        </header>

        <div className="relative mx-auto mt-8 max-w-[1240px] sm:mt-10">
          <button
            type="button"
            aria-label="Scroll to previous products"
            onClick={() => scrollProducts(-1)}
            className="absolute left-[-43px] top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full text-[#28634e] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315f48] lg:grid"
          >
            <ChevronLeft className="size-7" aria-hidden="true" />
          </button>
          <div
            ref={carouselRef}
            className="home-product-carousel snap-x snap-mandatory overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {section.products.map((product) => (
              <div
                key={product.id}
                className="flex w-full snap-start justify-center"
              >
                <HomeProductCard product={product} brandSlug={brandSlug} />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label="Scroll to next products"
            onClick={() => scrollProducts(1)}
            className="absolute right-[-43px] top-1/2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full text-[#28634e] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315f48] lg:grid"
          >
            <ChevronRight className="size-7" aria-hidden="true" />
          </button>
        </div>

        {showViewAll ? (
          <div className="mt-7 text-center sm:mt-8">
            <Link
              href={viewAllHref}
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#2d6048] px-4 text-xs font-medium text-white shadow-[0_4px_12px_rgba(35,75,52,0.15)] transition hover:-translate-y-0.5 hover:bg-[#234e3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315f48] focus-visible:ring-offset-2"
            >
              {section.ctaLabel ?? "View More Products"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
