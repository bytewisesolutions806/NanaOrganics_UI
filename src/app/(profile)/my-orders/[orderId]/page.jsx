'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useOrdersStore from '@/store/useOrdersStore';
import Image from 'next/image';
import Breadcrumb from '@/components/ui/BreadCrumb';
import OrderUpdatesModal from '../components/OrderUpdatesModal';
import { loadOrderReviewLookup } from '@/lib/userReviewedProducts';
import { downloadMockInvoice } from '@/utils/downloadMockInvoice';
import { fetchUserReturnsApi } from '@/service/ReturnsService';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

export default function OrderDetailsPage() {
  const router = useRouter();
  const { orderId } = useParams();
  const orders = useOrdersStore((s) => s.orders);

  const [showUpdates, setShowUpdates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(() => new Set());
  const [legacyReviewedProductIds, setLegacyReviewedProductIds] = useState(
    () => new Set()
  );
  const [returnRequest, setReturnRequest] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await useOrdersStore.getState().fetchOrderById(orderId, { force: true });
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    fetchUserReturnsApi({ limit: 100, offset: 0 })
      .then((response) => {
        const request = (response.data?.returns || []).find(
          (item) => String(item.order_id) === String(orderId)
        );
        setReturnRequest(request || null);
      })
      .catch(() => setReturnRequest(null));
  }, [orderId]);

  useEffect(() => {
    const refreshOrder = () => {
      useOrdersStore.getState().fetchOrderById(orderId, { force: true });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshOrder();
    };
    window.addEventListener('focus', refreshOrder);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', refreshOrder);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { orderIds, legacyProductIds } = await loadOrderReviewLookup();
      if (!cancelled) {
        setReviewedOrderIds(orderIds);
        setLegacyReviewedProductIds(legacyProductIds);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const onFocus = () => {
      loadOrderReviewLookup().then(({ orderIds, legacyProductIds }) => {
        setReviewedOrderIds(orderIds);
        setLegacyReviewedProductIds(legacyProductIds);
      });
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const order = useMemo(
    () => orders.find((o) => o.id === orderId),
    [orders, orderId]
  );

  const statusKey = order?.status || order?.uiStatus || 'on_the_way';

  const statusConfig = {
    confirmed: {
      color: 'text-[#2C665E]',
      dot: 'bg-[#2C665E]',
      title: 'Order confirmed',
      message: 'Your order is being prepared',
    },
    delivered: {
      color: 'text-green-600',
      dot: 'bg-green-600',
      title: order?.deliveredDate
        ? `Delivered on ${order.deliveredDate}`
        : 'Delivered',
      message: 'Your item has been delivered',
    },
    cancelled: {
      color: 'text-red-600',
      dot: 'bg-red-600',
      title: order?.cancelDate
        ? `Cancelled on ${order.cancelDate}`
        : 'Cancelled',
      message: 'Your item has been cancelled',
    },
    returned: {
      color: 'text-orange-500',
      dot: 'bg-orange-500',
      title: order?.returnDate
        ? `Returned on ${order.returnDate}`
        : 'Returned',
      message: 'Your item has been returned',
    },
    on_the_way: {
      color: 'text-blue-600',
      dot: 'bg-blue-600',
      title: order?.expectedDelivery
        ? `Expected delivery ${order.expectedDelivery}`
        : 'In progress',
      message: 'Your item is on the way',
    },
  };

  if (loading) {
    return (
      <p className="text-gray-600 py-12 text-center">Loading order…</p>
    );
  }

  if (!order) {
    return <p className="text-gray-600 py-12 text-center">Order not found</p>;
  }

  const status = statusConfig[statusKey] || statusConfig.confirmed;
  const timeline =
    order.timeline?.length > 0
      ? order.timeline
      : [
          { label: `Order Confirmed, ${order.confirmedDate || '—'}` },
          { label: status.title },
        ];

  const priceText =
    order.priceLabel != null
      ? order.priceLabel
      : `$${Number(order.price ?? 0).toFixed(2)}`;

  const firstProductId = order.items?.[0]?.product_id;
  const isDelivered = statusKey === 'delivered';
  const hasOrderReview = order.id && reviewedOrderIds.has(order.id);
  const hasLegacyProductReview =
    firstProductId && legacyReviewedProductIds.has(firstProductId);
  const hasReview = Boolean(hasOrderReview || hasLegacyProductReview);
  const showReviewCta = isDelivered && firstProductId;

  const addr = order.shipping_address;
  const contactLine = [addr?.phone, order.email].filter(Boolean).join(' / ');

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'My Orders', href: '/my-orders' },
          { label: `Order #${order.display_id ?? order.id?.slice(-8) ?? ''}` },
        ]}
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="border border-[#CFE3DF] rounded-2xl p-6">
            <div className="flex gap-4 mb-6">
              <div className="w-[90px] h-[90px] rounded-xl overflow-hidden relative shrink-0">
                <Image
                  src={order.image}
                  alt={order.name}
                  width={100}
                  height={100}
                  className="object-contain"
                  unoptimized={
                    typeof order.image === 'string' &&
                    order.image.startsWith('http')
                  }
                />
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  {order.name}
                  {order.weight ? ` — ${order.weight}` : ''}
                </h3>

                <p className="text-sm text-gray-500 mt-1">Total</p>
                <p className="font-semibold text-lg">{priceText}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`flex items-center gap-2 text-sm ${status.color}`}>
                    <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                    {status.title}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">{status.message}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUpdates(true)}
                  className="text-[#2C665E] text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  See All Updates
                  <span className="text-lg">›</span>
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {timeline.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full border border-green-600 flex items-center justify-center text-green-600">
                      ✓
                    </div>

                    {index !== timeline.length - 1 && (
                      <div className="w-[2px] h-8 bg-green-600 mt-1" />
                    )}
                  </div>

                  <p className="text-sm">{step.label}</p>
                </div>
              ))}
            </div>

            {order.tracking && (
              <div className="mt-6 rounded-xl bg-[#F1F8F7] p-4 text-sm">
                <h4 className="font-semibold text-gray-900">Shipment tracking</h4>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 text-gray-600">
                  <p><span className="font-medium text-gray-800">Status:</span> {order.tracking.state || 'Preparing'}</p>
                  <p><span className="font-medium text-gray-800">Method:</span> {order.tracking.method || 'Standard Delivery'}</p>
                  {order.tracking.code && (
                    <p className="sm:col-span-2"><span className="font-medium text-gray-800">Tracking code:</span> {order.tracking.code}</p>
                  )}
                </div>
              </div>
            )}

            {order.adminNotes?.length > 0 && (
              <div className="mt-6 border-t pt-5">
                <h4 className="font-semibold text-gray-900">Updates from the seller</h4>
                <div className="mt-3 space-y-3">
                  {order.adminNotes.map((note) => (
                    <div key={note.id} className="rounded-xl border border-[#CFE3DF] bg-white p-4">
                      <p className="text-sm text-gray-700">{note.description}</p>
                      <p className="mt-1 text-xs text-gray-400">{note.date}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-400">Only notes marked visible to the customer are shown here.</p>
              </div>
            )}

            {returnRequest && (
              <div className="mt-6 rounded-xl border border-[#CFE3DF] bg-[#F1F8F7] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-gray-900">Return request</h4>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-[#2C665E]">
                    {returnRequest.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{returnRequest.reason}</p>
                {returnRequest.admin_note && (
                  <p className="mt-3 rounded-lg bg-white p-3 text-sm text-gray-700">
                    <span className="font-medium">Seller response:</span>{' '}
                    {returnRequest.admin_note}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 border border-[#CFE3DF] rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="font-semibold text-lg">Items in this order</h3>
              <p className="text-sm text-gray-500">Order #{order.display_id}</p>
            </div>
            <div className="divide-y divide-[#E6EFEF]">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <Image
                      src={item.thumbnail || DEFAULT_IMAGE}
                      alt={item.title || 'Product'}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                      unoptimized={typeof item.thumbnail === 'string' && item.thumbnail.startsWith('http')}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    {item.variant_title && <p className="text-sm text-gray-500">{item.variant_title}</p>}
                    <p className="mt-1 text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: String(order.currency_code || 'USD').toUpperCase() }).format(Number(item.total || 0) / 100)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            {order.status === 'delivered' && !returnRequest && (
              <button
                type="button"
                onClick={() => router.push(`/my-orders/${order.id}/return`)}
                className="border border-[#2C665E] text-[#2C665E] px-6 py-2 rounded-lg cursor-pointer"
              >
                Return Order
              </button>
            )}

            {showReviewCta ? (
              <button
                type="button"
                onClick={() =>
                  hasReview
                    ? router.push('/my-reviews')
                    : router.push(`/my-orders/${order.id}/review`)
                }
                className="border border-[#2C665E] text-[#2C665E] px-6 py-2 rounded-lg cursor-pointer"
              >
                {hasReview ? 'View your review' : 'Write a Review'}
              </button>
            ) : null}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[#E6EFEF] rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Delivery details</h3>

            <p className="text-sm text-gray-600 whitespace-pre-line">
              {order.deliveryAddressStr?.trim()
                ? order.deliveryAddressStr
                : 'No shipping address on file for this order.'}
            </p>

            {contactLine ? (
              <p className="text-sm mt-3">
                Contact
                <br />
                {contactLine}
              </p>
            ) : null}

            <hr className="my-4" />

            <h3 className="font-semibold mb-4">Price details</h3>

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{order.subtotalDisplay ?? '—'}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shippingDisplay ?? '—'}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>{order.taxDisplay ?? '—'}</span>
              </div>

              {order.taxLines?.map((tax, index) => (
                <div
                  key={`${tax.description || 'tax'}-${tax.rate}-${index}`}
                  className="flex justify-between gap-3 pl-3 text-xs text-gray-500"
                >
                  <span>
                    {tax.description || 'Tax'}{tax.rate != null ? ` (${tax.rate}%)` : ''}
                    {tax.baseDisplay ? ` on ${tax.baseDisplay}` : ''}
                  </span>
                  <span>{tax.amountDisplay}</span>
                </div>
              ))}

              {Number(order.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount</span>
                    <span>- {order.discountDisplay}</span>
                  </div>
                )}

              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span>{order.totalDisplay ?? priceText}</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-[#2C665E] text-white mt-6 py-3 rounded-lg"
              onClick={() => downloadMockInvoice(order)}
            >
              Download Invoice (Excel)
            </button>
          </div>
        </div>
      </div>

      {showUpdates && (
        <OrderUpdatesModal order={order} onClose={() => setShowUpdates(false)} />
      )}
    </>
  );
}
