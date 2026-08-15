'use client';

import Image from 'next/image';
import { BadgeCheck, Star } from 'lucide-react';

function ordinal(number) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = number % 100;
  return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

export function formatReviewDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const day = ordinal(date.getDate());
  const month = date.toLocaleString('en-GB', { month: 'long' });
  return `${day} ${month} ${date.getFullYear()}`;
}

export default function ReviewCard({ review }) {
  const rating = Math.min(5, Math.max(0, Number(review?.rating) || 0));
  const customerName = review?.user_name || review?.customer_name || 'Customer';

  return (
    <article className="rounded-2xl border border-[#E2EBE9] bg-white p-4 text-[#21252C] transition-shadow hover:shadow-sm md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 shrink-0 ${
                  index < rating
                    ? 'fill-[#1EA766] text-[#1EA766]'
                    : 'fill-transparent text-[#CFE3DF]'
                }`}
                strokeWidth={1.25}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-600">{rating.toFixed(1)}</span>
        </div>
        {review?.is_verified_purchase ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF8F4] px-2.5 py-1 text-xs font-medium text-[#2C665E]">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified purchase
          </span>
        ) : null}
      </div>

      {review?.title ? (
        <h3 className="mb-2 text-base font-semibold text-[#1F2937]">{review.title}</h3>
      ) : null}
      {review?.content ? (
        <p className="mb-4 text-sm leading-relaxed text-gray-700">{review.content}</p>
      ) : null}

      {Array.isArray(review?.images) && review.images.length > 0 ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {review.images.map((source, index) => (
            <div
              key={`${review.id}-image-${index}`}
              className="relative aspect-square w-full overflow-hidden rounded-xl border border-[#E6EFEF] bg-gray-50 sm:h-24 sm:w-24"
            >
              <Image
                src={source}
                alt={`Review photo from ${customerName} ${index + 1}`}
                fill
                className="object-cover transition-transform duration-200 hover:scale-105"
                sizes="(max-width: 640px) 45vw, 96px"
                unoptimized={
                  typeof source === 'string' &&
                  (source.startsWith('data:') || source.startsWith('http://localhost'))
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#EDF2F1] pt-3 text-sm">
        <span className="font-semibold text-gray-900">{customerName}</span>
        <span className="text-gray-300">•</span>
        <span className="text-gray-500">{formatReviewDate(review?.created_at)}</span>
      </footer>
    </article>
  );
}
