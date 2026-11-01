"use client";

import Image from "next/image";
import { CheckCircle2, Star } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getPublicProductReviews,
  type PublicProductReviews,
} from "@/services/api/account";

const emptyReviews: PublicProductReviews = {
  totalItems: 0,
  averageRating: 0,
  totalReviewCount: 0,
  items: [],
};

function Stars({ rating, label }: { rating: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={label ?? `${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={`size-4 ${index < Math.round(rating) ? "fill-[#f2b84b] text-[#f2b84b]" : "fill-[#e6ebe7] text-[#e6ebe7]"}`}
        />
      ))}
    </span>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<PublicProductReviews>(emptyReviews);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState<"NEWEST" | "OLDEST" | "HIGHEST_RATED" | "LOWEST_RATED">("NEWEST");
  const [visible, setVisible] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      getPublicProductReviews(productId, {
        take: visible,
        rating: rating || undefined,
        sort,
      })
        .then((result) => {
          if (active) setReviews(result);
        })
        .catch((reason: unknown) => {
          if (active) setError(reason instanceof Error ? reason.message : "Reviews are unavailable right now.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [productId, rating, sort, visible]);

  return (
    <section id="customer-reviews" className="mx-auto max-w-[1240px] px-5 py-14 sm:px-8 lg:py-20" aria-labelledby="reviews-title">
      <div className="flex flex-col justify-between gap-6 border-b border-[#dbe6dd] pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#67b84d]">Real experiences</p>
          <h2 id="reviews-title" className="mt-2 font-serif text-3xl font-semibold text-[#26342d] sm:text-4xl">Customer Reviews</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#53635a]">
            <strong className="text-2xl text-[#26342d]">{reviews.averageRating.toFixed(1)}</strong>
            <Stars rating={reviews.averageRating} />
            <span>{reviews.totalReviewCount} verified reviews</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            aria-label="Filter reviews by rating"
            value={rating}
            onChange={(event) => { setRating(Number(event.target.value)); setVisible(5); }}
            className="h-11 rounded-lg border border-[#cbd9cf] bg-white px-3 text-sm text-[#34483c] outline-none focus:ring-2 focus:ring-[#68bd45]"
          >
            <option value={0}>All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </select>
          <select
            aria-label="Sort reviews"
            value={sort}
            onChange={(event) => { setSort(event.target.value as typeof sort); setVisible(5); }}
            className="h-11 rounded-lg border border-[#cbd9cf] bg-white px-3 text-sm text-[#34483c] outline-none focus:ring-2 focus:ring-[#68bd45]"
          >
            <option value="NEWEST">Newest first</option>
            <option value="OLDEST">Oldest first</option>
            <option value="HIGHEST_RATED">Highest rated</option>
            <option value="LOWEST_RATED">Lowest rated</option>
          </select>
        </div>
      </div>

      {loading && reviews.items.length === 0 ? (
        <div className="grid gap-4 py-8 sm:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl bg-[#f1f6f2]" />)}
        </div>
      ) : error ? (
        <p role="alert" className="py-10 text-sm text-red-700">{error}</p>
      ) : reviews.items.length ? (
        <>
          <div className="grid gap-5 py-8 lg:grid-cols-2">
            {reviews.items.map((review) => (
              <article key={review.id} className="rounded-2xl border border-[#dbe6dd] bg-white p-6 shadow-[0_8px_30px_rgba(37,76,50,0.05)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Stars rating={review.rating} />
                    <h3 className="mt-3 text-lg font-semibold text-[#26342d]">{review.title || "A thoughtful review"}</h3>
                  </div>
                  <time className="shrink-0 text-xs text-[#718078]" dateTime={review.createdAt}>
                    {new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(review.createdAt))}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-7 text-[#53635a]">{review.content}</p>
                {(review.images.length || review.legacyImages.length) ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto">
                    {[...review.images.map((image) => image.url), ...review.legacyImages].map((url) => (
                      <div key={url} className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#f4f7f4]">
                        <Image src={url} alt="Customer review" fill unoptimized className="object-cover" sizes="64px" />
                      </div>
                    ))}
                  </div>
                ) : null}
                <footer className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#718078]">
                  <strong className="text-[#34483c]">{review.customerName}</strong>
                  {review.verifiedPurchase ? <span className="inline-flex items-center gap-1 text-[#4b8c3b]"><CheckCircle2 className="size-3.5" aria-hidden="true" />Verified purchase</span> : null}
                </footer>
              </article>
            ))}
          </div>
          {reviews.items.length < reviews.totalItems ? (
            <div className="text-center">
              <button type="button" onClick={() => setVisible((current) => current + 5)} disabled={loading} className="rounded-lg border border-[#315f48] px-6 py-3 text-sm font-semibold text-[#315f48] transition hover:bg-[#315f48] hover:text-white disabled:opacity-60">
                {loading ? "Loading…" : "Load more reviews"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="font-serif text-2xl text-[#34483c]">No reviews yet</p>
          <p className="mt-2 text-sm text-[#718078]">Be the first to share your experience with this product.</p>
        </div>
      )}
    </section>
  );
}
