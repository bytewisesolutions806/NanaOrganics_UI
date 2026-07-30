import { getCollectionBySlug, getProductDetails } from "@/graphql/queries/collections";

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

function toProductDetail(product) {
  const { parent, child } = collectionPath(product);
  const assets = product.assets || [];
  const thumbnail =
    product.featuredAsset?.preview || assets[0]?.preview || "/AppLogo.svg";
  const brand = product.facetValues?.find((value) => value.facet?.code === "organic-brand");
  const tags = (product.facetValues || [])
    .filter((value) => value.facet?.code !== "seeded-collection-membership")
    .map((value) => value.name);
  const description = (product.description || "").replace(/<[^>]*>/g, " ").trim();

  return {
    id: product.id,
    title: product.name,
    name: product.name,
    handle: product.slug,
    slug: product.slug,
    thumbnail,
    images: assets.map((asset) => ({
      id: asset.id,
      url: asset.preview || asset.source,
      alt: asset.name || product.name,
    })),
    variants: (product.variants || []).map((variant, index) => ({
      id: variant.id,
      title: variant.options?.map((option) => option.name).join(" / ") || variant.name,
      label: variant.options?.map((option) => option.name).join(" / ") || variant.name,
      sku: variant.sku,
      price: money(variant.priceWithTax),
      original_price: money(variant.priceWithTax),
      currency: variant.currencyCode,
      in_stock: variant.stockLevel !== "OUT_OF_STOCK",
      inventory_quantity: variant.stockLevel === "OUT_OF_STOCK" ? 0 : 1,
      isDefault: index === 0,
      isPopular: Boolean(variant.customFields?.isPopular),
    })),
    metadata: {
      quantity_type: "",
      description_sections: JSON.stringify(
        description ? [{ title: "About this product", description }] : []
      ),
    },
    specifications: {
      diet_type: tags.find((tag) => /vegan|vegetarian|gluten/i.test(tag)) || "",
      item_form: tags.find((tag) => /organic/i.test(tag)) || "",
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
