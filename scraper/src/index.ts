#!/usr/bin/env node
// ============================================
// EcoVistaLife Website Scraper
// ============================================
// Usage:  cd scraper && npm run scrape
// ============================================

import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import { crawl } from "./crawler.js";
import { extractPages } from "./extractor.js";
import { writeMarkdownFiles } from "./markdown.js";
import { generateSeedData, writeSeedFile } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, "..", "output");

// ── Pretty logging ──

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgCyan: "\x1b[46m",
  bgMagenta: "\x1b[45m",
  bgYellow: "\x1b[43m",
};

function banner() {
  console.log("");
  console.log(`${COLORS.bold}${COLORS.cyan}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}║${COLORS.reset}  ${COLORS.bold}${COLORS.white}🕸️  EcoVistaLife Website Scraper${COLORS.reset}                 ${COLORS.bold}${COLORS.cyan}║${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}║${COLORS.reset}  ${COLORS.dim}Crawl → Extract → Markdown → CMS Seed${COLORS.reset}          ${COLORS.bold}${COLORS.cyan}║${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  console.log("");
}

function stepHeader(emoji: string, title: string) {
  console.log(`\n${COLORS.bold}${COLORS.yellow}${emoji}  ${title}${COLORS.reset}`);
  console.log(`${COLORS.dim}${"─".repeat(50)}${COLORS.reset}`);
}

function success(msg: string) {
  console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
}

function info(msg: string) {
  console.log(`${COLORS.dim}${msg}${COLORS.reset}`);
}

// ── Prompt helper ──

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function validateUrl(input: string): string | null {
  try {
    let url = input;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const parsed = new URL(url);
    if (!parsed.hostname.includes(".")) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

// ── Main ──

async function main() {
  banner();

  // 1. Ask for URL
  const rawUrl = await prompt(
    `${COLORS.bold}${COLORS.white}Enter the website URL to scrape: ${COLORS.reset}`
  );

  const startUrl = validateUrl(rawUrl);
  if (!startUrl) {
    console.log(`\n${COLORS.red}✗ Invalid URL: "${rawUrl}"${COLORS.reset}`);
    console.log(`${COLORS.dim}  Example: https://example.com${COLORS.reset}\n`);
    process.exit(1);
  }

  // 2. Ask for max pages
  const maxPagesRaw = await prompt(
    `${COLORS.bold}${COLORS.white}Max pages to crawl (default 50): ${COLORS.reset}`
  );
  const maxPages = parseInt(maxPagesRaw) || 50;

  console.log("");
  success(`Target: ${startUrl}`);
  success(`Max pages: ${maxPages}`);

  // 3. Launch browser
  stepHeader("🚀", "STEP 1: Launching Browser");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  success("Chromium launched");

  const startTime = Date.now();

  try {
    // 4. Crawl
    stepHeader("🕸️", "STEP 2: Crawling & Discovering Pages");
    const crawlResult = await crawl(browser, startUrl, maxPages, info);
    success(`Discovered ${crawlResult.urls.length} pages`);
    if (crawlResult.sitemapUrls.length > 0) {
      info(`  (${crawlResult.sitemapUrls.length} from sitemap.xml)`);
    }

    if (crawlResult.urls.length === 0) {
      console.log(`\n${COLORS.red}✗ No pages found. Check the URL and try again.${COLORS.reset}\n`);
      await browser.close();
      process.exit(1);
    }

    // 5. Extract
    stepHeader("🧠", "STEP 3: Extracting Structured Content");
    const pages = await extractPages(browser, crawlResult.urls, info);
    success(`Extracted content from ${pages.length} pages`);

    // Close browser — no longer needed
    await browser.close();

    // 6. Generate Markdown
    stepHeader("📝", "STEP 4: Generating Markdown Files");
    const mdDir = path.join(OUTPUT_DIR, "markdown");
    writeMarkdownFiles(pages, mdDir, info);
    success(`Markdown files saved to /scraper/output/markdown/`);

    // 7. Generate Seed
    stepHeader("💾", "STEP 5: Generating CMS Seed Data");
    const seedData = generateSeedData(pages);
    writeSeedFile(seedData, OUTPUT_DIR, info);
    success(`Seed JSON saved to /scraper/output/seed.json`);

    // 8. Summary
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const totalSections = seedData.pages.reduce((s, p) => s + p.sections.length, 0);

    console.log("");
    console.log(`${COLORS.bold}${COLORS.green}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}║${COLORS.reset}  ${COLORS.bold}${COLORS.white}✅  Scraping Complete!${COLORS.reset}                           ${COLORS.bold}${COLORS.green}║${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}╠══════════════════════════════════════════════════╣${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}║${COLORS.reset}  Pages scraped:    ${COLORS.bold}${pages.length}${COLORS.reset}${" ".repeat(30 - String(pages.length).length)}${COLORS.bold}${COLORS.green}║${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}║${COLORS.reset}  Sections found:   ${COLORS.bold}${totalSections}${COLORS.reset}${" ".repeat(30 - String(totalSections).length)}${COLORS.bold}${COLORS.green}║${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}║${COLORS.reset}  Time elapsed:     ${COLORS.bold}${elapsed}s${COLORS.reset}${" ".repeat(29 - String(elapsed).length)}${COLORS.bold}${COLORS.green}║${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}╠══════════════════════════════════════════════════╣${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}║${COLORS.reset}  ${COLORS.dim}Output:${COLORS.reset}                                         ${COLORS.bold}${COLORS.green}║${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}║${COLORS.reset}    📁 scraper/output/markdown/*.md                ${COLORS.bold}${COLORS.green}║${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}║${COLORS.reset}    📄 scraper/output/seed.json                    ${COLORS.bold}${COLORS.green}║${COLORS.reset}`);
    console.log(`${COLORS.bold}${COLORS.green}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
    console.log("");

    // Print page list
    console.log(`${COLORS.dim}Pages scraped:${COLORS.reset}`);
    for (const p of pages) {
      const sCount = p.sections.length;
      console.log(
        `  ${COLORS.cyan}${p.slug}${COLORS.reset} → ${sCount} section${sCount !== 1 ? "s" : ""} ${COLORS.dim}(${p.title})${COLORS.reset}`
      );
    }
    console.log("");

  } catch (err) {
    await browser.close();
    console.log(`\n${COLORS.red}✗ Fatal error: ${(err as Error).message}${COLORS.reset}`);
    console.log(`${COLORS.dim}${(err as Error).stack}${COLORS.reset}\n`);
    process.exit(1);
  }
}

main();
