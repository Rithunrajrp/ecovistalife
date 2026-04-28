// ============================================
// Shared Types for the Scraper Pipeline
// ============================================

export interface ImageData {
  src: string;
  alt: string;
}

export interface ButtonData {
  text: string;
  href: string;
}

export interface ListData {
  items: string[];
  ordered: boolean;
}

export interface HeadingData {
  level: number; // 1–6
  text: string;
}

export interface ExtractedSection {
  type: string; // hero | text | features | gallery | cta | testimonials | contact | faq | footer | generic
  headings: HeadingData[];
  paragraphs: string[];
  images: ImageData[];
  buttons: ButtonData[];
  lists: ListData[];
  raw?: string; // fallback text
}

export interface PageData {
  url: string;
  slug: string;
  title: string;
  description: string;
  sections: ExtractedSection[];
}

export interface CrawlResult {
  urls: string[];
  sitemapUrls: string[];
}

// --- CMS Seed Types (matching the Supabase schema) ---

export interface SeedSection {
  type: string;
  sort_order: number;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  animation_config: Record<string, unknown>;
}

export interface SeedPage {
  slug: string;
  title: string;
  sections: SeedSection[];
}

export interface SeedData {
  pages: SeedPage[];
}
