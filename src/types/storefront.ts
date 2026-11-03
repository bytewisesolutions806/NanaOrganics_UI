export interface StoreAsset {
  id: string;
  name?: string | null;
  source: string;
  preview?: string | null;
  mimeType?: string | null;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  productVariantCount: number;
  featuredAsset?: StoreAsset | null;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    position: number;
    productVariantCount: number;
    featuredAsset?: StoreAsset | null;
  }>;
}

export interface StoreBrand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  featured: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroEyebrow?: string | null;
  heroTitle?: string | null;
  heroDescription?: string | null;
  heroPrimaryLabel?: string | null;
  heroPrimaryLink?: string | null;
  heroSecondaryLabel?: string | null;
  heroSecondaryLink?: string | null;
  storyEyebrow?: string | null;
  storyTitle?: string | null;
  storyDescription?: string | null;
  storyLinkLabel?: string | null;
  storyLink?: string | null;
  logoAsset?: StoreAsset | null;
  bannerAsset?: StoreAsset | null;
  storyAsset?: StoreAsset | null;
  categories: StoreCategory[];
}

export interface StoreProductVariant {
  id: string;
  name: string;
  sku?: string;
  currencyCode: string;
  priceWithTax: number;
  priceRange?: {
    min: number;
    max: number;
  };
  stockLevel: string;
  featuredAsset?: StoreAsset | null;
  assets?: StoreAsset[];
  options?: Array<{
    id: string;
    name: string;
    code?: string | null;
  }>;
  customFields?: {
    isPopular?: boolean | null;
  } | null;
  offerPricing?: {
    originalPrice?: number | null;
    offerPercentage?: number | null;
    sellingPrice?: number | null;
  } | null;
}

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  featuredAsset?: StoreAsset | null;
  facetValues?: Array<{
    id: string;
    name: string;
    facet: {
      id: string;
      name: string;
    };
  }>;
  variants: StoreProductVariant[];
}

export interface StorefrontProductDetail extends StoreProduct {
  enabled: boolean;
  assets: StoreAsset[];
  customFields?: {
    aboutThisItem?: unknown;
    isVegetarian?: boolean | null;
    isOrganic?: boolean | null;
    returnWindowDays?: number | null;
  } | null;
  facetValues: Array<{
    id: string;
    name: string;
    code?: string | null;
    facet: {
      id: string;
      name: string;
      code?: string | null;
    };
  }>;
  collections: Array<{
    id: string;
    name: string;
    slug: string;
    breadcrumbs: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  }>;
}

export interface StorefrontProductReview {
  id: string;
  createdAt: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  images: StoreAsset[];
  legacyImages: string[];
  verifiedPurchase: boolean;
}

export interface StorefrontProductReviews {
  totalItems: number;
  averageRating: number;
  totalReviewCount: number;
  items: StorefrontProductReview[];
}

export interface StorefrontCategoryPage {
  id: string;
  name: string;
  slug: string;
  description: string;
  position: number;
  productVariantCount: number;
  breadcrumbs: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  children: StoreCategory["children"];
}

export interface StorefrontFacetValue {
  id: string;
  name: string;
  count: number;
  facet: {
    id: string;
    name: string;
  };
}

export interface StorefrontCategoryPageData {
  category: StorefrontCategoryPage;
  products: StoreProduct[];
  facets: StorefrontFacetValue[];
  totalItems: number;
}

export interface StorefrontCatalogData {
  products: StoreProduct[];
  facets: StorefrontFacetValue[];
  totalItems: number;
}

export interface StorefrontSearchResult {
  productId: string;
  slug: string;
  productName: string;
}

export interface HomepageProductSection {
  code: string;
  title: string;
  description?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  products: StoreProduct[];
}

export interface StoreHomepageSettings {
  enabled: boolean;
  heroEnabled: boolean;
  categoryEnabled: boolean;
  categoryEyebrow: string;
  categoryTitle: string;
  categoryDescription?: string | null;
  categoryLimit: number;
  categoryCtaLabel: string;
  categoryCtaLink: string;
  storyEnabled: boolean;
  valuesEnabled: boolean;
  valuesEyebrow: string;
  valuesTitle: string;
  valuesDescription?: string | null;
  valuesCtaLabel?: string | null;
  valuesCtaLink?: string | null;
  valuesBackgroundAsset?: StoreAsset | null;
  valueItems: StoreHomepageValueItem[];
}

export interface StoreHomepageValueItem {
  id: string;
  position: number;
  title: string;
  description?: string | null;
  imageAsset?: StoreAsset | null;
}

export interface StoreHomepageVideoItem {
  id: string;
  position: number;
  videoAsset: StoreAsset;
  product?: StoreProduct | null;
}

export interface StoreHomepageVideo {
  id: string;
  title: string;
  description?: string | null;
  videos: StoreHomepageVideoItem[];
}

export interface StoreHomepageMarketingItem {
  id: string;
  position: number;
  title: string;
  description?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  alignment?: "left" | "right" | "center" | null;
  imageAsset?: StoreAsset | null;
  iconAsset?: StoreAsset | null;
}

export interface StoreHomepageMarketingSection {
  id: string;
  code: "featured-product" | "ingredients" | "brand-banner" | "bundles";
  enabled: boolean;
  position: number;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  secondaryDescription?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  backgroundAsset?: StoreAsset | null;
  foregroundAsset?: StoreAsset | null;
  logoAsset?: StoreAsset | null;
  items: StoreHomepageMarketingItem[];
}

export interface BrandHomepageData {
  brands: StoreBrand[];
  selectedBrand: StoreBrand;
  settings?: StoreHomepageSettings | null;
  productSections: HomepageProductSection[];
  video?: StoreHomepageVideo | null;
  marketingSections: StoreHomepageMarketingSection[];
}
