import { getHomepageProductSections } from '@/graphql/queries/homepage';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

const DEALS_SECTION_CODE = 'deals';
const MAX_DEAL_PRODUCTS = 100;

const money = (value) => Number(value || 0) / 100;
const isRootCollection = (collection) =>
  collection?.slug === '__root_collection__' || collection?.name === '__root_collection__';
const isHomepageCollection = (collection) => collection?.slug?.startsWith('homepage-');

function productRoute(product) {
  const assignedCollection = [...(product?.collections || [])]
    .filter((collection) => !isRootCollection(collection) && !isHomepageCollection(collection))
    .sort(
      (left, right) =>
        (right.breadcrumbs?.length || 0) - (left.breadcrumbs?.length || 0),
    )[0];
  const breadcrumbs = (assignedCollection?.breadcrumbs || []).filter(
    (collection) => !isRootCollection(collection),
  );
  const parent = breadcrumbs[0] || assignedCollection;
  const child = breadcrumbs.at(-1) || assignedCollection;

  return {
    parent_category: {
      id: parent?.id || 'deals',
      name: parent?.name || 'Deals',
      handle: parent?.slug || 'deals',
    },
    subcategory: {
      id: child?.id || 'deals',
      name: child?.name || 'Deals',
      handle: child?.slug || 'deals',
    },
  };
}

function mapProduct(product) {
  const variants = (product?.variants || []).map((variant) => {
    const price = money(variant.priceWithTax ?? variant.price);
    const configuredOriginalPrice = money(variant.offerPricing?.originalPrice);
    const originalPrice = configuredOriginalPrice > price ? configuredOriginalPrice : price;

    return {
      id: variant.id,
      title: variant.options?.map((option) => option.name).join(' / ') || variant.name,
      label: variant.options?.map((option) => option.name).join(' / ') || variant.name,
      sku: variant.sku,
      price,
      original_price: originalPrice,
      discount:
        originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      currency: variant.currencyCode,
      in_stock: variant.stockLevel !== 'OUT_OF_STOCK',
    };
  });

  return {
    id: product.id,
    productId: product.id,
    handle: product.slug,
    slug: product.slug,
    title: product.name,
    description: '',
    thumbnail: product.featuredAsset?.preview || product.featuredAsset?.source || DEFAULT_IMAGE,
    rating: 0,
    reviews_count: 0,
    variants,
    ...productRoute(product),
  };
}

export async function getDealsData() {
  const sections = await getHomepageProductSections({
    take: MAX_DEAL_PRODUCTS,
    codes: [DEALS_SECTION_CODE],
  });
  const deals = sections.find((section) => section.code === DEALS_SECTION_CODE);

  if (!deals) return null;

  const seen = new Set();
  const products = (deals.productVariants || [])
    .map((variant) => variant.product)
    .filter((product) => product && !seen.has(product.id) && seen.add(product.id))
    .map(mapProduct)
    .filter((product) => product.variants.length > 0);

  return {
    id: deals.code,
    name: deals.title,
    slug: DEALS_SECTION_CODE,
    description: deals.description || '',
    products,
  };
}
