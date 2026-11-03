import { getAuthHeaders } from "@/services/api/auth";

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface CustomerAddress {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  countryName: string;
  isDefault: boolean;
}

export interface AddressInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  isDefault: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  variantName: string;
  price: number;
  currencyCode: string;
  imageUrl: string;
}

export interface ReviewImage {
  id: string;
  url: string;
}

export interface CustomerReview {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPreview: string;
  orderId: string;
  orderCode: string;
  rating: number;
  title: string;
  content: string;
  images: ReviewImage[];
  legacyImages: string[];
  status: string;
  verifiedPurchase: boolean;
  moderationNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLine {
  id: string;
  quantity: number;
  unitPriceWithTax: number;
  linePriceWithTax: number;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  slug: string;
  imageUrl: string;
}

export interface OrderUpdate {
  id: string;
  label: string;
  date: string;
}

export interface CustomerOrder {
  id: string;
  code: string;
  state: string;
  status: "payment_pending" | "payment_failed" | "confirmed" | "on_the_way" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  orderPlacedAt: string;
  currencyCode: string;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  totalQuantity: number;
  lines: OrderLine[];
  shippingAddress: {
    fullName: string;
    streetLine1: string;
    streetLine2: string;
    city: string;
    province: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
  } | null;
  trackingCode: string;
  updates: OrderUpdate[];
}

export interface PageResult<T> {
  items: T[];
  totalItems: number;
}

export interface PublicProductReview {
  id: string;
  createdAt: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  images: Array<{ id: string; url: string }>;
  legacyImages: string[];
  verifiedPurchase: boolean;
}

export interface PublicProductReviews {
  totalItems: number;
  averageRating: number;
  totalReviewCount: number;
  items: PublicProductReview[];
}

const ADDRESS_FIELDS = `
  id fullName streetLine1 streetLine2 city province postalCode phoneNumber
  defaultShippingAddress defaultBillingAddress
  country { id code name }
`;

const REVIEW_FIELDS = `
  id createdAt updatedAt productId productName productSlug productPreview
  orderId orderCode rating title content
  images { id name mimeType fileSize source preview }
  legacyImages status verifiedPurchase moderationNote
`;

const ORDER_FIELDS = `
  id code state createdAt updatedAt orderPlacedAt currencyCode
  subTotalWithTax shippingWithTax totalWithTax totalQuantity
  shippingAddress {
    fullName streetLine1 streetLine2 city province postalCode countryCode phoneNumber
  }
  fulfillments { id state trackingCode createdAt updatedAt }
  history(options: { take: 100, sort: { createdAt: ASC } }) {
    items { id createdAt type data }
  }
  payments { id method state amount }
  lines {
    id quantity unitPriceWithTax linePriceWithTax discountedLinePriceWithTax
    featuredAsset { preview }
    productVariant {
      id name sku
      product { id name slug featuredAsset { preview } }
    }
  }
`;

function getEndpoint() {
  const endpoint = process.env.NEXT_PUBLIC_VENDURE_API_URL;
  if (!endpoint) throw new Error("NEXT_PUBLIC_VENDURE_API_URL is not configured.");
  return endpoint;
}

function channelHeaders(includeContentType = true): Record<string, string> {
  const channelToken = process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  return {
    ...(includeContentType ? { "content-type": "application/json" } : {}),
    ...(channelToken ? { "vendure-token": channelToken } : {}),
    ...getAuthHeaders(),
  };
}

async function accountRequest<TData, TVariables>(query: string, variables: TVariables) {
  const response = await fetch(getEndpoint(), {
    method: "POST",
    credentials: "include",
    headers: channelHeaders(),
    body: JSON.stringify({ query, variables }),
  });
  const payload = (await response.json()) as GraphQLResponse<TData>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || `Store API error (${response.status}).`);
  }
  if (!payload.data) throw new Error("The store API returned an empty response.");
  return payload.data;
}

function resolveAssetUrl(value?: string | null) {
  if (!value) return "";
  const normalized = value.replaceAll("\\", "/");
  if (/^(https?:|data:|blob:)/i.test(normalized)) return normalized;
  const path = normalized.replace(/^\/+/, "");
  try {
    const origin = new URL(getEndpoint()).origin;
    return `${origin}/${path.startsWith("assets/") ? path : `assets/${path}`}`;
  } catch {
    return `/${path}`;
  }
}

function splitName(fullName?: string | null) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || "", lastName: parts.join(" ") };
}

function mapAddress(address: Record<string, unknown>): CustomerAddress {
  const name = splitName(address.fullName as string);
  const country = address.country as { code?: string; name?: string } | undefined;
  return {
    id: String(address.id),
    ...name,
    phoneNumber: String(address.phoneNumber || ""),
    streetLine1: String(address.streetLine1 || ""),
    streetLine2: String(address.streetLine2 || ""),
    city: String(address.city || ""),
    province: String(address.province || ""),
    postalCode: String(address.postalCode || ""),
    countryCode: String(country?.code || "").toLowerCase(),
    countryName: String(country?.name || country?.code || ""),
    isDefault: Boolean(address.defaultShippingAddress || address.defaultBillingAddress),
  };
}

function addressInput(input: AddressInput, id?: string) {
  return {
    ...(id ? { id } : {}),
    fullName: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
    streetLine1: input.streetLine1.trim(),
    streetLine2: input.streetLine2.trim(),
    city: input.city.trim(),
    province: input.province.trim(),
    postalCode: input.postalCode.trim(),
    countryCode: input.countryCode.toUpperCase(),
    phoneNumber: input.phoneNumber.trim() || null,
    defaultShippingAddress: input.isDefault,
    defaultBillingAddress: input.isDefault,
  };
}

export async function getCustomerAddresses() {
  const data = await accountRequest<{
    activeCustomer: { addresses: Array<Record<string, unknown>> } | null;
  }, Record<string, never>>(
    `query CustomerAddresses { activeCustomer { id addresses { ${ADDRESS_FIELDS} } } }`,
    {},
  );
  if (!data.activeCustomer) throw new Error("You are not currently authorized to view addresses.");
  return data.activeCustomer.addresses.map(mapAddress);
}

export async function createCustomerAddress(input: AddressInput) {
  const data = await accountRequest<{ createCustomerAddress: Record<string, unknown> }, { input: ReturnType<typeof addressInput> }>(
    `mutation CreateCustomerAddress($input: CreateAddressInput!) {
      createCustomerAddress(input: $input) { ${ADDRESS_FIELDS} }
    }`,
    { input: addressInput(input) },
  );
  return mapAddress(data.createCustomerAddress);
}

export async function updateCustomerAddress(id: string, input: AddressInput) {
  const data = await accountRequest<{ updateCustomerAddress: Record<string, unknown> }, { input: ReturnType<typeof addressInput> }>(
    `mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
      updateCustomerAddress(input: $input) { ${ADDRESS_FIELDS} }
    }`,
    { input: addressInput(input, id) },
  );
  return mapAddress(data.updateCustomerAddress);
}

export async function deleteCustomerAddress(id: string) {
  const data = await accountRequest<{ deleteCustomerAddress: { success: boolean } }, { id: string }>(
    `mutation DeleteCustomerAddress($id: ID!) { deleteCustomerAddress(id: $id) { success } }`,
    { id },
  );
  if (!data.deleteCustomerAddress.success) throw new Error("Could not delete the address.");
}

interface WishlistRow {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    preview?: string;
    variants: Array<{ id: string; name: string; sku: string; priceWithTax: number; currencyCode: string; preview?: string }>;
  };
}

function mapWishlist(row: WishlistRow): WishlistItem {
  const variants = row.product.variants || [];
  const variant = [...variants].sort((a, b) => a.priceWithTax - b.priceWithTax)[0];
  return {
    id: String(row.id),
    productId: String(row.product.id),
    name: row.product.name,
    slug: row.product.slug,
    variantName: variant?.name || variant?.sku || "",
    price: Number(variant?.priceWithTax || 0),
    currencyCode: variant?.currencyCode || "INR",
    imageUrl: resolveAssetUrl(row.product.preview || variant?.preview),
  };
}

export async function getWishlist(page = 1, take = 10): Promise<PageResult<WishlistItem>> {
  const skip = (Math.max(1, page) - 1) * take;
  const data = await accountRequest<{ myWishlist: { totalItems: number; items: WishlistRow[] } }, { skip: number; take: number }>(
    `query MyWishlist($skip: Int!, $take: Int!) {
      myWishlist(skip: $skip, take: $take) {
        totalItems
        items { id product { id name slug preview variants { id name sku priceWithTax currencyCode preview } } }
      }
    }`,
    { skip, take },
  );
  return { totalItems: data.myWishlist.totalItems, items: data.myWishlist.items.map(mapWishlist) };
}

export async function getWishlistProductIds() {
  const data = await accountRequest<{ myWishlistProductIds: string[] }, Record<string, never>>(
    `query MyWishlistProductIds { myWishlistProductIds }`,
    {},
  );
  return new Set((data.myWishlistProductIds || []).map(String));
}

export async function addWishlistProduct(productId: string) {
  const data = await accountRequest<{ addProductToWishlist: { success: boolean; message?: string } }, { productId: string }>(
    `mutation AddProductToWishlist($productId: ID!) {
      addProductToWishlist(productId: $productId) { success message }
    }`,
    { productId },
  );
  if (!data.addProductToWishlist.success) {
    throw new Error(data.addProductToWishlist.message || "Could not add the product to your wishlist.");
  }
}

export async function removeWishlistProduct(productId: string) {
  const data = await accountRequest<{ removeProductFromWishlist: { success: boolean; message?: string } }, { productId: string }>(
    `mutation RemoveProductFromWishlist($productId: ID!) {
      removeProductFromWishlist(productId: $productId) { success message }
    }`,
    { productId },
  );
  if (!data.removeProductFromWishlist.success) throw new Error(data.removeProductFromWishlist.message || "Could not remove the item.");
}

export async function clearWishlist() {
  const data = await accountRequest<{ clearMyWishlist: { success: boolean; message?: string } }, Record<string, never>>(
    `mutation ClearMyWishlist { clearMyWishlist { success message } }`,
    {},
  );
  if (!data.clearMyWishlist.success) throw new Error(data.clearMyWishlist.message || "Could not clear the wishlist.");
}

export async function getPublicProductReviews(
  productId: string,
  options: {
    skip?: number;
    take?: number;
    rating?: number;
    sort?: "NEWEST" | "OLDEST" | "HIGHEST_RATED" | "LOWEST_RATED";
  } = {},
): Promise<PublicProductReviews> {
  const variables = {
    productId,
    skip: options.skip ?? 0,
    take: options.take ?? 5,
    rating: options.rating ?? null,
    sort: options.sort ?? "NEWEST",
  };
  const data = await accountRequest<{
    productReviews: {
      totalItems: number;
      averageRating: number;
      totalReviewCount: number;
      items: Array<{
        id: string;
        createdAt: string;
        customerName: string;
        rating: number;
        title?: string | null;
        content: string;
        images?: Array<{ id: string; source?: string; preview?: string }>;
        legacyImages?: string[];
        verifiedPurchase: boolean;
      }>;
    };
  }, typeof variables>(
    `query ProductReviews($productId: ID!, $skip: Int!, $take: Int!, $rating: Int, $sort: CustomerProductReviewSort) {
      productReviews(productId: $productId, skip: $skip, take: $take, rating: $rating, sort: $sort) {
        totalItems averageRating totalReviewCount
        items {
          id createdAt customerName rating title content
          images { id source preview }
          legacyImages verifiedPurchase
        }
      }
    }`,
    variables,
  );
  return {
    ...data.productReviews,
    items: data.productReviews.items.map((review) => ({
      id: String(review.id),
      createdAt: review.createdAt,
      customerName: review.customerName || "Nana Organics customer",
      rating: review.rating,
      title: review.title || "",
      content: review.content,
      images: (review.images ?? []).map((image) => ({
        id: String(image.id),
        url: resolveAssetUrl(image.preview || image.source),
      })),
      legacyImages: (review.legacyImages ?? []).map(resolveAssetUrl),
      verifiedPurchase: review.verifiedPurchase,
    })),
  };
}

interface ReviewResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  productId: string;
  productName: string;
  productSlug: string;
  productPreview: string;
  orderId: string;
  orderCode: string;
  rating: number;
  title?: string;
  content: string;
  images?: Array<{ id: string; source?: string; preview?: string }>;
  legacyImages?: string[];
  status?: string;
  verifiedPurchase: boolean;
  moderationNote?: string;
}

function mapReview(review: ReviewResponse): CustomerReview {
  return {
    id: String(review.id),
    productId: String(review.productId),
    productName: review.productName,
    productSlug: review.productSlug,
    productPreview: resolveAssetUrl(review.productPreview),
    orderId: String(review.orderId || ""),
    orderCode: review.orderCode || "",
    rating: review.rating,
    title: review.title || "",
    content: review.content,
    images: (review.images || []).map((image) => ({ id: String(image.id), url: resolveAssetUrl(image.preview || image.source) })),
    legacyImages: (review.legacyImages || []).map(resolveAssetUrl),
    status: String(review.status || "PENDING").toLowerCase(),
    verifiedPurchase: review.verifiedPurchase,
    moderationNote: review.moderationNote || "",
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export async function getCustomerReviews(page = 1, take = 10): Promise<PageResult<CustomerReview>> {
  const skip = (Math.max(1, page) - 1) * take;
  const data = await accountRequest<{ myProductReviews: { totalItems: number; items: ReviewResponse[] } }, { skip: number; take: number }>(
    `query MyProductReviews($skip: Int!, $take: Int!) {
      myProductReviews(skip: $skip, take: $take) { totalItems items { ${REVIEW_FIELDS} } }
    }`,
    { skip, take },
  );
  return { totalItems: data.myProductReviews.totalItems, items: data.myProductReviews.items.map(mapReview) };
}

interface ReviewMutationResult {
  success: boolean;
  message?: string;
  review?: ReviewResponse;
}

export async function updateCustomerReview(
  reviewId: string,
  input: { rating: number; title: string; content: string; retainedImageIds: string[] },
  files: File[] = [],
) {
  const mutation = `mutation UpdateMyProductReview($input: UpdateCustomerProductReviewInput!, $images: [Upload!]) {
    updateMyProductReview(input: $input, images: $images) { success message review { ${REVIEW_FIELDS} } }
  }`;
  const variables = { input: { id: reviewId, rating: input.rating, title: input.title || null, content: input.content, retainedImageIds: input.retainedImageIds } };
  let result: ReviewMutationResult;

  if (files.length) {
    const form = new FormData();
    form.append("operations", JSON.stringify({ query: mutation, variables: { ...variables, images: files.map(() => null) } }));
    form.append("map", JSON.stringify(Object.fromEntries(files.map((_, index) => [String(index), [`variables.images.${index}`]]))));
    files.forEach((file, index) => form.append(String(index), file, file.name));
    const response = await fetch(getEndpoint(), { method: "POST", credentials: "include", headers: channelHeaders(false), body: form });
    const payload = (await response.json()) as GraphQLResponse<{ updateMyProductReview: ReviewMutationResult }>;
    if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.[0]?.message || "Could not update the review.");
    result = payload.data?.updateMyProductReview || { success: false };
  } else {
    const data = await accountRequest<{ updateMyProductReview: ReviewMutationResult }, typeof variables & { images: never[] }>(mutation, { ...variables, images: [] });
    result = data.updateMyProductReview;
  }
  if (!result.success || !result.review) throw new Error(result.message || "Could not update the review.");
  return mapReview(result.review);
}

export async function submitCustomerReview(
  input: { productId: string; orderId: string; rating: number; title: string; content: string },
  files: File[] = [],
) {
  const mutation = `mutation SubmitProductReview($input: SubmitCustomerProductReviewInput!, $images: [Upload!]) {
    submitProductReview(input: $input, images: $images) { success message review { ${REVIEW_FIELDS} } }
  }`;
  const variables = {
    input: {
      productId: input.productId,
      orderId: input.orderId,
      rating: input.rating,
      title: input.title || null,
      content: input.content,
    },
  };
  let result: ReviewMutationResult;
  if (files.length) {
    const form = new FormData();
    form.append("operations", JSON.stringify({ query: mutation, variables: { ...variables, images: files.map(() => null) } }));
    form.append("map", JSON.stringify(Object.fromEntries(files.map((_, index) => [String(index), [`variables.images.${index}`]]))));
    files.forEach((file, index) => form.append(String(index), file, file.name));
    const response = await fetch(getEndpoint(), { method: "POST", credentials: "include", headers: channelHeaders(false), body: form });
    const payload = (await response.json()) as GraphQLResponse<{ submitProductReview: ReviewMutationResult }>;
    if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.[0]?.message || "Could not submit the review.");
    result = payload.data?.submitProductReview || { success: false };
  } else {
    const data = await accountRequest<{ submitProductReview: ReviewMutationResult }, typeof variables & { images: never[] }>(mutation, { ...variables, images: [] });
    result = data.submitProductReview;
  }
  if (!result.success || !result.review) throw new Error(result.message || "Could not submit the review.");
  return mapReview(result.review);
}

export async function deleteCustomerReview(id: string) {
  const data = await accountRequest<{ deleteMyProductReview: { success: boolean; message?: string } }, { id: string }>(
    `mutation DeleteMyProductReview($id: ID!) { deleteMyProductReview(id: $id) { success message } }`,
    { id },
  );
  if (!data.deleteMyProductReview.success) throw new Error(data.deleteMyProductReview.message || "Could not delete the review.");
}

interface OrderResponse {
  id: string;
  code: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  orderPlacedAt?: string;
  currencyCode: string;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  totalQuantity: number;
  shippingAddress?: CustomerOrder["shippingAddress"];
  fulfillments?: Array<{ state: string; trackingCode?: string; createdAt: string; updatedAt: string }>;
  history?: { items: Array<{ id: string; createdAt: string; type: string; data?: Record<string, string> }> };
  payments?: Array<{ state: string; method: string }>;
  lines: Array<{
    id: string; quantity: number; unitPriceWithTax: number; linePriceWithTax: number; discountedLinePriceWithTax: number;
    featuredAsset?: { preview?: string };
    productVariant: { id: string; name: string; sku: string; product: { id: string; name: string; slug: string; featuredAsset?: { preview?: string } } };
  }>;
}

function orderStatus(order: OrderResponse): CustomerOrder["status"] {
  if (order.state === "Cancelled") return "cancelled";
  if (order.state === "Delivered" || order.fulfillments?.some((item) => item.state === "Delivered")) return "delivered";
  if (["Shipped", "PartiallyShipped", "PartiallyDelivered"].includes(order.state)) return "on_the_way";
  if (["PaymentSettled", "PaymentAuthorized", "ArrangingPayment"].includes(order.state)) return "confirmed";
  if (order.payments?.length && order.payments.every((payment) => ["Declined", "Cancelled", "Error"].includes(payment.state))) return "payment_failed";
  return "payment_pending";
}

function historyLabel(entry: { type: string; data?: Record<string, string> }) {
  const to = entry.data?.to;
  if (entry.type === "ORDER_NOTE") return entry.data?.note || entry.data?.message || "Order update";
  if (to === "PaymentSettled") return "Payment received";
  if (to === "PaymentAuthorized") return "Payment authorized";
  if (to === "Shipped") return "Order shipped";
  if (to === "Delivered") return "Order delivered";
  if (to === "Cancelled") return "Order cancelled";
  return to ? to.replace(/([a-z])([A-Z])/g, "$1 $2") : "Order updated";
}

function mapOrder(order: OrderResponse): CustomerOrder {
  return {
    id: String(order.id),
    code: order.code,
    state: order.state,
    status: orderStatus(order),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    orderPlacedAt: order.orderPlacedAt || order.createdAt,
    currencyCode: order.currencyCode,
    subTotalWithTax: order.subTotalWithTax,
    shippingWithTax: order.shippingWithTax,
    totalWithTax: order.totalWithTax,
    totalQuantity: order.totalQuantity,
    shippingAddress: order.shippingAddress || null,
    trackingCode: order.fulfillments?.find((item) => item.trackingCode)?.trackingCode || "",
    updates: (order.history?.items || []).map((entry) => ({ id: entry.id, label: historyLabel(entry), date: entry.createdAt })),
    lines: order.lines.map((line) => ({
      id: String(line.id), quantity: line.quantity, unitPriceWithTax: line.unitPriceWithTax,
      linePriceWithTax: line.discountedLinePriceWithTax || line.linePriceWithTax,
      productId: String(line.productVariant.product.id), variantId: String(line.productVariant.id),
      productName: line.productVariant.product.name, variantName: line.productVariant.name,
      sku: line.productVariant.sku, slug: line.productVariant.product.slug,
      imageUrl: resolveAssetUrl(line.featuredAsset?.preview || line.productVariant.product.featuredAsset?.preview),
    })),
  };
}

export async function getCustomerOrders() {
  const data = await accountRequest<{ activeCustomer: { orders: { items: OrderResponse[] } } | null }, Record<string, never>>(
    `query CustomerOrders { activeCustomer { orders(options: { take: 100, sort: { createdAt: DESC } }) { items { ${ORDER_FIELDS} } } } }`,
    {},
  );
  if (!data.activeCustomer) throw new Error("You are not currently authorized to view orders.");
  return data.activeCustomer.orders.items.map(mapOrder);
}

export async function getCustomerOrder(id: string) {
  const data = await accountRequest<{ order: OrderResponse | null }, { id: string }>(
    `query CustomerOrder($id: ID!) { order(id: $id) { ${ORDER_FIELDS} } }`,
    { id },
  );
  return data.order ? mapOrder(data.order) : null;
}

export function formatMoney(amount: number, currencyCode = "INR") {
  try {
    return new Intl.NumberFormat(currencyCode === "INR" ? "en-IN" : "en-US", { style: "currency", currency: currencyCode }).format(amount / 100);
  } catch {
    return `${currencyCode} ${(amount / 100).toFixed(2)}`;
  }
}
