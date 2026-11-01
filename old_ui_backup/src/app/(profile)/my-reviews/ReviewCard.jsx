'use client';

import Image from 'next/image';
import RatingStars from '@/components/StarRating';
import useReviewsStore from '@/store/useReviewsStore';
import { DEFAULT_IMAGE } from '@/lib/defaultImage';

function formatReviewDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function statusBadge(status) {
  const s = status || 'approved';
  const map = {
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    pending: 'bg-amber-50 text-amber-900 border-amber-200',
    rejected: 'bg-red-50 text-red-800 border-red-200',
  };
  const cls = map[s] || 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-md border capitalize ${cls}`}>
      {s}
    </span>
  );
}

export default function ReviewCard({ review }) {
  const { openEditModal, openDeleteModal } = useReviewsStore();
  const thumb = review.product_thumbnail || DEFAULT_IMAGE;
  const ext = typeof thumb === 'string' && thumb.startsWith('http');

  return (
    <div className="border border-[#CFE3DF] rounded-xl p-4">
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-[50px] h-[50px] rounded-lg overflow-hidden shrink-0 bg-[#F1F8F7]">
            <Image
              src={thumb}
              alt={review.product_title || 'Product'}
              width={50}
              height={50}
              className="object-contain w-full h-full"
              unoptimized={ext}
            />
          </div>

          <div className="min-w-0">
            <p className="font-medium text-sm truncate">
              {review.product_title || 'Product'}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <RatingStars rating={review.rating} />
              {statusBadge(review.status)}
            </div>
          </div>
        </div>
      </div>

      {review.title ? (
        <p className="text-sm font-medium text-gray-800 mt-3">{review.title}</p>
      ) : null}

      {review.content ? (
        <p className="text-sm text-gray-600 mt-2">{review.content}</p>
      ) : null}

      {Array.isArray(review.images) && review.images.length > 0 ? (
        <div className="flex gap-2 mt-3 flex-wrap">
          {review.images.map((img, index) => (
            <div
              key={index}
              className="w-[60px] h-[60px] rounded-md overflow-hidden bg-[#F1F8F7]"
            >
              <Image
                src={img}
                alt=""
                width={60}
                height={60}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex justify-between items-center mt-4 text-sm gap-2 flex-wrap">
        <div className="text-gray-500 text-xs">
          {review.is_verified_purchase ? (
            <span className="text-[#2C665E] font-medium">Verified purchase · </span>
          ) : null}
          {formatReviewDate(review.created_at)}
        </div>

        <div className="flex gap-4 text-[#2C665E] shrink-0">
          <button
            type="button"
            onClick={() => openEditModal(review)}
            className="hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => openDeleteModal(review)}
            className="hover:underline text-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
