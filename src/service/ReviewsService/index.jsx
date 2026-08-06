import { clearShopApiCache, shopApiRequest } from '@/lib/graphql/client';
import { resolveAssetUrl } from '@/lib/assetUrl';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

const REVIEW_FIELDS = `
  id createdAt updatedAt productId productName productSlug productPreview
  orderId orderCode rating title content
  images { id name mimeType fileSize source preview }
  legacyImages status verifiedPurchase moderationNote
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
  mutation SubmitProductReview($input: SubmitCustomerProductReviewInput!, $images: [Upload!]) {
    submitProductReview(input: $input, images: $images) {
      success errorCode message review { ${REVIEW_FIELDS} }
    }
  }
`;

const UPDATE_REVIEW = `
  mutation UpdateMyProductReview($input: UpdateCustomerProductReviewInput!, $images: [Upload!]) {
    updateMyProductReview(input: $input, images: $images) {
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
  const imageAssets = (review.images || []).map((asset) => ({
    ...asset,
    id: String(asset.id),
    url: resolveAssetUrl(asset.preview || asset.source),
  }));
  const legacyImages = (review.legacyImages || []).map((url) => resolveAssetUrl(url));
  return {
    id: String(review.id),
    product_id: String(review.productId),
    product_title: review.productName,
    product_handle: review.productSlug,
    product_thumbnail: review.productPreview || DEFAULT_IMAGE,
    order_id: String(review.orderId),
    order_code: review.orderCode,
    rating: review.rating,
    title: review.title,
    content: review.content,
    image_assets: imageAssets,
    legacy_image_urls: legacyImages,
    images: [...imageAssets.map((asset) => asset.url), ...legacyImages].filter(Boolean),
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

async function reviewUploadRequest(query, variables, files) {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
  if (!endpoint) throw new Error('Vendure Shop API URL is not configured.');

  const form = new FormData();
  form.append('operations', JSON.stringify({
    query,
    variables: { ...variables, images: files.map(() => null) },
  }));
  form.append('map', JSON.stringify(Object.fromEntries(
    files.map((_, index) => [String(index), [`variables.images.${index}`]]),
  )));
  files.forEach((file, index) => form.append(String(index), file, file.name));

  const token = sessionStorage.getItem('accessToken');
  const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(channelToken ? { 'vendure-token': channelToken } : {}),
    },
    body: form,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors?.length) {
    throw new Error(payload?.errors?.[0]?.message || 'Could not upload review images.');
  }
  clearShopApiCache();
  return payload?.data;
}

async function mutateReview(query, variables, files) {
  return files.length
    ? reviewUploadRequest(query, variables, files)
    : shopApiRequest(query, { ...variables, images: [] });
}

export const submitUserReviewApi = async (body) => {
  const files = Array.isArray(body.image_files) ? body.image_files : [];
  const data = await mutateReview(SUBMIT_REVIEW, {
    input: {
      productId: body.product_id,
      orderId: body.order_id,
      rating: Number(body.rating),
      title: body.title || null,
      content: body.content,
    },
  }, files);
  return result(data, 'submitProductReview');
};

export const patchUserReviewApi = async (reviewId, body) => {
  const files = Array.isArray(body.image_files) ? body.image_files : [];
  const data = await mutateReview(UPDATE_REVIEW, {
    input: {
      id: reviewId,
      rating: Number(body.rating),
      title: body.title || null,
      content: body.content,
      retainedImageIds: body.retained_image_ids || [],
    },
  }, files);
  return result(data, 'updateMyProductReview');
};

export const deleteUserReviewApi = async (reviewId) => {
  const data = await shopApiRequest(DELETE_REVIEW, { id: reviewId });
  const response = data.deleteMyProductReview;
  return { success: Boolean(response?.success), message: response?.message, errorCode: response?.errorCode };
};
