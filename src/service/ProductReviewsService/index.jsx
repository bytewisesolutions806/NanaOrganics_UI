import { shopApiRequest } from '@/lib/graphql/client';
import { resolveAssetUrl } from '@/lib/assetUrl';

const PRODUCT_REVIEWS = `
  query ProductReviews(
    $productId: ID!
    $skip: Int!
    $take: Int!
    $rating: Int
    $sort: CustomerProductReviewSort
  ) {
    productReviews(
      productId: $productId
      skip: $skip
      take: $take
      rating: $rating
      sort: $sort
    ) {
      totalItems
      averageRating
      totalReviewCount
      items {
        id createdAt customerName rating title content
        images { id source preview }
        legacyImages verifiedPurchase
      }
    }
  }
`;

export async function fetchProductReviews({ productId, limit = 5, offset = 0, rating, sort = 'newest' }) {
  const sortMap = {
    newest: 'NEWEST',
    oldest: 'OLDEST',
    highest_rated: 'HIGHEST_RATED',
    lowest_rated: 'LOWEST_RATED',
  };
  const data = await shopApiRequest(PRODUCT_REVIEWS, {
    productId,
    skip: offset,
    take: limit,
    rating: rating ? Number(rating) : null,
    sort: sortMap[sort] || 'NEWEST',
  });
  const result = data.productReviews;
  const reviews = (result?.items || []).map((review) => ({
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

  const filteredTotal = Number(result?.totalItems || 0);
  return {
    success: true,
    data: {
      reviews,
      pagination: {
        total: filteredTotal,
        limit,
        offset,
        has_more: offset + reviews.length < filteredTotal,
      },
      stats: {
        average_rating: Number(result?.averageRating || 0),
        total_reviews: Number(result?.totalReviewCount || 0),
      },
    },
  };
}
