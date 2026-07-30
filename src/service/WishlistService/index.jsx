import { wishlistMock } from "@/mocks/wishlistMock";

let items = wishlistMock.map((item) => ({
  product_id: item.id,
  product: {
    id: item.id,
    title: item.name,
    thumbnail: item.image,
    price_range: { min: item.price },
    discount_percentage: item.discount,
    variants: [{ title: item.weight }],
  },
}));

export const fetchWishlistApi = async ({ page = 1, limit = 20 } = {}) => {
  const start = (page - 1) * limit;
  const total = items.length;
  return {
    success: true,
    data: {
      wishlist: items.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: start + limit < total,
        has_prev: page > 1,
      },
    },
  };
};

export const addToWishlistApi = async (productId) => {
  if (!items.some((item) => item.product_id === productId)) {
    items = [
      ...items,
      {
        product_id: productId,
        product: {
          id: productId,
          title: "Organic Demo Product",
          thumbnail: "/AppLogo.png",
          price_range: { min: 12.49 },
          discount_percentage: 15,
          variants: [{ title: "500g" }],
        },
      },
    ];
  }
  return { success: true };
};

export const removeFromWishlistApi = async (productId) => {
  items = items.filter((item) => item.product_id !== productId);
  return { success: true };
};

export async function fetchAllWishlistProductIds() {
  return new Set(items.map((item) => item.product_id));
}
