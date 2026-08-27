import { getCollectionBySlug, getProductDetails } from "@/graphql/queries/collections";
import { resolveAssetUrl } from '@/lib/assetUrl';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

const money = (value) => Number(value || 0) / 100;
const isRoot = (item) =>
  item?.slug === "__root_collection__" || item?.name === "__root_collection__";

function collectionPath(product) {
  const collection = [...(product.collections || [])]
    .sort((a, b) => (b.breadcrumbs?.length || 0) - (a.breadcrumbs?.length || 0))[0];
  const breadcrumbs = (collection?.breadcrumbs || []).filter((item) => !isRoot(item));
  const parent = breadcrumbs[0] || collection;
  const child = breadcrumbs.at(-1) || collection;
  return { parent, child };
}

function toDescriptionSection(value) {
  const bullet = String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!bullet) return null;

  const parts = bullet.match(/^(.+?)\s*(?:–|—|-|:)\s+(.+)$/);
  return parts
    ? { title: parts[1].trim(), description: parts[2].trim() }
    : { title: "", description: bullet };
}

function productGalleryAssets(product) {
  const variants = product.variants || [];
  const preferredVariant =
    variants.find((variant) => variant.customFields?.isPopular) ||
    variants.find((variant) => variant.stockLevel !== 'OUT_OF_STOCK') ||
    variants[0];
  const orderedVariants = preferredVariant
    ? [preferredVariant, ...variants.filter((variant) => variant.id !== preferredVariant.id)]
    : variants;
  const candidates = [
    product.featuredAsset,
    ...(product.assets || []),
    ...orderedVariants.flatMap((variant) => [variant.featuredAsset, ...(variant.assets || [])]),
  ];
  const seenUrls = new Set();

  return candidates.reduce((gallery, asset) => {
    const url = resolveAssetUrl(asset?.preview || asset?.source);
    if (!url || seenUrls.has(url)) return gallery;

    seenUrls.add(url);
    gallery.push({
      id: asset.id || url,
      url,
      alt: asset.name || product.name,
    });
    return gallery;
  }, []);
}

function toProductDetail(product) {
  const { parent, child } = collectionPath(product);
  const galleryAssets = productGalleryAssets(product);
  const thumbnail = galleryAssets[0]?.url || DEFAULT_IMAGE;
  const brand = product.facetValues?.find((value) => value.facet?.code === "organic-brand");
  const tags = (product.facetValues || [])
    .filter((value) => value.facet?.code !== "seeded-collection-membership")
    .map((value) => value.name);
  const description = (product.description || "").replace(/<[^>]*>/g, " ").trim();
  const aboutThisItem = Array.isArray(product.customFields?.aboutThisItem)
    ? product.customFields.aboutThisItem.map(toDescriptionSection).filter(Boolean)
    : [];
  const isVegetarian = product.customFields?.isVegetarian !== false;
  const isOrganic = product.customFields?.isOrganic !== false;

  return {
    id: product.id,
    title: product.name,
    name: product.name,
    handle: product.slug,
    slug: product.slug,
    thumbnail,
    images: galleryAssets,
    variants: (product.variants || []).map((variant, index) => {
      const price = money(variant.priceWithTax);
      const configuredOriginalPrice = money(variant.offerPricing?.originalPrice);
      const originalPrice = configuredOriginalPrice > price ? configuredOriginalPrice : price;

      return {
        id: variant.id,
        title: variant.options?.map((option) => option.name).join(" / ") || variant.name,
        label: variant.options?.map((option) => option.name).join(" / ") || variant.name,
        sku: variant.sku,
        price,
        original_price: originalPrice,
        discount:
          originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        currency: variant.currencyCode,
        in_stock: variant.stockLevel !== "OUT_OF_STOCK",
        inventory_quantity: variant.stockLevel === "OUT_OF_STOCK" ? 0 : 1,
        isDefault: index === 0,
        isPopular: Boolean(variant.customFields?.isPopular),
      };
    }),
    metadata: {
      quantity_type: "",
      description_sections: JSON.stringify(
        aboutThisItem.length > 0
          ? aboutThisItem
          : description
            ? [{ title: "About this product", description }]
            : []
      ),
    },
    specifications: {
      diet_type: isVegetarian ? "Vegetarian" : "",
      item_form: isOrganic ? "Organic" : "",
      is_vegetarian: isVegetarian,
      is_organic: isOrganic,
      brand: brand?.name || "",
    },
    tags,
    reviews_summary: { average_rating: 0, total_reviews: 0 },
    delivery_info: { estimated_label: "3-5 business days" },
    returns_policy: { window_days: 30, moneyBackGuarantee: true },
    shop_path: {
      category: parent?.slug,
      subcategory: child?.slug,
    },
    shop_categories: {
      parent: parent && { id: parent.id, name: parent.name, handle: parent.slug },
      child: child && { id: child.id, name: child.name, handle: child.slug },
    },
  };
}

export const getProductById = async (input) => {
  const productSlug = typeof input === "string" ? input : input?.productId;
  if (!productSlug) return { success: false };
  let product = await getProductDetails(productSlug);
  if (!product) return { success: false };

  // Older seeded products can be assigned through a category facet while their
  // `collections` field is empty. Resolve it so search results still open with
  // the correct canonical category and subcategory URL.
  if (!product.collections?.length) {
    const categoryFacetValue = product.facetValues?.find(
      (value) => value.facet?.code === "organic-category",
    );
    if (categoryFacetValue?.code) {
      const collection = await getCollectionBySlug(categoryFacetValue.code);
      if (collection) product = { ...product, collections: [collection] };
    }
  }

  return { success: true, data: { product: toProductDetail(product) } };
};
