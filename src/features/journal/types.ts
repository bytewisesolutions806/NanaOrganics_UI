export interface JournalAsset {
  id: string;
  name?: string | null;
  source: string;
  preview?: string | null;
  mimeType?: string | null;
}

export interface JournalCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface JournalAuthor {
  id: string;
  name: string;
  slug: string;
  jobTitle?: string | null;
  bio?: string | null;
  photoAsset?: JournalAsset | null;
}

export interface JournalBrand {
  id: string;
  name: string;
  slug: string;
}

export interface JournalArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt?: string | null;
  featured: boolean;
  featuredPriority: number;
  readingTimeMinutes: number;
  coverAlt?: string | null;
  coverAsset: JournalAsset;
  category: JournalCategory;
  author: JournalAuthor;
  brand?: JournalBrand | null;
}

export interface JournalArticle extends JournalArticleSummary {
  content: string;
  tags: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  allowIndexing: boolean;
  socialAsset?: JournalAsset | null;
}

export interface JournalPageSettings {
  id: string;
  enabled: boolean;
  heroTitle: string;
  heroSubtitle?: string | null;
  latestTitle: string;
  latestDescription?: string | null;
  archiveTitle: string;
  archiveDescription?: string | null;
  articlesPerPage: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  heroAsset?: JournalAsset | null;
  socialAsset?: JournalAsset | null;
  featuredArticle?: JournalArticleSummary | null;
}

export interface JournalLandingData {
  settings: JournalPageSettings;
  categories: JournalCategory[];
  featuredArticle: JournalArticleSummary | null;
  latestArticles: JournalArticleSummary[];
  archiveArticles: JournalArticleSummary[];
  archiveTotal: number;
}
