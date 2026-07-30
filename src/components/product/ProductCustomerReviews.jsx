'use client';

import { useCallback, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { fetchProductReviews } from '@/service/ProductReviewsService';

const PAGE_SIZE = 5;
const RATING_FILTERS = [
  { label: 'All', value: null },
  { label: '5★', value: 5 },
  { label: '4★', value: 4 },
  { label: '3★', value: 3 },
  { label: '2★', value: 2 },
  { label: '1★', value: 1 },
];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Highest Rated', value: 'highest_rated' },
  { label: 'Lowest Rated', value: 'lowest_rated' },
];

function formatHappyCount(n) {
  if (n == null || Number.isNaN(Number(n))) return '0';
  return Number(n).toLocaleString('en-GB').replace(/,/g, ' ');
}

export default function ProductCustomerReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const load = useCallback(
    async (fromOffset, append) => {
      if (!productId) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await fetchProductReviews({
          productId,
          limit: PAGE_SIZE,
          offset: fromOffset,
          sort: sortBy,
          rating: selectedRating,
        });
        if (!res?.success) {
          throw new Error(res?.message || 'Could not load reviews');
        }
        const next = res.data?.reviews ?? [];
        const pag = res.data?.pagination;
        setStats(res.data?.stats ?? null);
        setReviews((prev) => (append ? [...prev, ...next] : next));
        setHasMore(Boolean(pag?.has_more));
        setOffset(fromOffset + next.length);
      } catch (e) {
        setError(e?.message || 'Something went wrong');
        if (!append) {
          setReviews([]);
          setStats(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [productId, selectedRating, sortBy]
  );

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setOffset(0);
    load(0, false);
  }, [productId, selectedRating, sortBy, load]);

  const handleReadMore = () => {
    if (!hasMore || loadingMore) return;
    load(offset, true);
  };

  if (!productId) return null;

  const avg = stats?.average_rating ?? 0;
  const total = stats?.total_reviews ?? 0;

  return (
    <section className="mt-12 md:mt-16 pb-4" aria-labelledby="customer-reviews-heading">
      <h2
        id="customer-reviews-heading"
        className="font-serif text-2xl md:text-4xl font-semibold text-[#21252C] mb-4"
      >
        Our Customer Reviews
      </h2>

      {loading ? (
        <p className="text-gray-600 text-sm py-8">Loading reviews…</p>
      ) : error ? (
        <p className="text-red-600 text-sm py-4" role="alert">
          {error}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-[#F5FAF8] border border-[#D9ECE4] rounded-lg px-3 py-2">
              <Star className="w-5 h-5 text-[#1EA766] fill-[#1EA766]" strokeWidth={1.25} />
              <span className="text-xl font-semibold text-[#21252C]">{avg.toFixed(1)}</span>
            </div>
            <span className="text-gray-600 text-sm md:text-base">
              {formatHappyCount(total)} customer reviews
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center mb-6">
            {RATING_FILTERS.map((filter) => {
              const isActive = selectedRating === filter.value;
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setSelectedRating(filter.value)}
                  className={`px-3 py-1.5 text-xs md:text-sm rounded-full border transition ${
                    isActive
                      ? 'bg-[#1EA766] text-white border-[#1EA766]'
                      : 'bg-white text-[#374151] border-[#D7E5E1] hover:border-[#1EA766]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}

            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-[#D7E5E1] rounded-lg px-3 py-1.5 text-sm text-[#374151] bg-white outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-gray-600 text-sm py-6 border border-dashed border-[#CFE3DF] rounded-2xl text-center">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {reviews.map((r) => (
                <li key={r.id}>
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
          )}

          {hasMore ? (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleReadMore}
                disabled={loadingMore}
                className="text-[#2C665E] font-semibold text-base underline-offset-4 hover:underline disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Read More Reviews'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
