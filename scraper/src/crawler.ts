// ============================================
// Crawler — Discovers all internal URLs
// ============================================

import type { Browser, Page } from "puppeteer";
import type { CrawlResult } from "./types.js";

const IGNORED_EXTENSIONS = [
  ".pdf", ".zip", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
  ".mp4", ".mp3", ".wav", ".ico", ".woff", ".woff2", ".ttf", ".eot",
  ".css", ".js", ".json", ".xml",
];

const IGNORED_PREFIXES = ["mailto:", "tel:", "javascript:", "#", "data:"];

function normalizeUrl(raw: string, origin: string): string | null {
  try {
    // Skip anchors, mailto, etc.
    if (IGNORED_PREFIXES.some((p) => raw.startsWith(p))) return null;

    const url = new URL(raw, origin);

    // Same-origin only
    if (url.origin !== origin) return null;

    // Skip binary/asset files
    const path = url.pathname.toLowerCase();
    if (IGNORED_EXTENSIONS.some((ext) => path.endsWith(ext))) return null;

    // Strip hash, normalize trailing slash
    url.hash = "";
    url.search = "";
    let clean = url.href;
    if (clean.endsWith("/") && clean !== url.origin + "/") {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return null;
  }
}

async function trySitemap(origin: string): Promise<string[]> {
  const urls: string[] = [];
  try {
    const res = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return urls;
    const text = await res.text();

    // Simple XML loc extraction
    const matches = text.matchAll(/<loc>(.*?)<\/loc>/gi);
    for (const m of matches) {
      const normalized = normalizeUrl(m[1], origin);
      if (normalized) urls.push(normalized);
    }
  } catch {
    // sitemap not available — that's fine
  }
  return urls;
}

export async function crawl(
  browser: Browser,
  startUrl: string,
  maxPages: number = 100,
  log: (msg: string) => void = console.log
): Promise<CrawlResult> {
  const origin = new URL(startUrl).origin;
  const visited = new Set<string>();
  const queue: string[] = [];
  const allUrls: string[] = [];

  // 1. Try sitemap first
  log("  ↳ Checking /sitemap.xml...");
  const sitemapUrls = await trySitemap(origin);
  if (sitemapUrls.length > 0) {
    log(`  ↳ Found ${sitemapUrls.length} URLs in sitemap`);
    for (const u of sitemapUrls) {
      if (!visited.has(u)) {
        visited.add(u);
        queue.push(u);
      }
    }
  }

  // 2. Always add the start URL
  const normalizedStart = normalizeUrl(startUrl, origin) || startUrl;
  if (!visited.has(normalizedStart)) {
    visited.add(normalizedStart);
    queue.unshift(normalizedStart);
  }

  // 3. BFS crawl
  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );

  while (queue.length > 0 && allUrls.length < maxPages) {
    const currentUrl = queue.shift()!;
    allUrls.push(currentUrl);

    try {
      log(`  ↳ Crawling [${allUrls.length}/${maxPages}]: ${currentUrl}`);
      await page.goto(currentUrl, { waitUntil: "networkidle2", timeout: 20000 });

      // Extract all links from the page
      const hrefs: string[] = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]")).map(
          (a) => (a as HTMLAnchorElement).href
        );
      });

      for (const href of hrefs) {
        const normalized = normalizeUrl(href, origin);
        if (normalized && !visited.has(normalized)) {
          visited.add(normalized);
          queue.push(normalized);
        }
      }
    } catch (err) {
      log(`  ⚠ Failed to crawl ${currentUrl}: ${(err as Error).message}`);
    }
  }

  await page.close();

  return { urls: allUrls, sitemapUrls };
}
