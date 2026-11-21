import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  ArticleCard,
  ArticleMeta,
} from "@/features/journal/components/article-card";
import { JournalHero } from "@/features/journal/components/journal-hero";
import { LatestArticlesCarousel } from "@/features/journal/components/latest-articles-carousel";
import { getJournalLanding } from "@/services/api/journal";

type JournalPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function pageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const values = new Set([1, total, current - 1, current, current + 1]);
  return [...values]
    .filter((value) => value >= 1 && value <= total)
    .sort((left, right) => left - right);
}

function journalHref(page: number, category?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/journal?${query}` : "/journal";
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getJournalLanding(1);
  const title = settings.seoTitle || settings.heroTitle || "The Nana Journal";
  const description =
    settings.seoDescription ||
    settings.heroSubtitle ||
    "Recipes, rituals and stories from Nana Organics.";
  const socialImage = settings.socialAsset?.source || settings.heroAsset?.source;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(socialImage ? { images: [{ url: socialImage }] } : {}),
    },
  };
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const params = await searchParams;
  const categorySlug = firstValue(params.category)?.trim() || undefined;
  const requestedPage = Number.parseInt(firstValue(params.page) || "1", 10);
  const currentPage = Number.isFinite(requestedPage)
    ? Math.max(1, requestedPage)
    : 1;
  const data = await getJournalLanding(currentPage, categorySlug);
  const pageSize = Math.min(
    48,
    Math.max(3, data.settings.articlesPerPage || 9),
  );
  const totalPages = Math.max(1, Math.ceil(data.archiveTotal / pageSize));
  const selectedCategory = data.categories.find(
    (category) => category.slug === categorySlug,
  );

  return (
    <main className="overflow-hidden bg-white text-[#252a30]">
      <JournalHero
        settings={data.settings}
        categories={data.categories}
        selectedCategory={categorySlug}
      />

      {data.featuredArticle ? (
        <section
          aria-labelledby="featured-story-title"
          className="relative isolate px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <Image
            src="/images/homepage-leaf-left-bottom.png"
            alt=""
            width={374}
            height={279}
            aria-hidden="true"
            className="pointer-events-none absolute -left-12 top-2 -z-10 hidden w-44 opacity-[0.12] md:block lg:w-56"
          />
          <Image
            src="/images/homepage-leaf-right-top.png"
            alt=""
            width={361}
            height={279}
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 bottom-0 -z-10 hidden w-44 opacity-[0.12] md:block lg:w-56"
          />
          <article className="mx-auto grid max-w-[1040px] items-center gap-8 md:grid-cols-[1.08fr_0.92fr] md:gap-12 lg:gap-16">
            <Link
              href={`/journal/${data.featuredArticle.slug}`}
              className="relative aspect-[1.62/1] overflow-hidden rounded-xl bg-[#e8eee8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2c5d43]"
            >
              <Image
                src={data.featuredArticle.coverAsset.source}
                alt={
                  data.featuredArticle.coverAlt || data.featuredArticle.title
                }
                fill
                unoptimized
                sizes="(max-width: 767px) 100vw, 55vw"
                className="object-cover transition duration-500 hover:scale-[1.025]"
              />
            </Link>
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#61bf45] px-2.5 py-1 text-[10px] font-semibold leading-none text-white">
                  {data.featuredArticle.category.name}
                </span>
                {data.featuredArticle.brand ? (
                  <span className="text-[10px] font-semibold text-[#4f775a]">
                    · {data.featuredArticle.brand.name}
                  </span>
                ) : null}
              </div>
              <h2
                id="featured-story-title"
                className="mt-4 font-serif text-3xl font-semibold leading-[1.13] tracking-[-0.03em] sm:text-4xl"
              >
                {data.featuredArticle.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[#565e59] sm:text-base sm:leading-7">
                {data.featuredArticle.excerpt}
              </p>
              <ArticleMeta article={data.featuredArticle} />
              <Link
                href={`/journal/${data.featuredArticle.slug}`}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#2c5d43] px-6 text-sm font-medium text-white transition hover:bg-[#224b35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43]"
              >
                Read Story
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      {data.latestArticles.length ? (
        <section
          aria-labelledby="latest-journal-title"
          className="relative bg-[#fbfcfa] px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <Image
            src="/images/homepage-leaf-right-top.png"
            alt=""
            width={361}
            height={279}
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 hidden w-52 opacity-[0.12] md:block"
          />
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-10 text-center">
              <h2
                id="latest-journal-title"
                className="font-serif text-3xl font-semibold tracking-[-0.025em] sm:text-4xl"
              >
                {data.settings.latestTitle}
              </h2>
              {data.settings.latestDescription ? (
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#525b55] sm:text-base">
                  {data.settings.latestDescription}
                </p>
              ) : null}
            </div>
            <LatestArticlesCarousel articles={data.latestArticles} />
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="journal-archive-title"
        className="px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
      >
        <div className="mx-auto max-w-[1040px]">
          <div className="text-center">
            <h2
              id="journal-archive-title"
              className="font-serif text-3xl font-semibold tracking-[-0.025em] sm:text-4xl"
            >
              {selectedCategory?.name || data.settings.archiveTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#59615c]">
              {selectedCategory?.description ||
                data.settings.archiveDescription ||
                "Explore the latest stories from Nana Organics."}
            </p>
          </div>

          {data.archiveArticles.length ? (
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {data.archiveArticles.map((article) => (
                <ArticleCard key={article.id} article={article} compact />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#dce7df] bg-[#f7faf7] px-6 py-12 text-center">
              <p className="font-serif text-2xl font-semibold text-[#2c4234]">
                Stories are taking root
              </p>
              <p className="mt-2 text-sm leading-6 text-[#68716b]">
                {categorySlug
                  ? "There are no published stories in this category yet."
                  : "The first Nana Journal stories will appear here as soon as they are published from the admin panel."}
              </p>
              {categorySlug ? (
                <Link
                  href="/journal"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2c5d43] hover:underline"
                >
                  View all stories <ArrowRight className="size-4" />
                </Link>
              ) : null}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="Journal pagination"
              className="mt-14 flex flex-wrap items-center justify-center gap-2 text-xs"
            >
              <Link
                href={journalHref(Math.max(1, currentPage - 1), categorySlug)}
                aria-disabled={currentPage <= 1}
                className={`inline-flex min-h-9 items-center gap-1 rounded border px-3 transition ${
                  currentPage <= 1
                    ? "pointer-events-none border-[#dfe5e0] text-[#a3aaa5]"
                    : "border-[#7fa28d] text-[#2c5d43] hover:bg-[#eff5f0]"
                }`}
              >
                <ArrowLeft className="size-3" /> Prev
              </Link>
              {pageNumbers(currentPage, totalPages).map((pageNumber, index, pages) => (
                <span key={pageNumber} className="contents">
                  {index > 0 && pageNumber - pages[index - 1] > 1 ? (
                    <span className="px-1 text-[#8d948f]">…</span>
                  ) : null}
                  <Link
                    href={journalHref(pageNumber, categorySlug)}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                    className={`grid size-9 place-items-center rounded transition ${
                      pageNumber === currentPage
                        ? "bg-[#2c5d43] font-semibold text-white"
                        : "text-[#4f6557] hover:bg-[#eff5f0]"
                    }`}
                  >
                    {String(pageNumber).padStart(2, "0")}
                  </Link>
                </span>
              ))}
              <Link
                href={journalHref(
                  Math.min(totalPages, currentPage + 1),
                  categorySlug,
                )}
                aria-disabled={currentPage >= totalPages}
                className={`inline-flex min-h-9 items-center gap-1 rounded border px-3 transition ${
                  currentPage >= totalPages
                    ? "pointer-events-none border-[#dfe5e0] text-[#a3aaa5]"
                    : "border-[#7fa28d] text-[#2c5d43] hover:bg-[#eff5f0]"
                }`}
              >
                Next <ArrowRight className="size-3" />
              </Link>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}
