import {
  getCollectionBySlug,
  searchCollectionProducts,
} from "@/graphql/queries/collections";
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

const HIDDEN_FACET_CODES = new Set(["seeded-collection-membership"]);

const money = (value) => Number(value || 0) / 100;

function getSearchPrice(price) {
  if (!price) return 0;
  if (price.__typename === "PriceRange") return price.min;
  return price.value;
}

function toProductCards(items = []) {
  return items.map((item) => {
    const price = money(getSearchPrice(item.priceWithTax));
    const thumbnail =
      item.productAsset?.preview ||
      item.productVariantAsset?.preview ||
      DEFAULT_IMAGE;

    return {
      id: item.productId,
      handle: item.slug,
      slug: item.slug,
      title: item.productName,
      description: item.description || "",
      thumbnail,
      price,
      original_price: price,
      discount: 0,
      currency: item.currencyCode,
      rating: 0,
      reviews_count: 0,
      in_stock: true,
      variants: [
        {
          id: item.productVariantId,
          title: item.productVariantName,
          label: item.productVariantName,
          sku: item.sku,
          price,
          original_price: price,
          currency: item.currencyCode,
          in_stock: true,
        },
      ],
    };
  });
}

function groupAvailableFacets(items = []) {
  const groups = new Map();

  for (const item of items) {
    const facet = item.facetValue?.facet;
    const value = item.facetValue;
    if (!facet || !value || HIDDEN_FACET_CODES.has(facet.code)) continue;

    if (!groups.has(facet.id)) {
      groups.set(facet.id, {
        id: facet.id,
        name: facet.name,
        code: facet.code,
        values: [],
      });
    }

    groups.get(facet.id).values.push({
      id: value.id,
      name: value.name,
      code: value.code,
      count: item.count,
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      values: group.values.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getSort(sort) {
  switch (sort) {
    case "name_desc":
      return { name: "DESC" };
    case "price_asc":
      return { price: "ASC" };
    case "price_desc":
      return { price: "DESC" };
    default:
      return { name: "ASC" };
  }
}

export const getProductsBySubcategory = async ({
  subcategoryHandle,
  page = 1,
  limit = 20,
  facetFilters = [],
  sort = "name_asc",
} = {}) => {
  if (!subcategoryHandle) return { success: false };

  const facetValueFilters = facetFilters
    .map((values) => [...new Set(values.filter(Boolean))])
    .filter((values) => values.length > 0)
    .map((values) =>
      values.length === 1 ? { and: values[0] } : { or: values },
    );

  const [collection, searchResult] = await Promise.all([
    getCollectionBySlug(subcategoryHandle),
    searchCollectionProducts(
      {
        collectionSlug: subcategoryHandle,
        groupByProduct: true,
        facetValueFilters,
        skip: Math.max(0, page - 1) * limit,
        take: limit,
        sort: getSort(sort),
      },
      {
        collectionSlug: subcategoryHandle,
        groupByProduct: true,
        skip: 0,
        take: 1,
      },
    ),
  ]);

  if (!collection) return { success: false };

  const list = searchResult?.productResults || { items: [], totalItems: 0 };
  const parent = collection.breadcrumbs?.at(-2);
  const products = toProductCards(list.items);
  const totalPages = Math.max(1, Math.ceil(list.totalItems / limit));

  return {
    success: true,
    data: {
      subcategory: {
        id: collection.id,
        name: collection.name,
        handle: collection.slug,
        description: collection.description || "",
        parent_category: {
          id: parent?.id,
          name: parent?.name || "Shop",
          handle: parent?.slug || "shop",
        },
      },
      products,
      pagination: {
        page,
        limit,
        total: list.totalItems,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      filters: {
        facets: groupAvailableFacets(searchResult?.filterResults?.facetValues),
      },
      sort_options: [
        { value: "name_asc", label: "Name: A to Z" },
        { value: "name_desc", label: "Name: Z to A" },
        { value: "price_asc", label: "Price: Low to High" },
        { value: "price_desc", label: "Price: High to Low" },
      ],
    },
  };
};
