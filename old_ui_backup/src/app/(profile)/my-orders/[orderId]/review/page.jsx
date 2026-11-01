'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useOrdersStore from '@/store/useOrdersStore';
import { submitUserReviewApi } from '@/service/ReviewsService';
import { loadOrderReviewLookup } from '@/lib/userReviewedProducts';
import Image from 'next/image';
import { Star, Camera, X } from 'lucide-react';
import Breadcrumb from '@/components/ui/BreadCrumb';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

export default function ReviewPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);
  const fetchOrderById = useOrdersStore((s) => s.fetchOrderById);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const previewUrls = useRef(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [reviewedOrderIds, setReviewedOrderIds] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const existing = useOrdersStore.getState().orders.find((o) => o.id === orderId);
      if (!existing) {
        const loaded = await fetchOrderById(orderId);
        if (!cancelled && !loaded) {
          setLoadError('Order not found');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, fetchOrderById]);

  useEffect(() => {
    loadOrderReviewLookup().then(({ orderIds }) => setReviewedOrderIds(orderIds));
  }, [orderId]);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  }, []);

  const order = orders.find((o) => o.id === orderId);
  const line = order?.items?.[0];
  const productId = line?.product_id;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (files.some((file) => !file.type.startsWith('image/'))) {
      setFormError('Please choose an image file.');
      return;
    }
    if (files.some((file) => file.size > 2.5 * 1024 * 1024)) {
      setFormError('Each image must be 2.5 MB or smaller.');
      return;
    }
    if (selectedImages.length + files.length > 4) {
      setFormError('You can upload up to 4 images.');
      return;
    }
    setFormError(null);
    const additions = files.map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      return { file, preview };
    });
    setSelectedImages((current) => [...current, ...additions]);
  };

  const removeImage = (preview) => {
    URL.revokeObjectURL(preview);
    previewUrls.current.delete(preview);
    setSelectedImages((current) => current.filter((item) => item.preview !== preview));
    setFormError(null);
  };

  if (loadError) {
    return <p className="text-gray-600 py-12 text-center">{loadError}</p>;
  }

  if (!order) {
    return <p className="text-gray-600 py-12 text-center">Loading order…</p>;
  }

  const orderStatusKey = order.status || order.uiStatus || 'on_the_way';
  if (orderStatusKey !== 'delivered') {
    return (
      <>
        <Breadcrumb
          items={[
            { label: 'My Orders', href: '/my-orders' },
            { label: 'Order Details', href: `/my-orders/${orderId}` },
            { label: 'Review' },
          ]}
        />
        <p className="text-gray-700 py-12 text-center max-w-xl">
          You can write a review after your order is delivered.
        </p>
      </>
    );
  }

  if (!productId) {
    return (
      <p className="text-gray-600 py-12 text-center">
        This order has no product linked for a review. Contact support if you need help.
      </p>
    );
  }

  const thumb =
    line?.thumbnail && (line.thumbnail.startsWith('http') || line.thumbnail.startsWith('/'))
      ? line.thumbnail
      : DEFAULT_IMAGE;

  const alreadyReviewed = orderId && reviewedOrderIds.has(String(orderId));

  const handleSubmit = async () => {
    setFormError(null);
    if (rating < 1 || rating > 5) {
      setFormError('Please choose a star rating.');
      return;
    }
    if (!review.trim()) {
      setFormError('Please write a short review.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitUserReviewApi({
        product_id: productId,
        order_id: String(orderId),
        rating,
        title: title.trim() || undefined,
        content: review.trim(),
        is_verified_purchase: true,
        image_files: selectedImages.map((item) => item.file),
      });

      if (!res?.success) {
        throw new Error(res?.message || 'Could not submit review');
      }

      router.push('/my-reviews');
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Could not submit review. Try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyReviewed) {
    return (
      <>
        <Breadcrumb
          items={[
            { label: 'My Orders', href: '/my-orders' },
            { label: 'Order Details', href: `/my-orders/${orderId}` },
            { label: 'Review' },
          ]}
        />
        <div className="max-w-4xl border border-[#CFE3DF] rounded-2xl p-6">
          <p className="text-gray-700 mb-4">
            You already submitted a review for this order. You can view or edit it from My Reviews.
          </p>
          <button
            type="button"
            onClick={() => router.push('/my-reviews')}
            className="bg-[#2C665E] text-white px-6 py-3 rounded-xl hover:bg-[#1e4c45]"
          >
            Go to My Reviews
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'My Orders', href: '/my-orders' },
          { label: 'Order Details', href: `/my-orders/${orderId}` },
          { label: 'Review' },
        ]}
      />
      <div className="max-w-4xl border border-[#CFE3DF] rounded-2xl p-6">
        <div className="flex gap-4 pb-6 border-b">
          <div className="w-[90px] h-[90px] rounded-xl overflow-hidden bg-[#F1F8F7] shrink-0">
            <Image
              src={thumb}
              alt={line?.title || order.name}
              width={100}
              height={100}
              className="object-contain w-full h-full"
              unoptimized={typeof thumb === 'string' && thumb.startsWith('http')}
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg">{line?.title || order.name}</h3>
            {order.items?.length > 1 ? (
              <p className="text-xs text-amber-800 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 inline-block">
                Review applies to the first item in this order ({order.items.length} items total).
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <p className="font-medium mb-3">Rate your experience</p>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={28}
                className={`cursor-pointer transition ${
                  star <= (hover || rating)
                    ? 'text-[#1EA766] fill-[#1EA766]'
                    : 'text-gray-300'
                }`}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm text-gray-600">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-2 border border-[#CFE3DF] rounded-xl p-3 outline-none text-sm"
            placeholder="Summarize your experience"
          />
        </div>

        <div className="mt-6">
          <label className="text-sm text-gray-600">Your review</label>

          <textarea
            placeholder="What did you like? What could be better?"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full mt-2 border border-[#CFE3DF] rounded-xl p-4 h-[120px] outline-none text-sm"
          />
        </div>

        <div className="mt-6">
          <label className="text-sm text-gray-600 block mb-2">
            Upload images <span className="text-gray-400">(up to 4)</span>
          </label>

          <div className="flex flex-wrap gap-3">
            {selectedImages.map(({ file, preview }) => (
              <div
                key={preview}
                className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border border-[#CFE3DF]"
              >
                <Image
                  src={preview}
                  alt={`Review image ${file.name}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(preview)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black/80"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {selectedImages.length < 4 ? (
              <label className="w-[72px] h-[72px] border border-dashed border-[#8CBAB3] rounded-xl flex flex-col gap-1 items-center justify-center cursor-pointer hover:bg-[#F1F8F7]">
                <Camera size={20} className="text-[#2C665E]" />
                <span className="text-[11px] text-[#2C665E]">Add photo</span>
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={submitting}
                />
              </label>
            ) : null}
          </div>

          {selectedImages.length ? (
            <p className="mt-2 text-xs text-gray-500">
              {selectedImages.length} of 4 images selected
            </p>
          ) : null}
        </div>

        {formError ? (
          <p className="text-sm text-red-600 mt-4" role="alert">
            {formError}
          </p>
        ) : null}

        <p className="text-xs text-gray-500 mt-4">
          Submitted reviews are published after a quick check by our team. You can edit or delete
          them anytime from My Reviews.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 bg-[#2C665E] text-white px-6 py-3 rounded-xl hover:bg-[#1e4c45] disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </>
  );
}
