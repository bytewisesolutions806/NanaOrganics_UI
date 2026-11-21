import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import JournalLoading from "../loading";
import { formatJournalDate } from "@/features/journal/components/article-card";
import { JournalHero } from "@/features/journal/components/journal-hero";
import { RelatedArticlesCarousel } from "@/features/journal/components/related-articles-carousel";
import type { JournalArticle } from "@/features/journal/types";
import {
  getJournalArticle,
  getJournalHero,
  getRelatedJournalArticles,
} from "@/services/api/journal";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getJournalArticle(slug);
  if (!article) return { title: "Story not found" };
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  const image = article.socialAsset?.source || article.coverAsset.source;

  return {
    title,
    description,
    alternates: article.canonicalUrl ? { canonical: article.canonicalUrl } : undefined,
    robots: article.allowIndexing
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt || undefined,
      authors: [article.author.name],
      images: [{ url: image }],
    },
  };
}

export default function JournalArticlePage({ params }: ArticlePageProps) {
  return (
    <Suspense fallback={<JournalLoading />}>
      <JournalArticleContent params={params} />
    </Suspense>
  );
}

function ArticleAuthorRail({ article }: { article: JournalArticle }) {
  return (
    <aside className="lg:sticky lg:top-8 lg:self-start" aria-label="Article details">
      <div className="flex min-w-0 items-center gap-4">
        {article.author.photoAsset?.source ? (
          <Image
            src={article.author.photoAsset.source}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#dce9df] font-serif font-semibold text-[#2c5d43]"
          >
            {article.author.name.charAt(0)}
          </span>
        )}
        <span className="min-w-0 truncate text-base font-medium text-[#2c2c2c] xl:text-xl">
          {article.author.name}
        </span>
        <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-[#21252c]/20" />
        <time
          dateTime={article.publishedAt ?? undefined}
          className="shrink-0 text-sm text-[#7d7d7d] xl:text-base"
        >
          {formatJournalDate(article.publishedAt)}
        </time>
      </div>

      <div className="mt-2.5 border-t border-[#21252c]/20 pt-4">
        <p className="text-base font-medium text-[#2c2c2c]">Share this post</p>
        <div
          className="relative mt-4 h-4 w-[192px]"
          role="img"
          aria-label="Facebook, Instagram, X, LinkedIn, and YouTube"
        >
          <Image
            src="/images/journal/social-share-icons.svg"
            alt=""
            fill
            unoptimized
            className="object-contain object-left"
          />
        </div>
      </div>
    </aside>
  );
}

async function JournalArticleContent({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getJournalArticle(slug);
  if (!article) notFound();
  const [hero, relatedArticles] = await Promise.all([
    getJournalHero(),
    getRelatedJournalArticles(article),
  ]);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nanaorganics.co").replace(/\/$/, "");
  const articleUrl = article.canonicalUrl || `${siteUrl}/journal/${article.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: [article.socialAsset?.source || article.coverAsset.source],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: articleUrl,
    author: { "@type": "Person", name: article.author.name },
    publisher: {
      "@type": "Organization",
      name: "Nana Organics",
      logo: { "@type": "ImageObject", url: `${siteUrl}/images/AppLogo.png` },
    },
  };

  return (
    <main className="bg-white text-[#21252c]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
        }}
      />

      <JournalHero settings={hero.settings} categories={hero.categories} detail />

      <header className="px-5 pt-[72px] text-center sm:px-8">
        <div className="mx-auto max-w-[760px]">
          <Link
            href={`/journal?category=${encodeURIComponent(article.category.slug)}`}
            className="inline-flex rounded-[10px] bg-[#69bd45] px-2 py-[3px] text-xs font-bold leading-[15px] text-white transition hover:bg-[#55a63a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c5d43]"
          >
            {article.category.name}
            {article.brand ? ` · ${article.brand.name}` : ""}
          </Link>
          <h1 className="mt-2 font-serif text-[2rem] font-bold leading-[1.15] tracking-[-0.025em] sm:text-[38px]">
            {article.title}
          </h1>
        </div>
      </header>

      <div className="px-5 pt-10 sm:px-8">
        <div className="relative mx-auto aspect-[13/6] max-w-[1300px] overflow-hidden rounded-[10px] bg-[#e8eee8]">
          <Image
            src={article.coverAsset.source}
            alt={article.coverAlt || article.title}
            fill
            priority
            unoptimized
            sizes="(max-width: 1364px) calc(100vw - 40px), 1300px"
            className="object-cover"
          />
        </div>
      </div>

      <article className="px-5 pb-12 pt-[30px] sm:px-8 sm:pb-16">
        <div className="mx-auto grid max-w-[1300px] gap-10 lg:grid-cols-[309px_minmax(0,891px)] lg:gap-[100px]">
          <ArticleAuthorRail article={article} />
          <div
            className="journal-prose journal-detail-prose min-w-0"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>

      {relatedArticles.length ? (
        <section
          aria-labelledby="related-journal-title"
          className="border-t border-[#21252c]/20 bg-white px-5 pb-16 sm:px-8 sm:pb-20"
        >
          <div className="mx-auto max-w-[1444px] pt-10 sm:pt-12">
            <div className="text-center">
              <h2
                id="related-journal-title"
                className="font-serif text-3xl font-bold tracking-[-0.025em] sm:text-[38px]"
              >
                Related Journal
              </h2>
            </div>
            <RelatedArticlesCarousel articles={relatedArticles} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
