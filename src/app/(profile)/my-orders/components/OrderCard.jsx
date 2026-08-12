'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronRight, RotateCcw, Star } from 'lucide-react';

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
      color: 'text-green-700',
      dot: 'bg-green-500',
      label: order.deliveredDate ? `Delivered on ${order.deliveredDate}` : 'Delivered',
      message: 'Your item has been delivered',
      showReturn: true,
    },
    cancelled: {
      color: 'text-red-600',
      dot: 'bg-red-500',
      label: order.cancelDate ? `Cancelled on ${order.cancelDate}` : 'Cancelled',
      message: 'Your item has been cancelled',
      showReturn: false,
    },
    returned: {
      color: 'text-orange-600',
      dot: 'bg-orange-500',
      label: order.returnDate ? `Returned on ${order.returnDate}` : 'Returned',
      message: 'Your refund has been completed',
      showReturn: false,
    },
    on_the_way: {
      color: 'text-blue-600',
      dot: 'bg-blue-500',
      label: order.expectedDelivery
        ? `Expected delivery ${order.expectedDelivery}`
        : 'In progress',
      message: 'Your item is on the way',
      showReturn: false,
    },
  };

  const status = statusConfig[key] || statusConfig.confirmed;
  const returnWindowOpen = Boolean(status.showReturn && order.canReturn);
  const returnDeadlineLabel = order.returnDeadline
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(order.returnDeadline))
    : null;
  const priceText =
    order.priceLabel != null
      ? order.priceLabel
      : `$${Number(order.price ?? 0).toFixed(2)}`;

  const openReview = (event) => {
    event.stopPropagation();
    router.push(hasReview ? '/my-reviews' : `/my-orders/${order.id}/review`);
  };

  return (
    <article
      onClick={() => router.push(`/my-orders/${order.id}`)}
      className="group cursor-pointer rounded-2xl border border-[#D8E7E4] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9FC8C1] hover:shadow-[0_10px_30px_rgba(44,102,94,0.10)] sm:p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(245px,auto)] lg:items-center lg:gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F2F8F6] sm:h-24 sm:w-24">
            <Image
              src={order.image}
              alt={order.name}
              fill
              sizes="96px"
              className="object-contain p-2 transition-transform duration-200 group-hover:scale-105"
              unoptimized={
                typeof order.image === 'string' && order.image.startsWith('http')
              }
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 sm:text-[15px]">
              {order.name}
              {order.weight ? (
                <span className="font-normal text-gray-500"> - {order.weight}</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Order {order.display_id || order.id}
            </p>
            <p className="mt-2 text-lg font-bold text-gray-950">{priceText}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
              <span>Subtotal {order.subtotalDisplay}</span>
              <span>Shipping {order.shippingDisplay}</span>
              <span>Tax {order.taxDisplay}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E4EFED] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end">
            <div className="lg:text-right">
              <div
                className={`inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold ${status.color}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.label}
              </div>
              <p className="mt-2 text-xs text-gray-500">{status.message}</p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#2C665E] lg:hidden" />
          </div>

          {returnWindowOpen && (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#2C665E] lg:justify-end">
              <RotateCcw className="h-3.5 w-3.5" />
              Return available{returnDeadlineLabel ? ` until ${returnDeadlineLabel}` : ''}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 lg:justify-end">
            {returnWindowOpen && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/my-orders/${order.id}/return`);
                }}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#2C665E] px-4 py-2 text-sm font-semibold text-[#2C665E] transition-colors hover:bg-[#EAF4F2]"
              >
                <RotateCcw className="h-4 w-4" />
                Return Order
              </button>
            )}

            {showReviewCta && (
              <button
                type="button"
                onClick={openReview}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#2C665E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#214F49]"
              >
                <Star className="h-4 w-4" />
                {hasReview ? 'View Review' : 'Write Review'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
