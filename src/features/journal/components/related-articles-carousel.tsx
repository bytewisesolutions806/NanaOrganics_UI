"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArticleCard } from "@/features/journal/components/article-card";
import type { JournalArticleSummary } from "@/features/journal/types";

export function RelatedArticlesCarousel({
  articles,
}: {
  articles: JournalArticleSummary[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateControls = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanGoBack(track.scrollLeft > 1);
    setCanGoForward(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateControls();
    const observer = new ResizeObserver(updateControls);
    observer.observe(track);
    return () => observer.disconnect();
  }, [articles, updateControls]);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    const card = track?.firstElementChild;
    if (!track || !card) return;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  }

  return (
    <div className="relative mt-8 px-8 sm:mt-10 sm:px-10 xl:px-[72px]">
      <button
        type="button"
        onClick={() => move(-1)}
        disabled={!canGoBack}
        aria-label="Show previous related articles"
        className="absolute left-0 top-[32%] grid size-8 place-items-center text-[#2d6c5e] transition hover:text-[#173f34] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6c5e]"
      >
        <ChevronLeft className="size-6" aria-hidden="true" />
      </button>
      <div
        ref={trackRef}
        onScroll={updateControls}
        className="grid snap-x snap-mandatory auto-cols-[100%] grid-flow-col gap-6 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[calc((100%-1.5rem)/2)] lg:auto-cols-[calc((100%-3rem)/3)] xl:gap-[60px] xl:auto-cols-[calc((100%-7.5rem)/3)]"
      >
        {articles.map((article) => (
          <div key={article.id} className="min-w-0 snap-start">
            <ArticleCard article={article} compact />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => move(1)}
        disabled={!canGoForward}
        aria-label="Show next related articles"
        className="absolute right-0 top-[32%] grid size-8 place-items-center text-[#2d6c5e] transition hover:text-[#173f34] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2d6c5e]"
      >
        <ChevronRight className="size-6" aria-hidden="true" />
      </button>
    </div>
  );
}
