'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCollectionById,
  getCollectionBySlug,
  getProductDetails,
  searchHeaderProducts,
} from '@/graphql/queries/collections';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';
import './index.css';

const MIN_SEARCH_LENGTH = 2;

const isRootCollection = (item) =>
  item?.slug === '__root_collection__' || item?.name === '__root_collection__';

function productImage(product) {
  return product.productAsset?.preview || product.productVariantAsset?.preview || DEFAULT_IMAGE;
}

function priceValues(price) {
  if (!price) return { min: 0, max: 0 };
  if (price.__typename === 'PriceRange') return { min: price.min, max: price.max };
  return { min: price.value, max: price.value };
}

function formatMoney(value, currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(Number(value || 0) / 100);
  } catch {
    return `${currencyCode} ${(Number(value || 0) / 100).toFixed(2)}`;
  }
}

function collectionRoute(collection) {
  const breadcrumbs = (collection?.breadcrumbs || []).filter((item) => !isRootCollection(item));
  const parent = breadcrumbs[0] || collection;
  const child = breadcrumbs.at(-1) || collection;
  if (!parent?.slug || !child?.slug) return null;
  return { category: parent.slug, subcategory: child.slug };
}

async function resolveProductRoute(result) {
  const collectionId = result.collectionIds?.filter(Boolean).at(-1);
  if (collectionId) {
    const route = collectionRoute(await getCollectionById(collectionId));
    if (route) return route;
  }

  const product = await getProductDetails(result.slug);
  const directCollection = [...(product?.collections || [])]
    .sort((a, b) => (b.breadcrumbs?.length || 0) - (a.breadcrumbs?.length || 0))[0];
  const directRoute = collectionRoute(directCollection);
  if (directRoute) return directRoute;

  const categoryFacetValue = product?.facetValues?.find(
    (value) => value.facet?.code === 'organic-category',
  );
  if (categoryFacetValue?.code) {
    return collectionRoute(await getCollectionBySlug(categoryFacetValue.code));
  }

  return null;
}

export default function HeaderSearch() {
  const router = useRouter();
  const rootRef = useRef(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [openingSlug, setOpeningSlug] = useState('');

  useEffect(() => {
    const term = query.trim();
    const requestId = ++requestIdRef.current;

    if (term.length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setTotalItems(0);
      setLoading(false);
      setError('');
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    setError('');
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const response = await searchHeaderProducts(term);
        if (requestId !== requestIdRef.current) return;
        setResults(response?.items || []);
        setTotalItems(response?.totalItems || 0);
        setActiveIndex(-1);
      } catch (searchError) {
        if (requestId !== requestIdRef.current) return;
        console.error('Product search failed', searchError);
        setResults([]);
        setTotalItems(0);
        setError('Unable to search products right now.');
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const openProduct = async (product) => {
    if (openingSlug) return;
    setOpeningSlug(product.slug);
    setError('');

    try {
      const route = await resolveProductRoute(product);
      if (!route) {
        setError('This product does not have a storefront category yet.');
        return;
      }
      setQuery('');
      setIsOpen(false);
      router.push(`/shop/${route.category}/${route.subcategory}/${product.slug}`);
    } catch (navigationError) {
      console.error('Could not open product', navigationError);
      setError('Unable to open this product right now.');
    } finally {
      setOpeningSlug('');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!isOpen || results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      openProduct(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  const showDropdown = isOpen && query.trim().length >= MIN_SEARCH_LENGTH;

  return (
    <div ref={rootRef} className="relative w-full">
      <span className="pi pi-search pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#2c665e]" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => query.trim().length >= MIN_SEARCH_LENGTH && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        aria-label="Search products"
        aria-expanded={showDropdown}
        aria-controls="header-product-search-results"
        autoComplete="off"
        className="header-product-search h-[46px] w-full rounded-[10px] border border-[#cfe2e0] bg-white pl-10 pr-10 text-sm text-[#0D1D2C] outline-none transition focus:border-[#1EA766] focus:ring-2 focus:ring-[#1EA766]/15"
      />

      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setIsOpen(false);
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <span className="pi pi-times text-xs" />
        </button>
      )}

      {showDropdown && (
        <div
          id="header-product-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-[80] mt-2 max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-[#DDEBE8] bg-white shadow-[0_18px_45px_rgba(13,29,44,0.16)]"
        >
          <div className="flex items-center justify-between border-b border-[#EDF3F2] px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#2C665E]">
              Product results
            </span>
            {!loading && totalItems > 0 && (
              <span className="text-xs text-gray-500">{totalItems} found</span>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-3 px-4 py-6 text-sm text-gray-500">
              <span className="pi pi-spin pi-spinner text-[#1EA766]" />
              Searching products...
            </div>
          )}

          {!loading && error && <div className="px-4 py-5 text-sm text-red-600">{error}</div>}

          {!loading && !error && results.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-[#0D1D2C]">No products found</p>
              <p className="mt-1 text-xs text-gray-500">Try another product name or SKU.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              {results.map((product, index) => {
                const prices = priceValues(product.priceWithTax);
                const isOpening = openingSlug === product.slug;
                return (
                  <button
                    key={product.productId}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openProduct(product)}
                    disabled={Boolean(openingSlug)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      activeIndex === index ? 'bg-[#EAF7F1]' : 'hover:bg-[#F6FAF9]'
                    } disabled:cursor-wait disabled:opacity-70`}
                  >
                    <img
                      src={productImage(product)}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg border border-[#E4ECEA] bg-[#F6FAF9] object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#152A36]">
                        {product.productName}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-gray-500">
                        {product.productVariantName || product.sku}
                      </span>
                      <span className="mt-1 block text-xs font-semibold text-[#1EA766]">
                        {formatMoney(prices.min, product.currencyCode)}
                        {prices.max !== prices.min &&
                          ` – ${formatMoney(prices.max, product.currencyCode)}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span
                        className={`block text-[11px] font-medium ${
                          product.inStock ? 'text-[#1EA766]' : 'text-red-500'
                        }`}
                      >
                        {product.inStock ? 'In stock' : 'Out of stock'}
                      </span>
                      <span
                        className={`pi mt-2 text-xs text-[#2C665E] ${
                          isOpening ? 'pi-spin pi-spinner' : 'pi-chevron-right'
                        }`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
