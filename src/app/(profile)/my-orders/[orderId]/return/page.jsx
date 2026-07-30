'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useOrdersStore from '@/store/useOrdersStore';
import Image from 'next/image';
import { Upload, ChevronRight } from 'lucide-react';
import OrderUpdatesModal from '../../components/OrderUpdatesModal';
import Breadcrumb from '@/components/ui/BreadCrumb';
import { createUserReturnApi } from '@/service/ReturnsService';
import { downloadMockInvoice } from '@/utils/downloadMockInvoice';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export default function ReturnOrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);

  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('Others');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showUpdates, setShowUpdates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const existing = useOrdersStore.getState().orders.find((o) => o.id === orderId);
        if (!existing) {
          await useOrdersStore.getState().fetchOrderById(orderId);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load order');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  const totalLineQty = useMemo(() => {
    const lines = order?.items || [];
    return lines.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  }, [order]);

  const contactLine = useMemo(() => {
    if (!order) return '';
    const addr = order.shipping_address;
    const phone = addr?.phone;
    return [phone, order.email].filter(Boolean).join(' / ');
  }, [order]);

  const priceText =
    order?.priceLabel != null
      ? order.priceLabel
      : `$${Number(order?.price ?? 0).toFixed(2)}`;

  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, [imagePreview]);

  const handleSubmit = async () => {
    if (!order) return;
    setError(null);
    setSubmitting(true);
    try {
      let image_base64;
      if (imageFile) {
        image_base64 = await readFileAsDataUrl(imageFile);
      }
      const items = (order.items || []).map((it) => ({
        item_id: it.id,
        quantity: Number(it.quantity) || 1,
        reason,
      }));
      const res = await createUserReturnApi({
        order_id: order.id,
        items,
        reason,
        note: message?.trim() || undefined,
        image_base64,
      });
      if (!res?.success) {
        throw new Error(res?.message || 'Return request failed');
      }
      router.push(`/my-orders?return=submitted`);
    } catch (e) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-gray-600 py-12 text-center">Loading order…</p>;
  }

  if (!order) {
    return <p className="text-gray-600 py-12 text-center">Order not found</p>;
  }

  if (order.status !== 'delivered') {
    return (
      <div className="text-red-600 font-medium py-8">
        Return is only available for delivered orders.
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'My Orders', href: '/my-orders' },
          { label: 'Order Details', href: `/my-orders/${orderId}` },
          { label: 'Return Order' },
        ]}
      />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="border border-[#CFE3DF] rounded-2xl p-5">
            <div className="flex gap-4 items-center pb-4 border-b">
              <div className="w-[85px] h-[85px] rounded-xl overflow-hidden relative shrink-0">
                <Image
                  src={order.image}
                  alt={order.name}
                  width={100}
                  height={100}
                  className="object-contain"
                  unoptimized={
                    typeof order.image === 'string' && order.image.startsWith('http')
                  }
                />
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  {order.name}
                  {order.weight ? ` — ${order.weight}` : ''}
                </h3>

                <p className="text-sm text-gray-500 mt-1">Order total</p>
                <p className="font-semibold text-lg">{order.totalDisplay || priceText}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <div>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                  Delivered on {order.deliveredDate || '—'}
                </div>

                <p className="text-xs text-gray-500 mt-1">Your item has been delivered</p>
              </div>

              <button
                type="button"
                onClick={() => setShowUpdates(true)}
                className="text-[#2C665E] text-sm flex items-center gap-1"
              >
                See All Updates
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Return Order</h2>

            {error ? (
              <p className="text-sm text-red-600 mb-4" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mb-4">
              <label className="text-sm text-gray-600">Select Reason for Return</label>

              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full mt-2 border border-[#CFE3DF] rounded-xl p-3 outline-none"
              >
                <option>Damaged Product</option>
                <option>Wrong Item Received</option>
                <option>Quality Issue</option>
                <option>Others</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600">Write Reason</label>

              <textarea
                placeholder="Type your reason"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-2 border border-[#CFE3DF] rounded-xl p-4 h-[120px] outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm text-gray-600 block mb-2">Upload Image (optional)</label>

              <label className="border border-[#CFE3DF] rounded-xl p-6 flex items-center justify-center gap-2 cursor-pointer text-gray-500 hover:bg-gray-50">
                <Upload size={18} />
                Select or drag a photo here
                <input type="file" accept="image/*" hidden onChange={handleUpload} />
              </label>

              {imagePreview ? (
                <div className="mt-3">
                  <Image
                    src={imagePreview}
                    alt="preview"
                    width={80}
                    height={80}
                    unoptimized
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-[#2C665E] flex items-center gap-1"
              >
                Cancel
                <ChevronRight size={16} />
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="bg-[#2C665E] text-white px-6 py-3 rounded-xl disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Return'}
              </button>
            </div>
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
                <span>
                  Subtotal ({totalLineQty} item{totalLineQty === 1 ? '' : 's'})
                </span>
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

              {order.discountDisplay &&
                order.discountDisplay !== '$0.00' &&
                order.discountDisplay !== '€0.00' && (
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
              className="w-full bg-[#2C665E] text-white mt-6 py-3 rounded-xl"
              onClick={() => downloadMockInvoice(order)}
            >
              Download Invoice (Excel)
            </button>
          </div>
        </div>
      </div>
      {showUpdates ? (
        <OrderUpdatesModal order={order} onClose={() => setShowUpdates(false)} />
      ) : null}
    </>
  );
}
