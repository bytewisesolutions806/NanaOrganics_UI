import "server-only";

import type {
  BrandHomepageData,
  HomepageProductSection,
  StoreAsset,
  StoreBrand,
  StoreProduct,
  StoreHomepageSettings,
  StoreHomepageVideo,
  StoreHomepageMarketingSection,
  StorefrontCatalogData,
  StorefrontCategoryPageData,
  StorefrontFacetValue,
  StorefrontProductDetail,
  StorefrontSearchResult,
  StoreCategory,
} from "@/types/storefront";

const BRANDS_QUERY = /* GraphQL */ `
  query StorefrontBrands {
    shopBrands {
      id
      name
      slug
      description
      featured
      sortOrder
      seoTitle
      seoDescription
      heroEyebrow
      heroTitle
      heroDescription
      heroPrimaryLabel
      heroPrimaryLink
      heroSecondaryLabel
      heroSecondaryLink
      storyEyebrow
      storyTitle
      storyDescription
      storyLinkLabel
      storyLink
      logoAsset {
        id
        name
        source
        mimeType
      }
      bannerAsset {
        id
        name
        source
        mimeType
      }
      storyAsset {
        id
        name
        source
        mimeType
      }
      categories {
        id
        name
        slug
        position
        productVariantCount
        featuredAsset {
          id
          name
          preview
          source
          mimeType
        }
        children {
          id
          name
          slug
          position
          productVariantCount
          featuredAsset {
            id
            name
            preview
            source
            mimeType
          }
        }
      }
    }
  }
`;

const HOMEPAGE_SECTIONS_QUERY = /* GraphQL */ `
  query BrandHomepageSections($input: HomepageDiscoveryInput) {
    homepageProductSections(input: $input) {
      code
      title
      description
      ctaLabel
      ctaLink
      productVariants {
        product {
          id
          name
          slug
          description
          featuredAsset {
            id
            name
            preview
            source
            mimeType
          }
          variants {
            id
            name
            currencyCode
            priceWithTax
            stockLevel
            customFields {
              isPopular
            }
            offerPricing {
              originalPrice
              offerPercentage
              sellingPrice
            }
          }
        }
      }
    }
  }
`;

const HOMEPAGE_CONFIGURATION_QUERY = /* GraphQL */ `
  query BrandHomepageConfiguration($brandSlug: String!) {
    homepageSettings(brandSlug: $brandSlug) {
      enabled
      heroEnabled
      categoryEnabled
      categoryEyebrow
      categoryTitle
      categoryDescription
      categoryLimit
      categoryCtaLabel
      categoryCtaLink
      storyEnabled
      valuesEnabled
      valuesEyebrow
      valuesTitle
      valuesDescription
      valuesCtaLabel
      valuesCtaLink
      valuesBackgroundAsset { id name source preview mimeType }
      valueItems {
        id
        position
        title
        description
        imageAsset { id name source preview mimeType }
      }
    }
    homepageVideo(brandSlug: $brandSlug) {
      id
      title
      description
      videos {
        id
        position
        videoAsset { id name source preview mimeType }
        product {
          id
          name
          slug
          featuredAsset { id name source preview mimeType }
          variants {
            id
            name
            currencyCode
            priceWithTax
            stockLevel
            customFields { isPopular }
            offerPricing { originalPrice offerPercentage sellingPrice }
          }
        }
      }
    }
    homepageMarketingSections(brandSlug: $brandSlug) {
      id code enabled position eyebrow title description secondaryDescription ctaLabel ctaLink
      backgroundAsset { id name source preview mimeType }
      foregroundAsset { id name source preview mimeType }
      logoAsset { id name source preview mimeType }
      items {
        id position title description ctaLabel ctaLink alignment
        imageAsset { id name source preview mimeType }
        iconAsset { id name source preview mimeType }
      }
    }
  }
`;

const PRODUCT_SEARCH_QUERY = /* GraphQL */ `
  query StorefrontProductSearch($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        productId
        slug
        productName
      }
    }
  }
`;

const STOREFRONT_CATEGORY_QUERY = /* GraphQL */ `
  query StorefrontCategory($slug: String!) {
    collection(slug: $slug) {
      id
      name
      slug
      description
      position
      productVariantCount
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
        featuredAsset { id name preview source mimeType }
      }
    }
  }
`;

const STOREFRONT_CATEGORIES_QUERY = /* GraphQL */ `
  query StorefrontCategories($options: CollectionListOptions) {
    collections(options: $options) {
      totalItems
      items {
        id
        name
        slug
        position
        productVariantCount
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

const STOREFRONT_CATEGORY_SEARCH_QUERY = /* GraphQL */ `
  query StorefrontCategorySearch($input: SearchInput!) {
    search(input: $input) {
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
        facetValueIds
        sku
        currencyCode
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
      collections {
        count
        collection {
          slug
        }
      }
      facetValues {
        count
        facetValue {
          id
          name
          facet {
            id
            name
          }
        }
      }
    }
  }
`;

const PRODUCT_CATEGORY_PRODUCTS_QUERY = /* GraphQL */ `
  query ProductCategoryProducts($collectionSlug: String!, $take: Int!) {
    productCategoryProducts(collectionSlug: $collectionSlug, take: $take) {
      id
      name
      slug
      description
      featuredAsset { id name preview source mimeType }
      variants {
        id
        name
        currencyCode
        priceWithTax
        stockLevel
        options { id name code }
        customFields { isPopular }
        offerPricing { originalPrice offerPercentage sellingPrice }
      }
      facetValues {
        id
        name
        facet { id name }
      }
    }
  }
`;

const STOREFRONT_PRODUCT_QUERY = /* GraphQL */ `
  query StorefrontProduct($slug: String!) {
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
        returnWindowDays
      }
      featuredAsset { id name preview source mimeType }
      assets { id name preview source mimeType }
      facetValues {
        id
        name
        code
        facet { id name code }
      }
      collections {
        id
        name
        slug
        breadcrumbs { id name slug }
      }
      variants {
        id
        name
        sku
        priceWithTax
        currencyCode
        stockLevel
        customFields { isPopular }
        offerPricing { originalPrice offerPercentage sellingPrice }
        featuredAsset { id name preview source mimeType }
        assets { id name preview source mimeType }
        options { id name code }
      }
    }
  }
`;

interface GraphQlError {
  message: string;
}

interface GraphQlResponse<T> {
  data?: T;
  errors?: GraphQlError[];
}

function getStoreApiUrl() {
  const endpoint =
    process.env.VENDURE_SHOP_API_URL ??
    process.env.NEXT_PUBLIC_VENDURE_API_URL;

  if (!endpoint) {
    throw new Error(
      "Set VENDURE_SHOP_API_URL or NEXT_PUBLIC_VENDURE_API_URL to the Vendure Shop API URL.",
    );
  }

  return endpoint;
}

async function requestStoreApi<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 300,
): Promise<T> {
  const channelToken =
    process.env.VENDURE_CHANNEL_TOKEN ??
    process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  const response = await fetch(getStoreApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(channelToken ? { "vendure-token": channelToken } : {}),
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate,
      tags: ["storefront-homepage"],
    },
  });

  if (!response.ok) {
    throw new Error(`Vendure Shop API returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as GraphQlResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(";"));
  }

  if (!payload.data) {
    throw new Error("Vendure Shop API returned no data.");
  }

  return payload.data;
}

function uniqueProducts(
  productVariants: Array<{ product: StoreProduct | null }>,
) {
  const products = new Map<string, StoreProduct>();

  for (const item of productVariants) {
    if (item.product && !products.has(item.product.id)) {
      products.set(item.product.id, {
        ...item.product,
        featuredAsset: normalizeAsset(item.product.featuredAsset),
      });
    }
  }

  return [...products.values()];
}

function normalizeAsset(asset?: StoreAsset | null): StoreAsset | null {
  if (!asset) return null;

  const normalizeUrl = (value?: string | null) => {
    if (!value) return value;
    const normalized = value.replaceAll("\\", "/");

    try {
      return new URL(normalized, getStoreApiUrl()).toString();
    } catch {
      return normalized;
    }
  };

  return {
    ...asset,
    source: normalizeUrl(asset.source) ?? asset.source,
    preview: normalizeUrl(asset.preview),
  };
}

function normalizeBrand(brand: StoreBrand): StoreBrand {
  return {
    ...brand,
    logoAsset: normalizeAsset(brand.logoAsset),
    bannerAsset: normalizeAsset(brand.bannerAsset),
    storyAsset: normalizeAsset(brand.storyAsset),
    categories: brand.categories.map((category) => ({
      ...category,
      featuredAsset: normalizeAsset(category.featuredAsset),
      children: category.children.map((child) => ({
        ...child,
        featuredAsset: normalizeAsset(child.featuredAsset),
      })),
    })),
  };
}

export async function getStorefrontBrands(): Promise<StoreBrand[]> {
  const response = await requestStoreApi<{ shopBrands: StoreBrand[] }>(
    BRANDS_QUERY,
  );

  return response.shopBrands.map(normalizeBrand).sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
}

export async function getStorefrontCategories(): Promise<StoreCategory[]> {
  const pageSize = 100;
  const getPage = (skip: number) =>
    requestStoreApi<{
      collections: { totalItems: number; items: StoreCategory[] };
    }>(
      STOREFRONT_CATEGORIES_QUERY,
      {
        options: {
          topLevelOnly: true,
          take: pageSize,
          skip,
        },
      },
      60,
    );
  const firstPage = await getPage(0);
  const pages = [firstPage.collections.items];

  for (let skip = pageSize; skip < firstPage.collections.totalItems; skip += pageSize) {
    const page = await getPage(skip);
    pages.push(page.collections.items);
  }

  return pages
    .flat()
    .map((category) => ({
      ...category,
      children: category.children ?? [],
    }))
    .sort(
      (left, right) =>
        left.position - right.position || left.name.localeCompare(right.name),
    );
}

export async function getStorefrontCatalog(
  categories: StoreCategory[],
): Promise<StorefrontCatalogData> {
  const collectionSlugs = categories.flatMap((category) => [
    category.slug,
    ...category.children.map((child) => child.slug),
  ]);
  type CatalogSearchResponse = {
    search: {
      totalItems: number;
      items: Array<{
        productId: string;
        productName: string;
        slug: string;
        description: string;
        productAsset?: { id: string; preview: string } | null;
        productVariantId: string;
        productVariantName: string;
        facetValueIds: string[];
        sku: string;
        currencyCode: string;
        offerPricing?: StoreProduct["variants"][number]["offerPricing"];
        priceWithTax:
          | { __typename: "SinglePrice"; value: number }
          | { __typename: "PriceRange"; min: number; max: number };
      }>;
      facetValues: Array<{
        count: number;
        facetValue: StorefrontFacetValue;
      }>;
    };
  };
  const pageSize = 100;
  const getPage = (skip: number) =>
    requestStoreApi<CatalogSearchResponse>(
      STOREFRONT_CATEGORY_SEARCH_QUERY,
      {
        input: {
          ...(collectionSlugs.length ? { collectionSlugs } : {}),
          groupByProduct: false,
          take: pageSize,
          skip,
        },
      },
      60,
    );
  const firstPage = await getPage(0);
  const additionalPages: CatalogSearchResponse[] = [];
  for (
    let firstSkip = pageSize;
    firstSkip < firstPage.search.totalItems;
    firstSkip += pageSize * 4
  ) {
    const skips = Array.from(
      {
        length: Math.min(
          4,
          Math.ceil((firstPage.search.totalItems - firstSkip) / pageSize),
        ),
      },
      (_, index) => firstSkip + index * pageSize,
    );
    additionalPages.push(...(await Promise.all(skips.map(getPage))));
  }
  const searchItems = [
    ...firstPage.search.items,
    ...additionalPages.flatMap((page) => page.search.items),
  ];
  const facetValuesById = new Map(
    firstPage.search.facetValues.map(({ count, facetValue }) => [
      facetValue.id,
      { ...facetValue, count },
    ]),
  );
  const productsById = new Map<string, StoreProduct>();

  for (const item of searchItems) {
    const priceRange =
      item.priceWithTax.__typename === "SinglePrice"
        ? {
            min: item.priceWithTax.value,
            max: item.priceWithTax.value,
          }
        : {
            min: item.priceWithTax.min,
            max: item.priceWithTax.max,
          };
    const productAsset = item.productAsset
      ? normalizeAsset({
          id: item.productAsset.id,
          source: item.productAsset.preview,
          preview: item.productAsset.preview,
        })
      : null;
    const product =
      productsById.get(item.productId) ??
      {
        id: item.productId,
        name: item.productName,
        slug: item.slug,
        description: item.description,
        featuredAsset: productAsset,
        facetValues: item.facetValueIds.flatMap((id) => {
          const value = facetValuesById.get(id);
          if (!value) return [];
          return [
            {
              id: value.id,
              name: value.name,
              facet: value.facet,
            },
          ];
        }),
        variants: [],
      };

    product.variants.push({
      id: item.productVariantId,
      name: item.productVariantName,
      sku: item.sku,
      currencyCode: item.currencyCode,
      priceWithTax: priceRange.min,
      priceRange,
      stockLevel: "UNKNOWN",
      offerPricing: item.offerPricing,
    });
    productsById.set(item.productId, product);
  }

  return {
    products: [...productsById.values()],
    facets: firstPage.search.facetValues.map(({ count, facetValue }) => ({
      ...facetValue,
      count,
    })),
    totalItems: productsById.size,
  };
}

export async function searchStorefrontProducts(
  term: string,
): Promise<StorefrontSearchResult[]> {
  const response = await requestStoreApi<{
    search: { items: StorefrontSearchResult[] };
  }>(PRODUCT_SEARCH_QUERY, {
    input: {
      term,
      take: 6,
      groupByProduct: true,
    },
  });

  return response.search.items;
}

export async function getStorefrontCategory(
  slug: string,
  take = 8,
): Promise<StorefrontCategoryPageData | null> {
  const { collection } = await requestStoreApi<{
    collection: StorefrontCategoryPageData["category"] | null;
  }>(STOREFRONT_CATEGORY_QUERY, { slug }, 60);

  if (!collection) return null;

  const [{ search: searchResults }, { productCategoryProducts }] = await Promise.all([
    requestStoreApi<{
      search: {
        totalItems: number;
        items: Array<{
          productId: string;
          productName: string;
          slug: string;
          description: string;
          productAsset?: { id: string; preview: string } | null;
          productVariantId: string;
          productVariantName: string;
          facetValueIds: string[];
          sku: string;
          currencyCode: string;
          offerPricing?: StoreProduct["variants"][number]["offerPricing"];
          priceWithTax:
            | { __typename: "SinglePrice"; value: number }
            | { __typename: "PriceRange"; min: number; max: number };
        }>;
        collections: Array<{
          count: number;
          collection: { slug: string };
        }>;
        facetValues: Array<{
          count: number;
          facetValue: StorefrontFacetValue;
        }>;
      };
    }>(
      STOREFRONT_CATEGORY_SEARCH_QUERY,
      {
        input: {
          collectionSlugs: [
            slug,
            ...collection.children.map((child) => child.slug),
          ],
          groupByProduct: true,
          take: 100,
          skip: 0,
        },
      },
      60,
    ),
    requestStoreApi<{ productCategoryProducts: StoreProduct[] }>(
      PRODUCT_CATEGORY_PRODUCTS_QUERY,
      { collectionSlug: slug, take },
      60,
    ),
  ]);

  const collectionCounts = new Map(
    searchResults.collections.map(({ count, collection: resultCollection }) => [
      resultCollection.slug,
      count,
    ]),
  );
  const categoryWithCounts = {
    ...collection,
    productVariantCount: searchResults.totalItems,
    children: collection.children.map((child) => ({
      ...child,
      productVariantCount: collectionCounts.get(child.slug) ?? 0,
      featuredAsset: normalizeAsset(child.featuredAsset),
    })),
  };
  const products: StoreProduct[] = productCategoryProducts;
  return {
    category: categoryWithCounts,
    products: products.map((product) => ({
      ...product,
      featuredAsset: normalizeAsset(product.featuredAsset),
    })),
    facets: searchResults.facetValues.map(({ count, facetValue }) => ({
      ...facetValue,
      count,
    })),
    totalItems: searchResults.totalItems,
  };
}

export async function getStorefrontProduct(
  slug: string,
): Promise<StorefrontProductDetail | null> {
  const { product } = await requestStoreApi<{
    product: StorefrontProductDetail | null;
  }>(STOREFRONT_PRODUCT_QUERY, { slug }, 60);

  if (!product || !product.enabled) return null;

  return {
    ...product,
    featuredAsset: normalizeAsset(product.featuredAsset),
    assets: (product.assets ?? [])
      .map(normalizeAsset)
      .filter((asset): asset is StoreAsset => Boolean(asset)),
    variants: (product.variants ?? []).map((variant) => ({
      ...variant,
      featuredAsset: normalizeAsset(variant.featuredAsset),
      assets: (variant.assets ?? [])
        .map(normalizeAsset)
        .filter((asset): asset is StoreAsset => Boolean(asset)),
    })),
  };
}

export async function getRelatedStorefrontProducts(
  product: StorefrontProductDetail,
  take = 4,
): Promise<StoreProduct[]> {
  const collection = product.collections.at(-1);
  if (!collection) return [];

  const category = await getStorefrontCategory(collection.slug);
  return (category?.products ?? [])
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, take);
}

async function getBrandProductSections(
  brandSlug: string,
): Promise<HomepageProductSection[]> {
  type HomepageSectionsResponse = {
    homepageProductSections: Array<{
      code: string;
      title: string;
      description?: string | null;
      ctaLabel?: string | null;
      ctaLink?: string | null;
      productVariants: Array<{ product: StoreProduct | null }>;
    }>;
  };

  const [configuredResponse, discoveryResponse] = await Promise.all([
    requestStoreApi<HomepageSectionsResponse>(HOMEPAGE_SECTIONS_QUERY, {
      input: {
        brandSlug,
        take: 8,
      },
    }),
    requestStoreApi<HomepageSectionsResponse>(
      HOMEPAGE_SECTIONS_QUERY,
      {
        input: {
          brandSlug,
          codes: ["all-products"],
          take: 8,
        },
      },
      300,
    ),
  ]);

  const sections = [
    ...configuredResponse.homepageProductSections,
    ...discoveryResponse.homepageProductSections,
  ];

  return [...new Map(sections.map((section) => [section.code, section])).values()]
    .map((section) => ({
      code: section.code,
      title: section.title,
      description: section.description,
      ctaLabel:
        section.ctaLabel ??
        (section.code === "all-products" ? "Explore All Products" : null),
      ctaLink:
        section.ctaLink ??
        (section.code === "all-products" ? "/categories" : null),
      products: uniqueProducts(section.productVariants),
    }))
    .filter((section) => section.products.length > 0);
}

async function getBrandHomepageConfiguration(brandSlug: string): Promise<{
  settings?: StoreHomepageSettings | null;
  video?: StoreHomepageVideo | null;
  marketingSections: StoreHomepageMarketingSection[];
}> {
  const response = await requestStoreApi<{
    homepageSettings?: StoreHomepageSettings | null;
    homepageVideo?: StoreHomepageVideo | null;
    homepageMarketingSections: StoreHomepageMarketingSection[];
  }>(HOMEPAGE_CONFIGURATION_QUERY, { brandSlug }, 0);

  const video = response.homepageVideo
    ? {
        ...response.homepageVideo,
        videos: response.homepageVideo.videos
          .slice()
          .sort((left, right) => left.position - right.position)
          .map((item) => ({
            ...item,
            videoAsset: normalizeAsset(item.videoAsset) ?? item.videoAsset,
            product: item.product
              ? {
                  ...item.product,
                  featuredAsset: normalizeAsset(item.product.featuredAsset),
                }
              : null,
          })),
      }
    : null;

  const settings = response.homepageSettings
    ? {
        ...response.homepageSettings,
        valuesBackgroundAsset: normalizeAsset(
          response.homepageSettings.valuesBackgroundAsset,
        ),
        valueItems: (response.homepageSettings.valueItems ?? [])
          .slice()
          .sort((left, right) => left.position - right.position)
          .map((item) => ({
            ...item,
            imageAsset: normalizeAsset(item.imageAsset),
          })),
      }
    : null;

  const marketingSections = (response.homepageMarketingSections ?? [])
    .slice()
    .sort((left, right) => left.position - right.position)
    .map((section) => ({
      ...section,
      backgroundAsset: normalizeAsset(section.backgroundAsset),
      foregroundAsset: normalizeAsset(section.foregroundAsset),
      logoAsset: normalizeAsset(section.logoAsset),
      items: (section.items ?? [])
        .slice()
        .sort((left, right) => left.position - right.position)
        .map((item) => ({
          ...item,
          imageAsset: normalizeAsset(item.imageAsset),
          iconAsset: normalizeAsset(item.iconAsset),
        })),
    }));

  return { settings, video, marketingSections };
}

export async function getBrandHomepage(
  requestedBrandSlug?: string,
): Promise<BrandHomepageData> {
  const brands = await getStorefrontBrands();

  if (!brands.length) {
    throw new Error("No enabled storefront brands were returned by Vendure.");
  }

  const selectedBrand =
    brands.find((brand) => brand.slug === requestedBrandSlug) ??
    brands.find((brand) => brand.featured) ??
    brands[0];
  const [productSections, configuration] = await Promise.all([
    getBrandProductSections(selectedBrand.slug),
    getBrandHomepageConfiguration(selectedBrand.slug),
  ]);

  return {
    brands,
    selectedBrand,
    settings: configuration.settings,
    productSections,
    video: configuration.video,
    marketingSections: configuration.marketingSections,
  };
}
