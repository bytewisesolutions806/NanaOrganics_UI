"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { HomeProductCard } from "@/components/home/home-product-section";
import type {
  StoreCategory,
  StoreProduct,
  StorefrontFacetValue,
} from "@/types/storefront";

interface ShopCategoryListingProps {
  category: StoreCategory & {
    description: string;
  } | null;
  categories: StoreCategory[];
  products: StoreProduct[];
  facets: StorefrontFacetValue[];
  brandSlug: string;
  selectedSubcategorySlug?: string;
  paginationSlug?: string;
  title?: string;
  totalItems?: number;
}

type SortOrder = "recommended" | "price-low" | "price-high" | "name";
const PRODUCTS_PER_PAGE = 12;

function getProductPrice(product: StoreProduct) {
  const prices = product.variants
    .map((variant) => {
      const offerPrice = variant.offerPricing?.sellingPrice;
      return offerPrice !== null && offerPrice !== undefined && offerPrice > 0
        ? offerPrice
        : variant.priceWithTax;
    })
    .filter((price) => Number.isFinite(price));

  return prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;
}

function getVariantPriceRange(variant: StoreProduct["variants"][number]) {
  const offerPrice = variant.offerPricing?.sellingPrice;
  if (offerPrice !== null && offerPrice !== undefined && offerPrice > 0) {
    return { min: offerPrice, max: offerPrice };
  }

  const min = variant.priceRange?.min ?? variant.priceWithTax;
  return {
    min,
    max: Math.max(min, variant.priceRange?.max ?? variant.priceWithTax),
  };
}

function getVariantOptionValues(variant: StoreProduct["variants"][number]) {
  const values = variant.options?.length
    ? variant.options.map((option) => option.name)
    : [variant.name];

  return values.filter(
    (value) => value.trim() && !/^default$/i.test(value.trim()),
  );
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function FilterCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[13px] leading-5 text-[#414b44]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 rounded border-[#b8c9bc] accent-[#315f48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48]"
      />
      <span>{label}</span>
    </label>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const contentId = useId();

  return (
    <section>
      <h3>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggle}
          className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-[#dcece3] bg-white px-3 py-2 text-left text-sm font-medium text-[#28382d] transition-colors hover:border-[#9fcbb2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48]"
        >
          <span>{title}</span>
          <ChevronDown
            className={`size-4 shrink-0 text-[#315f48] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div id={contentId} hidden={!isOpen} className="px-2 pt-2">
        {children}
      </div>
    </section>
  );
}

function FilterContents({
  category,
  categories,
  brandSlug,
  facetGroups,
  selectedFacets,
  onFacetChange,
  selectedPrice,
  priceBounds,
  onPriceChange,
  availableSizes,
  selectedSizes,
  onSizeChange,
  discountOptions,
  selectedDiscounts,
  onDiscountChange,
  inStockOnly,
  onStockChange,
  hasStockData,
  selectedSubcategorySlug,
}: {
  category: ShopCategoryListingProps["category"];
  categories: StoreCategory[];
  brandSlug: string;
  facetGroups: Array<{
    id: string;
    name: string;
    values: Array<{ id: string; name: string; count: number }>;
  }>;
  selectedFacets: Set<string>;
  onFacetChange: (id: string) => void;
  selectedPrice: { min: number; max: number };
  priceBounds: { min: number; max: number };
  onPriceChange: (range: { min: number; max: number }) => void;
  availableSizes: string[];
  selectedSizes: Set<string>;
  onSizeChange: (size: string) => void;
  discountOptions: number[];
  selectedDiscounts: Set<number>;
  onDiscountChange: (discount: number) => void;
  hasStockData: boolean;
  inStockOnly: boolean;
  onStockChange: () => void;
  selectedSubcategorySlug?: string;
}) {
  const brandQuery = `?brand=${encodeURIComponent(brandSlug)}`;
  const priceInputId = useId();
  const categoryListId = useId();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedCategorySlug, setExpandedCategorySlug] = useState(
    category?.slug ?? "",
  );
  const isSectionOpen = (key: string) => openSections[key] ?? true;
  const toggleSection = (key: string) =>
    setOpenSections((current) => ({
      ...current,
      [key]: !(current[key] ?? true),
    }));

  const sortedCategories = categories.slice().sort(
    (left, right) =>
      left.position - right.position || left.name.localeCompare(right.name),
  );

  return (
    <div className="space-y-3">
      <FilterSection
        title="Categories"
        isOpen={isSectionOpen("categories")}
        onToggle={() => toggleSection("categories")}
      >
        {sortedCategories.length ? (
          <ul className="max-h-[340px] space-y-3 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#86cdb4_#edf4ef] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#edf4ef] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#86cdb4]">
            {sortedCategories.map((item) => {
              const isExpanded = expandedCategorySlug === item.slug;
              const isActiveCategory = item.slug === category?.slug;
              const children = item.children.slice().sort(
                (left, right) =>
                  left.position - right.position ||
                  left.name.localeCompare(right.name),
              );
              const childListId = `${categoryListId}-${item.id}-children`;

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-expanded={children.length ? isExpanded : undefined}
                    aria-controls={children.length ? childListId : undefined}
                    onClick={() => {
                      if (children.length) {
                        setExpandedCategorySlug(isExpanded ? "" : item.slug);
                      }
                    }}
                    className={`flex w-full items-start justify-between gap-2 text-left text-sm font-medium uppercase leading-5 transition-colors sm:text-base ${
                      isActiveCategory
                        ? "text-[#15945f]"
                        : "text-[#172b43] hover:text-[#15945f]"
                    }`}
                  >
                    <span>{item.name}</span>
                    {children.length ? (
                      <ChevronDown
                        className={`mt-0.5 size-4 shrink-0 transition-transform ${
                          isExpanded
                            ? "text-[#15945f]"
                            : "-rotate-90 text-[#172b43]"
                        }`}
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                  {children.length ? (
                    <ul
                      id={childListId}
                      hidden={!isExpanded}
                      className="mt-2 space-y-2 border-l border-[#d6e9e1] pl-4"
                    >
                      {children.map((child) => {
                        const isActiveSubcategory =
                          isActiveCategory &&
                          selectedSubcategorySlug === child.slug;

                        return (
                          <li key={child.id}>
                            <Link
                              href={`/shop/${encodeURIComponent(item.slug)}/${encodeURIComponent(child.slug)}${brandQuery}`}
                              aria-current={
                                isActiveSubcategory ? "page" : undefined
                              }
                              className={`block text-sm transition-colors ${
                                isActiveSubcategory
                                  ? "font-semibold text-[#15945f]"
                                  : "text-[#34443a] hover:text-[#15945f]"
                              }`}
                            >
                              {child.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-[#68756d]">No categories available.</p>
        )}
      </FilterSection>

      <FilterSection
        title="Price"
        isOpen={isSectionOpen("price")}
        onToggle={() => toggleSection("price")}
      >
        <div className="px-1">
          <div className="relative h-6">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#e1ebe4]" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#315f48]"
              style={{
                left: `${
                  priceBounds.max === priceBounds.min
                    ? 0
                    : ((selectedPrice.min - priceBounds.min) /
                        (priceBounds.max - priceBounds.min)) *
                      100
                }%`,
                right: `${
                  priceBounds.max === priceBounds.min
                    ? 100
                    : 100 -
                      ((selectedPrice.max - priceBounds.min) /
                        (priceBounds.max - priceBounds.min)) *
                        100
                }%`,
              }}
            />
            <input
              id={`${priceInputId}-min`}
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step="1"
              value={selectedPrice.min}
              disabled={priceBounds.min === priceBounds.max}
              aria-label="Minimum price"
              aria-valuetext={`₹${formatPrice(selectedPrice.min)}`}
              onChange={(event) =>
                onPriceChange({
                  min: Math.min(Number(event.target.value), selectedPrice.max),
                  max: selectedPrice.max,
                })
              }
              className="price-range-input"
              style={{
                zIndex:
                  selectedPrice.min >
                  (priceBounds.min + priceBounds.max) / 2
                    ? 4
                    : 3,
              }}
            />
            <input
              id={`${priceInputId}-max`}
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step="1"
              value={selectedPrice.max}
              disabled={priceBounds.min === priceBounds.max}
              aria-label="Maximum price"
              aria-valuetext={`₹${formatPrice(selectedPrice.max)}`}
              onChange={(event) =>
                onPriceChange({
                  min: selectedPrice.min,
                  max: Math.max(Number(event.target.value), selectedPrice.min),
                })
              }
              className="price-range-input"
              style={{
                zIndex:
                  selectedPrice.max <
                  (priceBounds.min + priceBounds.max) / 2
                    ? 4
                    : 2,
              }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-[#68756d]">
            <span>₹{formatPrice(selectedPrice.min)}</span>
            <span>₹{formatPrice(selectedPrice.max)}</span>
          </div>
        </div>
      </FilterSection>

      {availableSizes.length ? (
        <FilterSection
          title="Size"
          isOpen={isSectionOpen("size")}
          onToggle={() => toggleSection("size")}
        >
          <div className="space-y-0.5">
            {availableSizes.map((size) => (
              <FilterCheckbox
                key={size}
                checked={selectedSizes.has(size)}
                label={size}
                onChange={() => onSizeChange(size)}
              />
            ))}
          </div>
        </FilterSection>
      ) : null}

      {discountOptions.length ? (
        <FilterSection
          title="Discount"
          isOpen={isSectionOpen("discount")}
          onToggle={() => toggleSection("discount")}
        >
          <div className="space-y-0.5">
            {discountOptions.map((discount) => (
              <FilterCheckbox
                key={discount}
                checked={selectedDiscounts.has(discount)}
                label={`${discount}% off`}
                onChange={() => onDiscountChange(discount)}
              />
            ))}
          </div>
        </FilterSection>
      ) : null}

      {facetGroups.map((group) => (
        <FilterSection
          key={group.id}
          title={group.name}
          isOpen={isSectionOpen(`facet-${group.id}`)}
          onToggle={() => toggleSection(`facet-${group.id}`)}
        >
          <div>
            {group.values.map((value) => (
              <FilterCheckbox
                key={value.id}
                checked={selectedFacets.has(value.id)}
                label={`${value.name} (${value.count})`}
                onChange={() => onFacetChange(value.id)}
              />
            ))}
          </div>
        </FilterSection>
      ))}

      {hasStockData ? (
        <FilterSection
          title="Availability"
          isOpen={isSectionOpen("availability")}
          onToggle={() => toggleSection("availability")}
        >
          <div>
            <FilterCheckbox
              checked={inStockOnly}
              label="In stock"
              onChange={onStockChange}
            />
          </div>
        </FilterSection>
      ) : null}
    </div>
  );
}

export function ShopCategoryListing({
  category,
  categories,
  products,
  facets,
  brandSlug,
  selectedSubcategorySlug,
  paginationSlug,
  title = "Related products",
  totalItems,
}: ShopCategoryListingProps) {
  const [loadedProducts, setLoadedProducts] = useState(products);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [selectedFacets, setSelectedFacets] = useState<Set<string>>(
    () => new Set(),
  );
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedDiscounts, setSelectedDiscounts] = useState<Set<number>>(
    () => new Set(),
  );
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileFiltersOpen]);

  const priceBounds = useMemo(() => {
    const prices = loadedProducts
      .flatMap((product) =>
        product.variants.flatMap((variant) => {
          const range = getVariantPriceRange(variant);
          return [range.min, range.max];
        }),
      )
      .filter((price) => Number.isFinite(price) && price >= 0);

    return prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 };
  }, [loadedProducts]);
  const selectedPrice = priceRange
    ? {
        min: Math.min(
          Math.max(priceRange.min, priceBounds.min),
          priceBounds.max,
        ),
        max: Math.max(
          Math.min(priceRange.max, priceBounds.max),
          priceBounds.min,
        ),
      }
    : priceBounds;
  const availableSizes = useMemo(
    () =>
      [
        ...new Set(
          loadedProducts.flatMap((product) =>
            product.variants.flatMap(getVariantOptionValues),
          ),
        ),
      ].sort((left, right) => left.localeCompare(right)),
    [loadedProducts],
  );
  const discountOptions = useMemo(
    () =>
      [
        ...new Set(
          loadedProducts.flatMap((product) =>
            product.variants
              .map((variant) => variant.offerPricing?.offerPercentage)
              .filter(
                (discount): discount is number =>
                  typeof discount === "number" && discount > 0,
              ),
          ),
        ),
      ].sort((left, right) => right - left),
    [loadedProducts],
  );
  const hasStockData = loadedProducts.some((product) =>
    product.variants.some((variant) => variant.stockLevel !== "UNKNOWN"),
  );

  const facetGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        id: string;
        name: string;
        values: Map<string, { name: string; count: number }>;
      }
    >();

    for (const value of facets) {
      const group = groups.get(value.facet.id) ?? {
        id: value.facet.id,
        name: value.facet.name,
        values: new Map<string, { name: string; count: number }>(),
      };
      group.values.set(value.id, { name: value.name, count: value.count });
      groups.set(value.facet.id, group);
    }

    return [...groups.values()]
      .map((group) => ({
        id: group.id,
        name: group.name,
        values: [...group.values.entries()]
          .map(([id, value]) => ({ id, ...value }))
          .sort((left, right) => left.name.localeCompare(right.name)),
      }))
      .filter((group) => group.values.length)
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [facets]);

  const filteredProducts = useMemo(() => {
    const selectedFacetIds = [...selectedFacets];
    const results = loadedProducts.filter((product) => {
      const variants = product.variants;
      const hasMatchingVariant = variants.some((variant) => {
        const stockMatches =
          !inStockOnly ||
          (variant.stockLevel !== "OUT_OF_STOCK" &&
            variant.stockLevel !== "UNKNOWN");
        const sizeMatches =
          !selectedSizes.size ||
          getVariantOptionValues(variant).some((size) =>
            selectedSizes.has(size),
          );
        const discountMatches =
          !selectedDiscounts.size ||
          selectedDiscounts.has(
            variant.offerPricing?.offerPercentage ?? Number.NaN,
          );
        const priceMatches = (() => {
          const range = getVariantPriceRange(variant);
          return range.max >= selectedPrice.min && range.min <= selectedPrice.max;
        })();

        return stockMatches && sizeMatches && discountMatches && priceMatches;
      });
      if (!hasMatchingVariant) return false;

      const productFacetIds = new Set(
        (product.facetValues ?? []).map((value) => value.id),
      );
      const selectedFacetGroups = facetGroups
        .map((group) => ({
          group,
          selectedIds: group.values
            .map((value) => value.id)
            .filter((id) => selectedFacetIds.includes(id)),
        }))
        .filter((entry) => entry.selectedIds.length);

      return selectedFacetGroups.every(({ selectedIds }) =>
        selectedIds.some((id) => productFacetIds.has(id)),
      );
    });

    switch (sortOrder) {
      case "price-low":
        return results.sort(
          (left, right) => getProductPrice(left) - getProductPrice(right),
        );
      case "price-high":
        return results.sort(
          (left, right) => getProductPrice(right) - getProductPrice(left),
        );
      case "name":
        return results.sort((left, right) =>
          left.name.localeCompare(right.name),
        );
      default:
        return results;
    }
  }, [
    facetGroups,
    inStockOnly,
    loadedProducts,
    selectedDiscounts,
    selectedFacets,
    selectedPrice.max,
    selectedPrice.min,
    selectedSizes,
    sortOrder,
  ]);

  function toggleFacet(id: string) {
    setSelectedFacets((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSize(size: string) {
    setSelectedSizes((current) => {
      const next = new Set(current);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  function toggleDiscount(discount: number) {
    setSelectedDiscounts((current) => {
      const next = new Set(current);
      if (next.has(discount)) next.delete(discount);
      else next.add(discount);
      return next;
    });
  }

  function clearFilters() {
    setSelectedFacets(new Set());
    setPriceRange(null);
    setSelectedSizes(new Set());
    setSelectedDiscounts(new Set());
    setInStockOnly(false);
  }

  const pageCount = Math.ceil((totalItems ?? loadedProducts.length) / PRODUCTS_PER_PAGE);
  const firstVisiblePage = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
  const visiblePages = Array.from(
    { length: Math.min(5, pageCount) },
    (_, index) => firstVisiblePage + index,
  );

  async function loadPage(page: number) {
    if (
      !paginationSlug ||
      isLoadingPage ||
      page < 1 ||
      page > pageCount ||
      page === currentPage
    ) {
      return;
    }

    setIsLoadingPage(true);
    setLoadMoreError(null);
    try {
      const params = new URLSearchParams({
        collectionSlug: paginationSlug,
        skip: String((page - 1) * PRODUCTS_PER_PAGE),
      });
      const response = await fetch(
        `/api/storefront/category-products?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Category products could not be loaded.");
      }

      const result: { items: StoreProduct[]; totalItems: number } =
        await response.json();
      setLoadedProducts(result.items);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load category product page.", error);
      setLoadMoreError("Products could not be loaded. Please try again.");
    } finally {
      setIsLoadingPage(false);
    }
  }

  const isPriceFiltered =
    selectedPrice.min !== priceBounds.min ||
    selectedPrice.max !== priceBounds.max;
  const hasFilters =
    selectedFacets.size > 0 ||
    selectedSizes.size > 0 ||
    selectedDiscounts.size > 0 ||
    isPriceFiltered ||
    inStockOnly;
  const sidebar = (
    <div className="rounded-xl border border-[#e0e8e1] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-[#e7ece7] pb-4">
        <h2 className="text-base font-semibold text-[#26372c]">
          Categories &amp; Filters
        </h2>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-[#477252] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315f48]"
          >
            Clear all
          </button>
        ) : null}
      </div>
      <FilterContents
        category={category}
        categories={categories}
        brandSlug={brandSlug}
        facetGroups={facetGroups}
        selectedFacets={selectedFacets}
        onFacetChange={toggleFacet}
        selectedPrice={selectedPrice}
        priceBounds={priceBounds}
        onPriceChange={setPriceRange}
        availableSizes={availableSizes}
        selectedSizes={selectedSizes}
        onSizeChange={toggleSize}
        discountOptions={discountOptions}
        selectedDiscounts={selectedDiscounts}
        onDiscountChange={toggleDiscount}
        hasStockData={hasStockData}
        inStockOnly={inStockOnly}
        onStockChange={() => setInStockOnly((current) => !current)}
        selectedSubcategorySlug={selectedSubcategorySlug}
      />
    </div>
  );

  return (
    <section className="mt-8 sm:mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#203428] sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#68756d]">
            Showing{" "}
            {loadedProducts.length
              ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1
              : 0}
            –
            {Math.min(
              currentPage * PRODUCTS_PER_PAGE,
              totalItems ?? loadedProducts.length,
            )}{" "}
            of {totalItems ?? loadedProducts.length} products
          </p>
          {hasFilters ? (
            <p className="mt-1 text-xs text-[#68756d]">
              Showing {filteredProducts.length} matching products on this page.
            </p>
          ) : null}
        </div>
        <label className="flex items-center gap-2 text-sm text-[#657168]">
          <span className="hidden sm:inline">Sort by</span>
          <span className="sr-only sm:hidden">Sort products</span>
          <span className="relative">
            <select
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value as SortOrder)
              }
              className="h-10 min-w-[164px] appearance-none rounded-md border border-[#d6e1d8] bg-white pl-3 pr-9 text-sm text-[#34443a] outline-none focus-visible:ring-2 focus-visible:ring-[#315f48]"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#526c5a]"
              aria-hidden="true"
            />
          </span>
        </label>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8">
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain pr-1 lg:block">
          {sidebar}
        </aside>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          aria-label="Open categories and filters"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e6f4f2] bg-white px-3 text-sm font-semibold text-[#26372c] lg:hidden"
        >
          <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Categories &amp; Filters
          </span>
          {hasFilters ? (
            <span className="grid size-5 place-items-center rounded-full bg-[#315f48] text-[10px] text-white">
              {selectedFacets.size +
                Number(isPriceFiltered) +
                selectedSizes.size +
                selectedDiscounts.size +
                Number(inStockOnly)}
            </span>
          ) : null}
        </button>

        {mobileFiltersOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close categories and filters"
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <section
              role="dialog"
              aria-modal="true"
              aria-label="Categories and filters"
              className="absolute inset-y-0 right-0 flex w-full flex-col bg-white sm:max-w-md"
            >
              <header className="sticky top-0 flex items-center justify-between border-b border-[#e6f4f2] bg-white px-4 py-4">
                <h2 className="text-base font-semibold text-gray-900">
                  Categories &amp; Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close categories and filters"
                  className="grid size-9 place-items-center rounded-full text-gray-600 hover:bg-gray-100"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">{sidebar}</div>
              <footer className="sticky bottom-0 border-t border-[#e6f4f2] bg-white p-4">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full rounded-xl bg-[#1ea766] py-3 text-base font-medium text-white transition-colors hover:bg-[#178c56]"
                >
                  Apply Filters
                </button>
              </footer>
            </section>
          </div>
        ) : null}

        <div className="min-w-0">
          {filteredProducts.length ? (
            <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <HomeProductCard
                  key={product.id}
                  product={product}
                  brandSlug={brandSlug}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-[#dce6dd] bg-white px-5 py-14 text-center">
              <p className="text-base font-medium text-[#35463a]">
                {loadedProducts.length < (totalItems ?? loadedProducts.length)
                  ? "No loaded products match these filters yet."
                  : "No products match these filters."}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#315f48] hover:underline"
              >
                <X className="size-4" aria-hidden="true" />
                Clear filters
              </button>
            </div>
          )}
          {paginationSlug && pageCount > 1 ? (
            <nav
              aria-label="Product pages"
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
              {loadMoreError ? (
                <p role="alert" className="w-full text-center text-sm text-red-700">
                  {loadMoreError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void loadPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoadingPage}
                aria-label="Previous page"
                className="grid size-10 place-items-center rounded-lg border border-[#d6e1d8] bg-white text-[#315f48] transition-colors hover:bg-[#eff6f0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              {visiblePages.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => void loadPage(page)}
                  disabled={isLoadingPage || page === currentPage}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`grid size-10 place-items-center rounded-lg border text-sm font-semibold transition-colors disabled:cursor-default ${
                    page === currentPage
                      ? "border-[#315f48] bg-[#315f48] text-white"
                      : "border-[#d6e1d8] bg-white text-[#315f48] hover:bg-[#eff6f0]"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void loadPage(currentPage + 1)}
                disabled={currentPage === pageCount || isLoadingPage}
                aria-label="Next page"
                className="grid size-10 place-items-center rounded-lg border border-[#d6e1d8] bg-white text-[#315f48] transition-colors hover:bg-[#eff6f0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
              {isLoadingPage ? (
                <span className="sr-only" role="status">
                  Loading products
                </span>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}
