import {
  getAllCollections,
  getCollectionBySlug,
} from "@/graphql/queries/collections";
import { DEFAULT_IMAGE } from '@/lib/defaultImage';
import { resolveAssetUrl } from '@/lib/assetUrl';

const toSubcategory = (collection) => ({
  id: collection.id,
  name: collection.name,
  handle: collection.slug,
  slug: collection.slug,
  position: collection.position,
  product_count: collection.productVariantCount || 0,
});

const toCategory = (collection) => ({
  id: collection.id,
  name: collection.name,
  handle: collection.slug,
  slug: collection.slug,
  position: collection.position,
  product_count: collection.productVariantCount || 0,
  image:
    resolveAssetUrl(
      collection.featuredAsset?.preview || collection.featuredAsset?.source,
    ) || DEFAULT_IMAGE,
  subcategories: (collection.children || [])
    .slice()
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map(toSubcategory),
});

export const getCategories = async () => {
  const result = await getAllCollections({
    topLevelOnly: true,
    skip: 0,
    take: 100,
    sort: { position: "ASC" },
  });

  return {
    success: true,
    data: {
      categories: (result?.items || []).map(toCategory),
      mega_menu: { items: [] },
    },
  };
};

export const getSubcategoriesByCategory = async (categoryHandle) => {
  if (!categoryHandle) {
    return { success: false, data: { category: null } };
  }

  const collection = await getCollectionBySlug(categoryHandle);
  const category = collection ? toCategory(collection) : null;

  return category
    ? { success: true, data: { category } }
    : { success: false, data: { category: null } };
};
