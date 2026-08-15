import { shopApiRequest } from '@/lib/graphql/client';
import { resolveAssetUrl } from '@/lib/assetUrl';

const PRODUCT_REVIEWS = `
  query ProductReviews($productId: ID!, $skip: Int!, $take: Int!) {
    productReviews(productId: $productId, skip: $skip, take: $take) {
      totalItems
      items {
        id createdAt customerName rating title content
        images { id source preview }
        legacyImages verifiedPurchase
      }
    }
  }
`;

export async function fetchProductReviews({ productId, limit = 5, offset = 0, rating, sort = 'newest' }) {
  const data = await shopApiRequest(PRODUCT_REVIEWS, { productId, skip: 0, take: 50 });
  let all = (data.productReviews?.items || []).map((review) => ({
    id: String(review.id),
    customer_name: review.customerName,
    user_name: review.customerName,
    rating: review.rating,
    title: review.title,
    content: review.content,
    images: [
      ...(review.images || []).map((asset) => resolveAssetUrl(asset.preview || asset.source)),
      ...(review.legacyImages || []).map(resolveAssetUrl),
    ].filter(Boolean),
    created_at: review.createdAt,
    is_verified_purchase: review.verifiedPurchase,
  }));

  if (rating) all = all.filter((review) => review.rating === Number(rating));
  all.sort((a, b) => {
    if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sort === 'highest_rated') return b.rating - a.rating;
    if (sort === 'lowest_rated') return a.rating - b.rating;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  const average = all.length
    ? all.reduce((sum, review) => sum + review.rating, 0) / all.length
    : 0;
  const reviews = all.slice(offset, offset + limit);
  return {
    success: true,
    data: {
      reviews,
      pagination: { total: all.length, limit, offset, has_more: offset + reviews.length < all.length },
      stats: { average_rating: average, total_reviews: all.length },
    },
  };
}
