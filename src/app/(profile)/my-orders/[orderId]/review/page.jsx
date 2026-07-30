'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useOrdersStore from '@/store/useOrdersStore';
import { submitUserReviewApi } from '@/service/ReviewsService';
import { loadOrderReviewLookup } from '@/lib/userReviewedProducts';
import Image from 'next/image';
import { Star, Camera } from 'lucide-react';
import Breadcrumb from '@/components/ui/BreadCrumb';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ReviewPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const orders = useOrdersStore((s) => s.orders);
  const fetchOrderById = useOrdersStore((s) => s.fetchOrderById);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const order = orders.find((o) => o.id === orderId);
  const line = order?.items?.[0];
  const productId = line?.product_id;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please choose an image file.');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setFormError('Image must be under 2.5 MB.');
      return;
    }
    setFormError(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
      : '/AppLogo.svg';

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
      let images = [];
      if (imageFile) {
        const dataUrl = await readFileAsDataUrl(imageFile);
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
          images = [dataUrl];
        }
      }

      const res = await submitUserReviewApi({
        product_id: productId,
        order_id: String(orderId),
        rating,
        title: title.trim() || undefined,
        content: review.trim(),
        is_verified_purchase: true,
        ...(images.length ? { images } : {}),
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
          <label className="text-sm text-gray-600 block mb-2">Upload Image</label>

          <label className="w-[60px] h-[60px] border border-[#CFE3DF] rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <Camera size={20} className="text-[#2C665E]" />

            <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
          </label>

          {imagePreview ? (
            <div className="mt-3">
              <Image src={imagePreview} alt="preview" width={80} height={80} className="rounded-lg" />
            </div>
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
