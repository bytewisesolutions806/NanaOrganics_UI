import Image from "next/image";
import Link from "next/link";

import type { JournalArticleSummary } from "@/features/journal/types";

export function formatJournalDate(value?: string | null) {
  if (!value) return "Recently published";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ArticleMeta({
  article,
  large = false,
}: {
  article: JournalArticleSummary;
  large?: boolean;
}) {
  return (
    <div
      className={`mt-4 flex min-w-0 items-center gap-3 text-[#6f746f] ${
        large ? "text-sm xl:text-base" : "text-xs sm:text-sm"
      }`}
    >
      {article.author.photoAsset?.source ? (
        <Image
          src={article.author.photoAsset.source}
          alt=""
          width={36}
          height={36}
          unoptimized
          className={`shrink-0 rounded-full object-cover ${large ? "size-10" : "size-8 sm:size-9"}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`grid shrink-0 place-items-center rounded-full bg-[#dce9df] font-serif font-semibold text-[#2c5d43] ${large ? "size-10" : "size-8 sm:size-9"}`}
        >
          {article.author.name.charAt(0)}
        </span>
      )}
      <span className={`truncate font-medium text-[#242b27] ${large ? "xl:text-xl" : ""}`}>
        {article.author.name}
      </span>
      <span aria-hidden="true" className="h-4 w-px shrink-0 bg-[#d8ddd9]" />
      <time className="shrink-0" dateTime={article.publishedAt ?? undefined}>
        {formatJournalDate(article.publishedAt)}
      </time>
    </div>
  );
}

export function ArticleCard({
  article,
  compact = false,
}: {
  article: JournalArticleSummary;
  compact?: boolean;
}) {
  return (
    <article className="group flex h-full min-w-0 flex-col">
      <Link
        href={`/journal/${article.slug}`}
        className={`relative block overflow-hidden rounded-lg bg-[#e9efe9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c5d43] ${
          compact ? "aspect-[1.58/1]" : "aspect-[1.48/1]"
        }`}
      >
        <Image
          src={article.coverAsset.source}
          alt={article.coverAlt || article.title}
          fill
          unoptimized
          sizes="(max-width: 639px) 92vw, (max-width: 1023px) 48vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/journal?category=${encodeURIComponent(article.category.slug)}`}
            className="inline-flex rounded-full bg-[#61bf45] px-2.5 py-1 text-[10px] font-semibold leading-none text-white transition hover:bg-[#4ea437] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43]"
          >
            {article.category.name}
          </Link>
          {article.brand ? (
            <span className="text-[10px] font-medium text-[#56705d]">
              {article.brand.name}
            </span>
          ) : null}
        </div>
        <h3
          className={`mt-3 font-serif font-semibold leading-[1.18] tracking-[-0.02em] text-[#252a30] ${
            compact ? "text-xl xl:text-[30px]" : "text-[1.4rem] sm:text-2xl"
          }`}
        >
          <Link
            href={`/journal/${article.slug}`}
            className="transition hover:text-[#2c5d43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43]"
          >
            {article.title}
          </Link>
        </h3>
        <p className={`mt-2 line-clamp-2 text-[#5b625e] ${compact ? "text-sm leading-6 xl:text-base" : "text-xs leading-5 sm:text-sm sm:leading-6"}`}>
          {article.excerpt}
        </p>
        <div className="mt-auto">
          <ArticleMeta article={article} large={compact} />
        </div>
      </div>
    </article>
  );
}
