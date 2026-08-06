'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function OrderCard({ order, reviewedOrderIds, legacyReviewedProductIds }) {
  const router = useRouter();

  const key = order.status || order.uiStatus || 'on_the_way';
  const isDelivered = key === 'delivered';
  const firstProductId = order.items?.[0]?.product_id;
  const hasOrderReview = order.id && reviewedOrderIds?.has?.(order.id);
  const hasLegacyProductReview =
    firstProductId && legacyReviewedProductIds?.has?.(firstProductId);
  const hasReview = Boolean(hasOrderReview || hasLegacyProductReview);
  const showReviewCta = isDelivered && firstProductId;

  const statusConfig = {
    confirmed: {
      color: 'text-[#2C665E]',
      dot: 'bg-[#2C665E]',
      label: 'Order confirmed',
      message: 'Your order is being prepared',
      showReturn: false,
    },
    delivered: {
      color: 'text-green-600',
      dot: 'bg-green-600',
      label: order.deliveredDate
        ? `Delivered on ${order.deliveredDate}`
        : 'Delivered',
      message: 'Your item has been delivered',
      showReturn: true,
    },
    cancelled: {
      color: 'text-red-600',
      dot: 'bg-red-600',
      label: order.cancelDate
        ? `Cancelled on ${order.cancelDate}`
        : 'Cancelled',
      message: 'Your item has been cancelled',
      showReturn: false,
    },
    returned: {
      color: 'text-orange-500',
      dot: 'bg-orange-500',
      label: order.returnDate
        ? `Returned on ${order.returnDate}`
        : 'Returned',
      message: 'Your item has been returned',
      showReturn: false,
    },
    on_the_way: {
      color: 'text-blue-600',
      dot: 'bg-blue-600',
      label: order.expectedDelivery
        ? `Expected delivery ${order.expectedDelivery}`
        : 'In progress',
      message: 'Your item is on the way',
      showReturn: false,
    },
  };

  const status = statusConfig[key] || statusConfig.confirmed;
  const priceText =
    order.priceLabel != null
      ? order.priceLabel
      : `$${Number(order.price ?? 0).toFixed(2)}`;

  return (
    <div
      onClick={() => router.push(`/my-orders/${order.id}`)}
      className="cursor-pointer border border-[#CFE3DF] rounded-2xl p-4 flex items-center justify-between hover:shadow-sm"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="w-[60px] h-[60px] lg:w-[85px] lg:h-[85px] rounded-xl overflow-hidden">
          <Image
            src={order.image}
            alt={order.name}
            width={100}
            height={100}
            className="object-contain"
            unoptimized={
              typeof order.image === "string" && order.image.startsWith("http")
            }
          />
        </div>

        <div>
          <p className="font-medium text-[15px]">
            {order.name}
            {order.weight ? (
              <span className="text-gray-500"> — {order.weight}</span>
            ) : null}
          </p>

          {/* Mobile Status */}
          <p className={`text-sm lg:hidden ${status.color}`}>{status.label}</p>

          <p className="mt-1 text-xs text-gray-500 lg:hidden">
            Subtotal {order.subtotalDisplay} · Shipping {order.shippingDisplay} · Tax{" "}
            {order.taxDisplay}
          </p>

          <div className="hidden lg:block">
            <p className="text-sm text-gray-500 mt-1">Price:</p>
            <p className="font-semibold text-lg">{priceText}</p>
            <p className="mt-1 text-xs text-gray-500">
              Subtotal {order.subtotalDisplay} · Shipping {order.shippingDisplay} · Tax{" "}
              {order.taxDisplay}
            </p>
          </div>

          {showReviewCta ? (
            <div className="mt-2 lg:hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasReview) {
                    router.push('/my-reviews');
                  } else {
                    router.push(`/my-orders/${order.id}/review`);
                  }
                }}
                className="text-sm text-[#2C665E] hover:underline flex items-center gap-1"
              >
                {hasReview ? 'View your review' : 'Write a Review'}
                <span>›</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Desktop Right Section */}
      <div className="hidden lg:block text-right">
        <div className={`flex items-center justify-end gap-2 text-sm ${status.color}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
          {status.label}
        </div>

        <p className="text-xs text-gray-500 mt-1">{status.message}</p>

        <div className="flex items-center justify-end gap-3 mt-2 text-sm text-[#2C665E]">
          {status.showReturn && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/my-orders/${order.id}/return`);
                }}
                className="hover:underline cursor-pointer"
              >
                Return Order
              </button>
              <span className="text-gray-300">|</span>
            </>
          )}

          {showReviewCta ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (hasReview) {
                  router.push('/my-reviews');
                } else {
                  router.push(`/my-orders/${order.id}/review`);
                }
              }}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              {hasReview ? 'View your review' : 'Write a Review'}
              <span>›</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
