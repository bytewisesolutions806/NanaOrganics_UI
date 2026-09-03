import 'server-only';

import { unstable_cache } from 'next/cache';
import { getDealsData } from '@/service/DealsService';
import { getDiscoveryData } from '@/service/HomeService';
import { getProductById } from '@/service/Product';
import {
  getProductsBySubcategory,
  getRelatedProductsBySubcategory,
} from '@/service/ProductService';
import { getCategories } from '@/service/categoryService';

const PUBLIC_DATA_SECONDS = 300;
const PRODUCT_LIST_SECONDS = 60;

const cachedCategories = unstable_cache(
  () => getCategories(),
  ['nana-public-categories-v2'],
  { revalidate: PUBLIC_DATA_SECONDS, tags: ['catalog-categories'] },
);

const cachedDiscovery = unstable_cache(
  (codes, take) => getDiscoveryData({ codes, take }),
  ['nana-public-discovery-v1'],
  { revalidate: PUBLIC_DATA_SECONDS, tags: ['homepage-data', 'catalog-products'] },
);

const cachedProductList = unstable_cache(
  (subcategoryHandle, page, limit, facetFiltersJson, sort) =>
    getProductsBySubcategory({
      subcategoryHandle,
      page,
      limit,
      facetFilters: JSON.parse(facetFiltersJson),
      sort,
    }),
  ['nana-public-product-list-v1'],
  { revalidate: PRODUCT_LIST_SECONDS, tags: ['catalog-products'] },
);

const cachedProduct = unstable_cache(
  (slug) => getProductById({ productId: slug }),
  ['nana-public-product-v1'],
  { revalidate: PUBLIC_DATA_SECONDS, tags: ['catalog-products'] },
);

const cachedRelatedProducts = unstable_cache(
  (subcategoryHandle, excludedSlug, limit) =>
    getRelatedProductsBySubcategory({ subcategoryHandle, excludedSlug, limit }),
  ['nana-public-related-products-v1'],
  { revalidate: PUBLIC_DATA_SECONDS, tags: ['catalog-products'] },
);

const cachedDeals = unstable_cache(
  () => getDealsData(),
  ['nana-public-deals-v1'],
  { revalidate: PRODUCT_LIST_SECONDS, tags: ['catalog-products', 'homepage-data'] },
);

export async function getCachedCategories() {
  const response = await cachedCategories();
  return response?.data?.categories || [];
}

export function getCachedDiscovery(codes, take = 8) {
  return cachedDiscovery([...new Set(codes)].sort(), take);
}

export function getCachedProductList({
  subcategoryHandle,
  page = 1,
  limit = 20,
  facetFilters = [],
  sort = 'name_asc',
}) {
  return cachedProductList(
    String(subcategoryHandle || ''),
    page,
    limit,
    JSON.stringify(facetFilters),
    sort,
  );
}

export function getCachedProduct(slug) {
  return cachedProduct(String(slug || ''));
}

export function getCachedRelatedProducts(subcategoryHandle, excludedSlug, limit = 6) {
  return cachedRelatedProducts(
    String(subcategoryHandle || ''),
    String(excludedSlug || ''),
    limit,
  );
}

export function getCachedDeals() {
  return cachedDeals();
}
