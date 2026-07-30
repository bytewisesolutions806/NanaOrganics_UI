import { shopApiRequest } from '@/lib/graphql/client';

const REVIEW_FIELDS = `
  id createdAt updatedAt productId productName productSlug productPreview
  orderId orderCode rating title content images status verifiedPurchase moderationNote
`;

const MY_REVIEWS = `
  query MyProductReviews($skip: Int!, $take: Int!) {
    myProductReviews(skip: $skip, take: $take) {
      totalItems
      items { ${REVIEW_FIELDS} }
    }
  }
`;

const SUBMIT_REVIEW = `
  mutation SubmitProductReview($input: SubmitCustomerProductReviewInput!) {
    submitProductReview(input: $input) {
      success errorCode message review { ${REVIEW_FIELDS} }
    }
  }
`;

const UPDATE_REVIEW = `
  mutation UpdateMyProductReview($input: UpdateCustomerProductReviewInput!) {
    updateMyProductReview(input: $input) {
      success errorCode message review { ${REVIEW_FIELDS} }
    }
  }
`;

const DELETE_REVIEW = `
  mutation DeleteMyProductReview($id: ID!) {
    deleteMyProductReview(id: $id) { success errorCode message }
  }
`;

function mapReview(review) {
  if (!review) return null;
  return {
    id: String(review.id),
    product_id: String(review.productId),
    product_title: review.productName,
    product_handle: review.productSlug,
    product_thumbnail: review.productPreview || '/AppLogo.svg',
    order_id: String(review.orderId),
    order_code: review.orderCode,
    rating: review.rating,
    title: review.title,
    content: review.content,
    images: review.images || [],
    status: String(review.status || 'PENDING').toLowerCase(),
    is_verified_purchase: review.verifiedPurchase,
    moderation_note: review.moderationNote,
    helpful_count: 0,
    created_at: review.createdAt,
    updated_at: review.updatedAt,
  };
}

function result(response, key) {
  const value = response?.[key];
  if (!value?.success) {
    return { success: false, message: value?.message || 'Review request failed', errorCode: value?.errorCode };
  }
  return { success: true, message: value.message, data: { review: mapReview(value.review) } };
}

export const fetchUserReviewsApi = async ({ limit = 20, offset = 0 } = {}) => {
  const data = await shopApiRequest(MY_REVIEWS, { skip: offset, take: limit });
  return {
    success: true,
    data: {
      reviews: (data.myProductReviews?.items || []).map(mapReview),
      pagination: { total: data.myProductReviews?.totalItems || 0, limit, offset },
    },
  };
};

export const submitUserReviewApi = async (body) => {
  const data = await shopApiRequest(SUBMIT_REVIEW, {
    input: {
      productId: body.product_id,
      orderId: body.order_id,
      rating: Number(body.rating),
      title: body.title || null,
      content: body.content,
      images: body.images || [],
    },
  });
  return result(data, 'submitProductReview');
};

export const patchUserReviewApi = async (reviewId, body) => {
  const data = await shopApiRequest(UPDATE_REVIEW, {
    input: {
      id: reviewId,
      rating: Number(body.rating),
      title: body.title || null,
      content: body.content,
      images: body.images || [],
    },
  });
  return result(data, 'updateMyProductReview');
};

export const deleteUserReviewApi = async (reviewId) => {
  const data = await shopApiRequest(DELETE_REVIEW, { id: reviewId });
  const response = data.deleteMyProductReview;
  return { success: Boolean(response?.success), message: response?.message, errorCode: response?.errorCode };
};
