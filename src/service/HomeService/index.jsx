import {
  getHomepageProductSections,
  getTopCustomerReviews,
} from '@/graphql/queries/homepage';
import { getRecentlyViewedProductSlugs } from '@/lib/recentlyViewedProducts';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';
import { resolveAssetUrl } from '@/lib/assetUrl';

const money = (value) => Number(value || 0) / 100;
const isRootCollection = (collection) =>
  collection?.slug === '__root_collection__' || collection?.name === '__root_collection__';
const isHomepageCollection = (collection) => collection?.slug?.startsWith('homepage-');

function getProductPath(product, section) {
  const assignedCollection = [...(product?.collections || [])]
    .filter((collection) => !isRootCollection(collection) && !isHomepageCollection(collection))
    .sort(
      (left, right) =>
        (right.breadcrumbs?.length || 0) - (left.breadcrumbs?.length || 0),
    )[0];
  const breadcrumbs = (assignedCollection?.breadcrumbs || []).filter(
    (collection) => !isRootCollection(collection),
  );
  const fallback = { id: section.code, name: section.title, slug: section.code };
  const parent = breadcrumbs[0] || assignedCollection || fallback;
  const child = breadcrumbs.at(-1) || assignedCollection || fallback;

  return {
    parent_category: { id: parent.id, name: parent.name, handle: parent.slug },
    subcategory: { id: child.id, name: child.name, handle: child.slug },
  };
}

function mapProduct(product, section) {
  const variants = [...(product.variants || [])]
    .map((variant) => {
      const price = money(variant.priceWithTax ?? variant.price);
      const configuredOriginalPrice = money(variant.offerPricing?.originalPrice);
      const originalPrice = configuredOriginalPrice > price ? configuredOriginalPrice : price;

      return {
        id: variant.id,
        title: variant.options?.map((option) => option.name).join(' / ') || variant.name,
        sku: variant.sku,
        price,
        original_price: originalPrice,
        discount:
          originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        currency: variant.currencyCode,
        inventory_quantity: variant.stockLevel === 'OUT_OF_STOCK' ? 0 : 1,
        in_stock: variant.stockLevel !== 'OUT_OF_STOCK',
        isPopular: Boolean(variant.customFields?.isPopular),
      };
    })
    .sort((left, right) => Number(right.isPopular) - Number(left.isPopular));

  return {
    id: product.slug,
    productId: product.id,
    title: product.name,
    handle: product.slug,
    description: '',
    thumbnail: product.featuredAsset?.preview || product.featuredAsset?.source || DEFAULT_IMAGE,
    rating: 0,
    reviews_count: 0,
    variants,
    ...getProductPath(product, section),
  };
}

function mapSection(section) {
  const seen = new Set();
  const products = (section.productVariants || [])
    .map((variant) => variant.product)
    .filter((product) => product && !seen.has(product.id) && seen.add(product.id))
    .map((product) => mapProduct(product, section))
    .filter((product) => product.variants.length > 0);

  return {
    id: section.code,
    title: section.title,
    handle: section.code,
    description: section.description || '',
    products,
  };
}

function mapTestimonial(review) {
  const images = [
    ...(review.images || []).map((asset) => resolveAssetUrl(asset.preview || asset.source)),
    ...(review.legacyImages || []).map(resolveAssetUrl),
  ].filter(Boolean);

  return {
    id: String(review.id),
    name: review.customerName || 'Customer',
    comment: review.content,
    title: review.title,
    rating: Number(review.rating || 0),
    createdAt: review.createdAt,
    verifiedPurchase: Boolean(review.verifiedPurchase),
    productId: String(review.productId),
    productName: review.productName,
    productSlug: review.productSlug,
    productImage: resolveAssetUrl(review.productPreview) || DEFAULT_IMAGE,
    reviewImage: images[0] || null,
    images,
  };
}

export const getHomeData = async () => {
  const [sections, reviews] = await Promise.all([
    getHomepageProductSections({
      take: 8,
      recentlyViewedSlugs: getRecentlyViewedProductSlugs(),
    }),
    // A testimonial outage must not prevent product collections from loading.
    getTopCustomerReviews(10).catch(() => []),
  ]);

  return {
    success: true,
    data: {
      collections: sections.map(mapSection),
      testimonials: reviews.map(mapTestimonial),
      stats: null,
    },
  };
};
