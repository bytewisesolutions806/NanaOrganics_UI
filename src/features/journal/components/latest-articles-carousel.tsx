"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { ArticleCard } from "@/features/journal/components/article-card";
import type { JournalArticleSummary } from "@/features/journal/types";

export function LatestArticlesCarousel({
  articles,
}: {
  articles: JournalArticleSummary[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(280, track.clientWidth * 0.82),
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div
        ref={trackRef}
        className="grid snap-x snap-mandatory auto-cols-[88%] grid-flow-col gap-6 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[48%] lg:auto-cols-[calc((100%-3rem)/3)]"
      >
        {articles.map((article) => (
          <div key={article.id} className="min-w-0 snap-start">
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Show previous articles"
          className="grid size-10 place-items-center rounded-full text-[#2d6c5e] transition hover:bg-[#eef5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6c5e]"
        >
          <ChevronLeft className="size-7" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Show next articles"
          className="grid size-10 place-items-center rounded-full text-[#2d6c5e] transition hover:bg-[#eef5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6c5e]"
        >
          <ChevronRight className="size-7" aria-hidden="true" />
        </button>
        <span className="ml-2 h-px flex-1 bg-[#e4e8e5]" aria-hidden="true" />
      </div>
    </div>
  );
}
