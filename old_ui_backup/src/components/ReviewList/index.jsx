"use client";

import { useState } from "react";
import Image from "next/image";
import StarRating from "../StarRating";

const PAGE_SIZE = 5;

export default function ReviewList({ reviews }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const loadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  return (
    <>
      {/* ✅ Scrollable container */}
      <div className="max-h-[700px] overflow-y-auto space-y-6 pr-2">
        {reviews.slice(0, visibleCount).map((review) => (
          <div
            key={review.id}
            className="rounded-xl p-4 shadow-sm bg-[#F1F8F7]/60"
          >
            <div className="flex gap-4 ">
              {/* Avatar */}
              <Image
                src={review.avatar}
                alt={review.userName}
                width={80}
                height={48}
                className="rounded-xl"
              />

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="font-semibold">{review.userName}</p>
                  <div className="ml-auto">
                    <StarRating rating={review.rating} size={20} />
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Posted {getDaysAgo(review.createdAt)} days ago
                </p>

                <p className="mt-3 text-sm text-gray-700">{review.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Load More button */}
      {visibleCount < reviews.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            className="px-6 py-2 text-sm font-semibold rounded-full border border-[#2C665E] text-[#2C665E] hover:bg-[#E6F4F2]"
          >
            Load more reviews
          </button>
        </div>
      )}
    </>
  );
}

/* Helpers */
function getDaysAgo(date) {
  return Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
}
