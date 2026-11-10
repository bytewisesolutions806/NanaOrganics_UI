"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Heart, Pause, Play, Star } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getTopCustomerReviews,
  type PublicCustomerReview,
} from "@/services/api/account";

export function FooterReviews() {
  const pathname = usePathname();
  const [reviews, setReviews] = useState<PublicCustomerReview[]>([]);
  const [activeGroup, setActiveGroup] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pathname || pathname === "/products" || pathname.startsWith("/products/")) {
      return;
    }

    let active = true;

    getTopCustomerReviews()
      .then((result) => {
        if (active) {
          setReviews(result);
          setActiveGroup(0);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          console.error("Failed to load footer customer reviews.", reason);
          setError(
            reason instanceof Error
              ? reason.message
              : "Customer reviews are unavailable right now.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  const groupCount = Math.ceil(reviews.length / 2);

  useEffect(() => {
    if (paused || groupCount < 2) return;

    const timer = window.setInterval(() => {
      setActiveGroup((current) => (current + 1) % groupCount);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [groupCount, paused]);

  if (!pathname || pathname === "/products" || pathname.startsWith("/products/")) {
    return null;
  }

  if (!loading && !error && reviews.length === 0) return null;

  return (
    <section
      aria-labelledby="ritual-stories-title"
      className="relative overflow-hidden bg-white px-5 py-12 sm:px-8 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-[920px]">
        <header className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#26342d]">
            Ritual Stories
          </p>
          <h2
            id="ritual-stories-title"
            className="mt-2 font-serif text-2xl font-semibold text-[#242a30] sm:text-3xl"
          >
            Small Rituals. Real Joy.
          </h2>
        </header>

        {loading ? (
          <div
            aria-label="Loading customer reviews"
            className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-10"
          >
            {[0, 1].map((item) => (
              <div
                key={item}
                aria-hidden="true"
                className="h-44 animate-pulse rounded-lg bg-[#f1f6f2]"
              />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="mt-8 text-center text-sm text-[#53635a]">
            Customer reviews are temporarily unavailable.
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-10">
              {reviews
                .slice(activeGroup * 2, activeGroup * 2 + 2)
                .map((review) => (
                  <article key={review.id} className="min-w-0">
                    <span
                      aria-hidden="true"
                      className="block h-10 font-serif text-[4.5rem] leading-[0.9] text-[#68bd45]"
                    >
                      “
                    </span>
                    <p className="mt-1 text-[13px] leading-[1.65] text-[#41464a] sm:text-sm">
                      “{review.content}”
                    </p>
                    <div
                      role="img"
                      aria-label={`${review.rating} out of 5 stars`}
                      className="mt-2 flex gap-1 text-sm leading-none text-[#5b9b61]"
                    >
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          aria-hidden="true"
                          className={`size-3.5 ${index < review.rating ? "fill-current" : "text-[#dfe5e0]"}`}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8efe7] text-xs font-semibold text-[#315f48]">
                        {review.customerProfilePhotoUrl ? (
                          <Image
                            src={review.customerProfilePhotoUrl}
                            alt=""
                            fill
                            unoptimized
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          review.customerName
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join("")
                        )}
                      </span>
                      <div>
                        <p className="text-lg leading-tight text-[#34383b]">
                          {review.customerName}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#81868a]">
                          {review.verifiedPurchase
                            ? "Verified purchase"
                            : "Customer review"}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

            {groupCount > 1 ? (
              <nav
                aria-label="Review sets"
                className="mt-8 flex items-center justify-center gap-3"
              >
                {Array.from({ length: groupCount }, (_, group) => (
                  <button
                    key={group}
                    type="button"
                    aria-label={`Show review set ${group + 1}`}
                    aria-pressed={activeGroup === group}
                    onClick={() => setActiveGroup(group)}
                    className="flex size-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48]"
                  >
                    {activeGroup === group ? (
                      <Heart
                        aria-hidden="true"
                        className="size-3.5 fill-[#68bd45] text-[#68bd45]"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-[#c4c8c5]"
                      />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label={paused ? "Resume review rotation" : "Pause review rotation"}
                  aria-pressed={paused}
                  onClick={() => setPaused((current) => !current)}
                  className="flex size-7 items-center justify-center rounded-full text-[#53635a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315f48]"
                >
                  {paused ? (
                    <Play aria-hidden="true" className="size-3.5" />
                  ) : (
                    <Pause aria-hidden="true" className="size-3.5" />
                  )}
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
