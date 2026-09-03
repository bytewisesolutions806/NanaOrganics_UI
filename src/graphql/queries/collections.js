import { gql } from "graphql-request";
import { shopApiRequest } from "@/lib/graphql/client";

export const GET_ALL_COLLECTIONS = gql`
  query GetAllCollections($options: CollectionListOptions) {
    collections(options: $options) {
      totalItems
      items {
        id
        name
        slug
        description
        position
        parentId
        productVariantCount
        featuredAsset {
          id
          name
          preview
          source
        }
        breadcrumbs {
          id
          name
          slug
        }
        children {
          id
          name
          slug
          position
          productVariantCount
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_SLUG = gql`
  query GetCollectionBySlug($slug: String!) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      position
      parentId
      productVariantCount
      featuredAsset {
        id
        name
        preview
        source
      }
      breadcrumbs {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        description
        position
        parentId
        productVariantCount
        featuredAsset {
          id
          name
          preview
          source
        }
        breadcrumbs {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_ID = gql`
  query GetCollectionById($id: ID!) {
    collection(id: $id) {
      id
      name
      slug
      breadcrumbs {
        id
        name
        slug
      }
    }
  }
`;

export const SEARCH_HEADER_PRODUCTS = gql`
  query SearchHeaderProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        productId
        productName
        slug
        description
        productVariantId
        productVariantName
        sku
        currencyCode
        collectionIds
        inStock
        productAsset {
          id
          preview
        }
        productVariantAsset {
          id
          preview
        }
        priceWithTax {
          __typename
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
      }
    }
  }
`;

export const GET_HOMEPAGE_COLLECTIONS = gql`
  fragment HomepageCollectionFields on Collection {
    id
    name
    slug
    description
    featuredAsset {
      id
      preview
      source
    }
    productVariants(options: { take: 20, sort: { name: ASC } }) {
      items {
        id
        name
        sku
        price
        priceWithTax
        currencyCode
        stockLevel
        customFields {
          isPopular
        }
        offerPricing {
          originalPrice
          offerPercentage
          sellingPrice
        }
        featuredAsset {
          id
          preview
          source
        }
        options {
          id
          name
          code
        }
        product {
          id
          name
          slug
          description
          featuredAsset {
            id
            preview
            source
          }
          collections {
            id
            name
            slug
            breadcrumbs {
              id
              name
              slug
            }
          }
        }
      }
    }
  }

  query GetHomepageCollections(
    $trendingSlug: String!
    $trendingFallbackSlug: String!
    $dealsSlug: String!
    $dealsFallbackSlug: String!
    $featuredSlug: String!
    $featuredFallbackSlug: String!
  ) {
    trending: collection(slug: $trendingSlug) {
      ...HomepageCollectionFields
    }
    trendingFallback: collection(slug: $trendingFallbackSlug) {
      ...HomepageCollectionFields
    }
    deals: collection(slug: $dealsSlug) {
      ...HomepageCollectionFields
    }
    dealsFallback: collection(slug: $dealsFallbackSlug) {
      ...HomepageCollectionFields
    }
    featured: collection(slug: $featuredSlug) {
      ...HomepageCollectionFields
    }
    featuredFallback: collection(slug: $featuredFallbackSlug) {
      ...HomepageCollectionFields
    }
  }
`;

export const GET_COLLECTION_PRODUCTS = gql`
  query GetCollectionProducts(
    $slug: String!
    $options: ProductVariantListOptions
  ) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      productVariantCount
      breadcrumbs {
        id
        name
        slug
      }
      parent {
        id
        name
        slug
      }
      productVariants(options: $options) {
        totalItems
        items {
          id
          name
          sku
          price
          priceWithTax
          currencyCode
          stockLevel
          offerPricing {
            originalPrice
            offerPercentage
            sellingPrice
          }
          featuredAsset {
            id
            preview
            source
          }
          assets {
            id
            preview
            source
          }
          options {
            id
            name
            code
          }
          product {
            id
            name
            slug
            description
            featuredAsset {
              id
              preview
              source
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_DETAILS = gql`
  query GetProductDetails($slug: String!) {
    product(slug: $slug) {
      id
      name
      slug
      description
      enabled
      customFields {
        aboutThisItem
        isVegetarian
        isOrganic
      }
      featuredAsset {
        id
        preview
        source
      }
      assets {
        id
        name
        preview
        source
      }
      facetValues {
        id
        name
        code
        facet {
          id
          name
          code
        }
      }
      collections {
        id
        name
        slug
        breadcrumbs {
          id
          name
          slug
        }
      }
      variants {
        id
        name
        sku
        price
        priceWithTax
        currencyCode
        stockLevel
        customFields {
          isPopular
        }
        offerPricing {
          originalPrice
          offerPercentage
          sellingPrice
        }
        featuredAsset {
          id
          preview
          source
        }
        assets {
          id
          preview
          source
        }
        options {
          id
          name
          code
        }
      }
    }
  }
`;

export const SEARCH_COLLECTION_PRODUCTS = gql`
  query SearchCollectionProducts(
    $input: SearchInput!
    $filterInput: SearchInput!
  ) {
    productResults: search(input: $input) {
      totalItems
      items {
        productId
        productName
        slug
        description
        productAsset {
          id
          preview
        }
        productVariantId
        productVariantName
        productVariantAsset {
          id
          preview
        }
        sku
        currencyCode
        facetValueIds
        offerPricing {
          originalPrice
          offerPercentage
          sellingPrice
        }
        priceWithTax {
          __typename
          ... on SinglePrice {
            value
          }
          ... on PriceRange {
            min
            max
          }
        }
      }
    }

    filterResults: search(input: $filterInput) {
      facetValues {
        count
        facetValue {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
      }
    }
  }
`;

export const DEFAULT_COLLECTION_OPTIONS = {
  skip: 0,
  take: 100,
  topLevelOnly: true,
  sort: { position: "ASC" },
};

export async function getAllCollections(options = DEFAULT_COLLECTION_OPTIONS) {
  const data = await shopApiRequest(GET_ALL_COLLECTIONS, { options });
  return {
    ...data.collections,
    items: (data.collections?.items || []).filter(
      (collection) => !collection.slug?.startsWith("homepage-"),
    ),
  };
}

export async function getCollectionBySlug(slug) {
  const data = await shopApiRequest(GET_COLLECTION_BY_SLUG, { slug });
  return data.collection;
}

export async function getCollectionById(id) {
  const data = await shopApiRequest(GET_COLLECTION_BY_ID, { id });
  return data.collection;
}

export async function searchHeaderProducts(term, take = 8) {
  const data = await shopApiRequest(SEARCH_HEADER_PRODUCTS, {
    input: {
      term: term.trim(),
      groupByProduct: true,
      skip: 0,
      take,
    },
  });
  return data.search;
}

export async function getHomepageCollections(slugs = {}) {
  return shopApiRequest(GET_HOMEPAGE_COLLECTIONS, {
    trendingSlug: slugs.trending || "homepage-trending-now",
    trendingFallbackSlug: "trending-now",
    dealsSlug: slugs.deals || "homepage-deals",
    dealsFallbackSlug: "deals",
    featuredSlug: slugs.featured || "homepage-featured",
    featuredFallbackSlug: "featured-collections",
  });
}

export async function getCollectionProducts(slug, options = {}) {
  const data = await shopApiRequest(GET_COLLECTION_PRODUCTS, {
    slug,
    options: {
      skip: 0,
      take: 20,
      sort: { name: "ASC" },
      ...options,
    },
  });
  return data.collection;
}

export async function getProductDetails(slug) {
  const data = await shopApiRequest(GET_PRODUCT_DETAILS, { slug });
  return data.product;
}

export async function searchCollectionProducts(input, filterInput) {
  return shopApiRequest(SEARCH_COLLECTION_PRODUCTS, { input, filterInput });
}
