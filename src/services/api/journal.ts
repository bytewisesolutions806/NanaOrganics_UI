import "server-only";

import { cache } from "react";

import type {
  JournalArticle,
  JournalArticleSummary,
  JournalAsset,
  JournalCategory,
  JournalLandingData,
  JournalPageSettings,
} from "@/features/journal/types";

const articleCardFields = /* GraphQL */ `
  id title slug excerpt publishedAt featured featuredPriority readingTimeMinutes coverAlt
  coverAsset { id name source preview mimeType }
  category { id name slug description sortOrder seoTitle seoDescription }
  author { id name slug jobTitle bio photoAsset { id name source preview mimeType } }
  brand { id name slug }
`;

const articleDetailFields = /* GraphQL */ `
  ${articleCardFields}
  content tags seoTitle seoDescription canonicalUrl allowIndexing
  socialAsset { id name source preview mimeType }
`;

const JOURNAL_SHELL_QUERY = /* GraphQL */ `
  query JournalShell {
    journalPageSettings {
      id enabled heroTitle heroSubtitle latestTitle latestDescription
      archiveTitle archiveDescription articlesPerPage seoTitle seoDescription
      heroAsset { id name source preview mimeType }
      socialAsset { id name source preview mimeType }
      featuredArticle { ${articleCardFields} }
    }
    journalCategories {
      id name slug description sortOrder seoTitle seoDescription
    }
    latest: journalArticles(skip: 0, take: 4) {
      items { ${articleCardFields} }
      totalItems
    }
  }
`;

const JOURNAL_ARCHIVE_QUERY = /* GraphQL */ `
  query JournalArchive($skip: Int!, $take: Int!, $categorySlug: String) {
    archive: journalArticles(skip: $skip, take: $take, categorySlug: $categorySlug) {
      items { ${articleCardFields} }
      totalItems
    }
  }
`;

const JOURNAL_HERO_QUERY = /* GraphQL */ `
  query JournalHero {
    journalPageSettings {
      id enabled heroTitle heroSubtitle latestTitle latestDescription
      archiveTitle archiveDescription articlesPerPage seoTitle seoDescription
      heroAsset { id name source preview mimeType }
    }
    journalCategories {
      id name slug description sortOrder seoTitle seoDescription
    }
  }
`;

const JOURNAL_ARTICLE_QUERY = /* GraphQL */ `
  query JournalArticle($slug: String!) {
    journalArticle(slug: $slug) { ${articleDetailFields} }
  }
`;

const RELATED_ARTICLES_QUERY = /* GraphQL */ `
  query RelatedJournalArticles($categorySlug: String!) {
    journalArticles(skip: 0, take: 12, categorySlug: $categorySlug) {
      items { ${articleCardFields} }
    }
  }
`;

interface GraphQlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const defaultSettings: JournalPageSettings = {
  id: "journal-default",
  enabled: true,
  heroTitle: "The Nana Journal",
  heroSubtitle:
    "Recipes, rituals and stories from the Himalayan roots of Nana Organics.",
  latestTitle: "Latest from NANA Organics",
  latestDescription:
    "Discover stories, insights, and inspiration for a more natural way of living.",
  archiveTitle: "Check Out Our Newest Articles",
  archiveDescription:
    "Discover thoughtful insights, natural living tips, and stories inspired by the goodness of nature.",
  articlesPerPage: 9,
};

function getStoreApiUrl() {
  const endpoint =
    process.env.VENDURE_SHOP_API_URL ??
    process.env.NEXT_PUBLIC_VENDURE_API_URL;

  if (!endpoint) {
    throw new Error(
      "Set VENDURE_SHOP_API_URL or NEXT_PUBLIC_VENDURE_API_URL to load the Journal.",
    );
  }

  return endpoint;
}

async function requestJournalApi<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const channelToken =
    process.env.VENDURE_CHANNEL_TOKEN ??
    process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN;
  const response = await fetch(getStoreApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(channelToken ? { "vendure-token": channelToken } : {}),
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300, tags: ["storefront-journal"] },
  });
  const payload = (await response.json()) as GraphQlResponse<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }
  if (!response.ok || !payload.data) {
    throw new Error(`Journal API request failed with HTTP ${response.status}.`);
  }
  return payload.data;
}

function normalizeUrl(value?: string | null) {
  if (!value) return value;
  try {
    return new URL(value.replaceAll("\\", "/"), getStoreApiUrl()).toString();
  } catch {
    return value;
  }
}

function normalizeAsset(asset?: JournalAsset | null): JournalAsset | null {
  if (!asset) return null;
  return {
    ...asset,
    source: normalizeUrl(asset.source) ?? asset.source,
    preview: normalizeUrl(asset.preview),
  };
}

function normalizeArticleSummary<T extends JournalArticleSummary>(article: T): T {
  return {
    ...article,
    coverAsset: normalizeAsset(article.coverAsset) ?? article.coverAsset,
    author: {
      ...article.author,
      photoAsset: normalizeAsset(article.author.photoAsset),
    },
  } as T;
}

function normalizeArticle(article: JournalArticle): JournalArticle {
  return {
    ...normalizeArticleSummary(article),
    socialAsset: normalizeAsset(article.socialAsset),
  };
}

export async function getJournalLanding(
  page = 1,
  categorySlug?: string,
): Promise<JournalLandingData> {
  try {
    const shell = await requestJournalApi<{
      journalPageSettings: JournalPageSettings | null;
      journalCategories: JournalCategory[];
      latest: { items: JournalArticleSummary[]; totalItems: number };
    }>(JOURNAL_SHELL_QUERY);
    const settings = shell.journalPageSettings
      ? {
          ...shell.journalPageSettings,
          heroAsset: normalizeAsset(shell.journalPageSettings.heroAsset),
          socialAsset: normalizeAsset(shell.journalPageSettings.socialAsset),
          featuredArticle: shell.journalPageSettings.featuredArticle
            ? normalizeArticleSummary(shell.journalPageSettings.featuredArticle)
            : null,
        }
      : { ...defaultSettings, enabled: false };
    const pageSize = Math.min(48, Math.max(3, settings.articlesPerPage || 9));
    const safePage = Math.max(1, Math.floor(page));
    const archive = await requestJournalApi<{
      archive: { items: JournalArticleSummary[]; totalItems: number };
    }>(JOURNAL_ARCHIVE_QUERY, {
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      categorySlug: categorySlug || null,
    });
    const latestArticles = shell.latest.items.map(normalizeArticleSummary);

    return {
      settings,
      categories: shell.journalCategories,
      featuredArticle: settings.featuredArticle ?? latestArticles[0] ?? null,
      latestArticles,
      archiveArticles: archive.archive.items.map(normalizeArticleSummary),
      archiveTotal: archive.archive.totalItems,
    };
  } catch (error) {
    console.error("Journal content is unavailable; rendering the empty Journal shell.", error);
    return {
      settings: defaultSettings,
      categories: [],
      featuredArticle: null,
      latestArticles: [],
      archiveArticles: [],
      archiveTotal: 0,
    };
  }
}

export const getJournalArticle = cache(async (slug: string) => {
  try {
    const response = await requestJournalApi<{
      journalArticle: JournalArticle | null;
    }>(JOURNAL_ARTICLE_QUERY, { slug });
    return response.journalArticle
      ? normalizeArticle(response.journalArticle)
      : null;
  } catch (error) {
    console.error(`Journal article “${slug}” could not be loaded.`, error);
    return null;
  }
});

export const getJournalHero = cache(async () => {
  const response = await requestJournalApi<{
    journalPageSettings: JournalPageSettings | null;
    journalCategories: JournalCategory[];
  }>(JOURNAL_HERO_QUERY);
  return {
    settings: response.journalPageSettings
      ? {
          ...response.journalPageSettings,
          heroAsset: normalizeAsset(response.journalPageSettings.heroAsset),
        }
      : { ...defaultSettings, enabled: false },
    categories: response.journalCategories,
  };
});

export async function getRelatedJournalArticles(article: JournalArticle) {
  try {
    const response = await requestJournalApi<{
      journalArticles: { items: JournalArticleSummary[] };
    }>(RELATED_ARTICLES_QUERY, { categorySlug: article.category.slug });
    return response.journalArticles.items
      .filter((item) => item.id !== article.id)
      .map(normalizeArticleSummary);
  } catch (error) {
    console.error("Related journal articles could not be loaded.", error);
    return [];
  }
}

export { defaultSettings as defaultJournalSettings };
