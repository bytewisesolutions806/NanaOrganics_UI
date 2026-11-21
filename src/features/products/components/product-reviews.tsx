"use client";

import Image from "next/image";
import { CheckCircle2, ChevronLeft, ChevronRight, Star, X } from "lucide-react";
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

function Stars({
  rating,
  label,
  boxed = false,
}: {
  rating: number;
  label?: string;
  boxed?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center ${boxed ? "gap-[3px]" : "gap-1"}`}
      aria-label={label ?? `${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={
            boxed
              ? `grid size-[25px] place-items-center rounded-[2px] ${
                  index < Math.round(rating)
                    ? "bg-[#2e7758]"
                    : "bg-[#dce4dd]"
                }`
              : undefined
          }
        >
          <Star
            aria-hidden="true"
            className={
              boxed
                ? `size-[18px] ${
                    index < Math.round(rating)
                      ? "fill-white text-white"
                      : "fill-[#9aaba0] text-[#9aaba0]"
                  }`
                : `size-4 ${
                    index < Math.round(rating)
                      ? "fill-[#2e7758] text-[#2e7758]"
                      : "fill-[#e6ebe7] text-[#e6ebe7]"
                  }`
            }
          />
        </span>
      ))}
    </span>
  );
}

export interface ProductReviewSummary {
  productId: string;
  averageRating: number;
  totalReviewCount: number;
}

export function ProductReviews({
  productId,
  onSummaryChange,
}: {
  productId: string;
  onSummaryChange?: (summary: ProductReviewSummary | null) => void;
}) {
  const [reviews, setReviews] = useState<PublicProductReviews>(emptyReviews);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState<"NEWEST" | "OLDEST" | "HIGHEST_RATED" | "LOWEST_RATED">("NEWEST");
  const [visible, setVisible] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  useEffect(() => {
    if (!lightbox) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
      } else if (event.key === "ArrowLeft") {
        setLightbox((current) =>
          current
            ? { ...current, index: (current.index - 1 + current.images.length) % current.images.length }
            : null
        );
      } else if (event.key === "ArrowRight") {
        setLightbox((current) =>
          current
            ? { ...current, index: (current.index + 1) % current.images.length }
            : null
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [lightbox]);

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
          if (active) {
            setReviews(result);
            onSummaryChange?.({
              productId,
              averageRating: result.averageRating,
              totalReviewCount: result.totalReviewCount,
            });
          }
        })
        .catch((reason: unknown) => {
          if (active) {
            onSummaryChange?.(null);
            setError(reason instanceof Error ? reason.message : "Reviews are unavailable right now.");
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [productId, rating, sort, visible, onSummaryChange]);

  return (
    <>
      <section
        id="customer-reviews"
        className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
        aria-labelledby="reviews-title"
      >
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2
              id="reviews-title"
              className="font-serif text-3xl font-semibold tracking-[-0.025em] text-[#26342d] sm:text-[38px]"
            >
              Our Customer Reviews
            </h2>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#53635a]">
              <span className="grid size-7 place-items-center rounded-[3px] bg-[#2e7758] text-white">
                <Star aria-hidden="true" className="size-5 fill-white" />
              </span>
              <strong className="text-xl font-semibold text-[#26342d]">
                {reviews.averageRating.toFixed(1)}
              </strong>
              <span className="mx-1 h-4 w-px bg-[#ccd7cf]" aria-hidden="true" />
              <span>
                {reviews.totalReviewCount.toLocaleString("en-IN")} happy customers
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              aria-label="Filter reviews by rating"
              value={rating}
              onChange={(event) => {
                setRating(Number(event.target.value));
                setVisible(5);
              }}
              className="h-10 rounded-md border border-[#d3ddd5] bg-white px-3 text-xs text-[#34483c] outline-none transition focus:border-[#2e7758] focus:ring-2 focus:ring-[#2e7758]/15"
            >
              <option value={0}>All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value} stars</option>
              ))}
            </select>
            <select
              aria-label="Sort reviews"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as typeof sort);
                setVisible(5);
              }}
              className="h-10 rounded-md border border-[#d3ddd5] bg-white px-3 text-xs text-[#34483c] outline-none transition focus:border-[#2e7758] focus:ring-2 focus:ring-[#2e7758]/15"
            >
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="HIGHEST_RATED">Highest rated</option>
              <option value="LOWEST_RATED">Lowest rated</option>
            </select>
          </div>
        </div>

        {loading && reviews.items.length === 0 ? (
          <div className="divide-y divide-[#e0e8e1] py-8">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-4 py-8 first:pt-0">
                <div className="h-6 w-32 animate-pulse rounded bg-[#eef3ef]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#eef3ef]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#eef3ef]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="py-10 text-sm text-red-700">{error}</p>
        ) : reviews.items.length ? (
          <>
            <div className="mt-10 divide-y divide-[#e0e8e1]">
              {reviews.items.map((review) => {
                const images = [
                  ...review.images.map((image) => image.url),
                  ...review.legacyImages,
                ];

                return (
                  <article key={review.id} className="py-9 first:pt-0">
                    <Stars rating={review.rating} boxed />
                    <p className="mt-4 max-w-[1320px] text-[15px] leading-7 text-[#344039]">
                      {review.content}
                    </p>
                    {images.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {images.map((url, index) => (
                          <button
                            key={`${url}-${index}`}
                            type="button"
                            onClick={() => setLightbox({ images, index })}
                            aria-label={`Open review image ${index + 1} of ${images.length}`}
                            className="relative size-[66px] overflow-hidden rounded-lg bg-[#f4f7f4] outline-none ring-[#2e7758] transition hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 sm:size-[72px]"
                          >
                            <Image
                              src={url}
                              alt={`Customer review photo ${index + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                              sizes="72px"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <footer className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#68746d]">
                      <strong className="font-semibold text-[#344039]">
                        {review.customerName}
                      </strong>
                      <span aria-hidden="true">|</span>
                      <time dateTime={review.createdAt}>
                        {new Intl.DateTimeFormat("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(review.createdAt))}
                      </time>
                      {review.verifiedPurchase ? (
                        <span className="ml-1 inline-flex items-center gap-1 text-[#477c5b]">
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          Verified purchase
                        </span>
                      ) : null}
                    </footer>
                  </article>
                );
              })}
            </div>
            {reviews.items.length < reviews.totalItems ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setVisible((current) => current + 5)}
                  disabled={loading}
                  className="rounded-md border border-[#315f48] px-6 py-3 text-sm font-semibold text-[#315f48] transition hover:bg-[#315f48] hover:text-white disabled:opacity-60"
                >
                  {loading ? "Loading…" : "Load more reviews"}
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="font-serif text-2xl text-[#34483c]">No reviews yet</p>
            <p className="mt-2 text-sm text-[#718078]">
              Be the first to share your experience with this product.
            </p>
          </div>
        )}
      </section>

      {lightbox ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 sm:p-8"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setLightbox(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Review image ${lightbox.index + 1} of ${lightbox.images.length}`}
            className="relative flex h-full max-h-[88vh] w-full max-w-5xl items-center justify-center"
          >
            <button
              type="button"
              autoFocus
              onClick={() => setLightbox(null)}
              aria-label="Close image viewer"
              className="absolute right-0 top-0 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X aria-hidden="true" className="size-6" />
            </button>

            {lightbox.images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((current) =>
                      current
                        ? {
                            ...current,
                            index: (current.index - 1 + current.images.length) % current.images.length,
                          }
                        : null
                    )
                  }
                  aria-label="Previous review image"
                  className="absolute left-0 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ChevronLeft aria-hidden="true" className="size-7" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox((current) =>
                      current
                        ? {
                            ...current,
                            index: (current.index + 1) % current.images.length,
                          }
                        : null
                    )
                  }
                  aria-label="Next review image"
                  className="absolute right-0 z-10 grid size-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ChevronRight aria-hidden="true" className="size-7" />
                </button>
              </>
            ) : null}

            <div className="relative h-full w-[calc(100%_-_5rem)]">
              <Image
                src={lightbox.images[lightbox.index]}
                alt={`Customer review photo ${lightbox.index + 1}`}
                fill
                unoptimized
                priority
                sizes="(max-width: 1024px) 90vw, 900px"
                className="object-contain"
              />
            </div>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white">
              {lightbox.index + 1} / {lightbox.images.length}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
