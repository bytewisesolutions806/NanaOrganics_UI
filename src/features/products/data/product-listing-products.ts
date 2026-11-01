import type { StoreProduct } from "@/types/storefront";

const productPhotos = {
  pickle:
    "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=720&q=85",
  almonds:
    "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=720&q=85",
  tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=720&q=85",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=720&q=85",
  honey:
    "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=720&q=85",
  turmeric:
    "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=720&q=85",
  cumin:
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=720&q=85",
  grains:
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=720&q=85",
  coconut:
    "https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=720&q=85",
};

function createProduct(
  id: string,
  name: string,
  slug: string,
  photo: string,
  sellingPrice: number,
  originalPrice: number,
): StoreProduct {
  return {
    id,
    name,
    slug,
    description: "Pure • Authentic • Traditionally valued",
    featuredAsset: {
      id: `${id}-asset`,
      source: photo,
      preview: photo,
    },
    variants: [
      {
        id: `${id}-500g`,
        name: "500g",
        currencyCode: "INR",
        priceWithTax: sellingPrice,
        stockLevel: "IN_STOCK",
        customFields: { isPopular: true },
        offerPricing: {
          originalPrice,
          offerPercentage: Math.round(
            ((originalPrice - sellingPrice) / originalPrice) * 100,
          ),
          sellingPrice,
        },
      },
      {
        id: `${id}-1kg`,
        name: "1kg",
        currencyCode: "INR",
        priceWithTax: sellingPrice * 2,
        stockLevel: "IN_STOCK",
      },
    ],
  };
}

export const PRODUCT_LISTING_PRODUCTS: StoreProduct[] = [
  createProduct(
    "coriander-pickle",
    "Coriander Pickle",
    "coriander-pickle",
    productPhotos.pickle,
    1249,
    1599,
  ),
  createProduct(
    "organic-almonds",
    "Organic Almonds",
    "organic-almonds",
    productPhotos.almonds,
    1249,
    1599,
  ),
  createProduct(
    "moringa-tea",
    "Moringa Tea",
    "moringa-tea",
    productPhotos.tea,
    1249,
    1599,
  ),
  createProduct(
    "mustard-oil",
    "Mustard Oil",
    "mustard-oil",
    productPhotos.oil,
    1399,
    1799,
  ),
  createProduct(
    "forest-honey",
    "Raw Forest Honey",
    "raw-forest-honey",
    productPhotos.honey,
    1499,
    1899,
  ),
  createProduct(
    "turmeric-powder",
    "Lakadong Turmeric",
    "lakadong-turmeric",
    productPhotos.turmeric,
    899,
    1199,
  ),
  createProduct(
    "cumin-seeds",
    "Whole Cumin Seeds",
    "whole-cumin-seeds",
    productPhotos.cumin,
    749,
    999,
  ),
  createProduct(
    "multigrain-atta",
    "Multigrain Atta",
    "multigrain-atta",
    productPhotos.grains,
    1099,
    1399,
  ),
  createProduct(
    "coconut-oil",
    "Cold Pressed Coconut Oil",
    "cold-pressed-coconut-oil",
    productPhotos.coconut,
    1599,
    1999,
  ),
];
