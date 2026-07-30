'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** @param {string} iso */
export function formatReviewDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const day = ordinal(d.getDate());
  const month = d.toLocaleString('en-GB', { month: 'long' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function ReviewCard({ review }) {
  const rating = Math.min(5, Math.max(0, Number(review?.rating) || 0));

  return (
    <article
      className="rounded-xl border border-[#E2EBE9] bg-white p-4 md:p-5 text-[#21252C]"
      style={{ padding: 16 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 shrink-0 ${
                i < rating ? 'text-[#1EA766] fill-[#1EA766]' : 'text-[#CFE3DF] fill-transparent'
              }`}
              strokeWidth={1.25}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>

      {review?.title ? <p className="text-sm font-semibold text-[#1F2937] mb-2">{review.title}</p> : null}

      {review?.content ? (
        <p className="text-sm leading-relaxed text-gray-700 mb-3">{review.content}</p>
      ) : null}

      {Array.isArray(review?.images) && review.images.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {review.images.map((src, idx) => (
            <div
              key={`${review.id}-img-${idx}`}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-[#E6EFEF] bg-gray-50"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={
                  typeof src === 'string' &&
                  (src.startsWith('data:') || src.startsWith('http://localhost'))
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-medium text-gray-900">{review?.user_name || 'Customer'}</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">{formatReviewDate(review?.created_at)}</span>
        {review?.is_verified_purchase ? (
          <>
            <span className="text-gray-300">•</span>
            <span className="text-[#1EA766] text-xs font-medium">Verified purchase</span>
          </>
        ) : null}
      </footer>
    </article>
  );
}
