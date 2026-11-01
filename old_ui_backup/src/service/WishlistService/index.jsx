import { shopApiRequest } from '@/lib/graphql/client';

const WISHLIST_PRODUCT_FRAGMENT = `
  fragment WishlistProductFields on WishlistProduct {
    id
    name
    slug
    preview
    variants {
      id
      name
      sku
      priceWithTax
      currencyCode
      preview
    }
  }
`;

const MY_WISHLIST = `
  ${WISHLIST_PRODUCT_FRAGMENT}
  query MyWishlist($skip: Int!, $take: Int!) {
    myWishlist(skip: $skip, take: $take) {
      totalItems
      items {
        id
        createdAt
        product { ...WishlistProductFields }
      }
    }
  }
`;

const MY_WISHLIST_PRODUCT_IDS = `
  query MyWishlistProductIds {
    myWishlistProductIds
  }
`;

const ADD_TO_WISHLIST = `
  ${WISHLIST_PRODUCT_FRAGMENT}
  mutation AddProductToWishlist($productId: ID!) {
    addProductToWishlist(productId: $productId) {
      success
      errorCode
      message
      item {
        id
        createdAt
        product { ...WishlistProductFields }
      }
    }
  }
`;

const REMOVE_FROM_WISHLIST = `
  mutation RemoveProductFromWishlist($productId: ID!) {
    removeProductFromWishlist(productId: $productId) {
      success
      errorCode
      message
    }
  }
`;

const CLEAR_WISHLIST = `
  mutation ClearMyWishlist {
    clearMyWishlist {
      success
      errorCode
      message
    }
  }
`;

export const fetchWishlistApi = async ({ page = 1, limit = 20 } = {}) => {
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedLimit = Math.max(1, Number(limit) || 20);
  const data = await shopApiRequest(MY_WISHLIST, {
    skip: (normalizedPage - 1) * normalizedLimit,
    take: normalizedLimit,
  });
  const wishlist = data?.myWishlist;
  const total = wishlist?.totalItems ?? 0;
  const totalPages = Math.ceil(total / normalizedLimit);

  return {
    success: true,
    data: {
      wishlist: wishlist?.items || [],
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total,
        total_pages: totalPages,
        has_next: normalizedPage < totalPages,
        has_prev: normalizedPage > 1,
      },
    },
  };
};

export const addToWishlistApi = async (productId) => {
  const data = await shopApiRequest(ADD_TO_WISHLIST, {
    productId: String(productId),
  });
  return data?.addProductToWishlist;
};

export const removeFromWishlistApi = async (productId) => {
  const data = await shopApiRequest(REMOVE_FROM_WISHLIST, {
    productId: String(productId),
  });
  return data?.removeProductFromWishlist;
};

export const clearWishlistApi = async () => {
  const data = await shopApiRequest(CLEAR_WISHLIST);
  return data?.clearMyWishlist;
};

export async function fetchAllWishlistProductIds() {
  const data = await shopApiRequest(MY_WISHLIST_PRODUCT_IDS);
  return new Set((data?.myWishlistProductIds || []).map(String));
}
