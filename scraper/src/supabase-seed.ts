// ============================================
// Supabase Seeder — Reads seed.json, cleans data,
// and inserts pages + blocks into the CMS
// ============================================
// Usage: cd scraper && npm run seed
// ============================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Supabase connection (reuses the project's env) ---
const ENV_PATH = path.resolve(__dirname, "../../.env.local");
const envContent = fs.readFileSync(ENV_PATH, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("✗ Missing SUPABASE_URL or SUPABASE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Colors ---
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  white: "\x1b[37m",
};

function log(msg: string) { console.log(msg); }
function ok(msg: string) { console.log(`${C.green}✓ ${msg}${C.reset}`); }
function warn(msg: string) { console.log(`${C.yellow}⚠ ${msg}${C.reset}`); }
function err(msg: string) { console.log(`${C.red}✗ ${msg}${C.reset}`); }
function info(msg: string) { console.log(`${C.dim}  ${msg}${C.reset}`); }

// --- Junk page filters ---

// Pages to SKIP entirely (404s, archives, WP internals)
const SKIP_SLUGS = [
  /^channel-partner\/uc_content/,   // Elementor tab fragments (404)
  /^author\//,                       // Author archive pages
  /^category\//,                     // Category archives
  /^\d{4}\/\d{2}/,                  // Date archives (2024/04, 2024/04/17)
  /^tag\//,                          // Tag archives
  /^page\/\d+/,                      // Pagination pages
];

const SKIP_TITLES = [
  /page not found/i,
  /404/i,
];

// Footer block that appears on every page — deduplicate
const FOOTER_HEADING = "Get In Touch";

function shouldSkipPage(page: any): boolean {
  if (SKIP_SLUGS.some(r => r.test(page.slug))) return true;
  if (SKIP_TITLES.some(r => r.test(page.title))) return true;
  // Pages with zero meaningful sections after filtering
  return false;
}

function cleanTitle(title: string): string {
  // Remove " - ecovistalife" suffix
  return title
    .replace(/\s*[-–|]\s*ecovistalife\s*$/i, "")
    .replace(/\s*[-–|]\s*Ecovistalife\s*$/i, "")
    .trim();
}

function cleanSections(sections: any[]): any[] {
  // Remove footer "Get In Touch" sections (the site-wide footer scraped into every page)
  const filtered = sections.filter(s => {
    if (s.content?.heading === FOOTER_HEADING && s.content?.body?.includes("Copyright")) {
      return false;
    }
    // Remove 404 blocks
    if (s.content?.heading === "404") return false;
    return true;
  });
  return filtered.map((s, i) => ({ ...s, sort_order: i }));
}

// --- Main ---

const PREMIUM_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000"
];

function getRandomPremiumImage() {
  return PREMIUM_IMAGES[Math.floor(Math.random() * PREMIUM_IMAGES.length)];
}

async function main() {
  log("");
  log(`${C.bold}${C.cyan}╔══════════════════════════════════════════════════╗${C.reset}`);
  log(`${C.bold}${C.cyan}║${C.reset}  ${C.bold}${C.white}💾  CMS Seeder — Scraped Data → Supabase${C.reset}        ${C.bold}${C.cyan}║${C.reset}`);
  log(`${C.bold}${C.cyan}╚══════════════════════════════════════════════════╝${C.reset}`);
  log("");

  // 1. Load seed.json
  const seedPath = path.resolve(__dirname, "../output/seed.json");
  if (!fs.existsSync(seedPath)) {
    err("seed.json not found. Run 'npm run scrape' first.");
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  const allPages: any[] = raw.pages || [];
  log(`${C.dim}Loaded ${allPages.length} raw pages from seed.json${C.reset}`);

  // 2. Filter and clean
  const cleanPages = allPages
    .filter(p => !shouldSkipPage(p))
    .map(p => {
      let finalSlug = p.slug.replace(/\//g, "-").replace(/^-+|-+$/g, "");
      if (finalSlug === "") finalSlug = "home";
      return {
        ...p,
        title: cleanTitle(p.title),
        slug: finalSlug,
        sections: cleanSections(p.sections),
      };
    })
    .filter(p => p.sections.length > 0); // Drop pages with no content after cleanup

  // Inject missing projects page
  if (!cleanPages.some(p => p.slug === "projects")) {
    cleanPages.push({
      title: "Our Projects",
      slug: "projects",
      sections: [
        {
          type: "projects_grid",
          content: { heading: "Featured Properties", filterType: "all" },
          settings: {}
        }
      ]
    });
  }

  // Inject Hero sections & Fallback images
  cleanPages.forEach(p => {
    if (!p.sections.some((s: any) => s.type === "hero")) {
      p.sections.unshift({
        type: "hero",
        sort_order: -1,
        content: {
          title: cleanTitle(p.title),
          subtitle: "Explore our premium sustainable spaces.",
          image: getRandomPremiumImage()
        },
        settings: {}
      });
    }

    p.sections.forEach((s: any, idx: number) => {
      s.sort_order = idx;
      if (s.type === "image_text" || s.type === "image") {
        if (!s.content.image || s.content.image.trim() === "") {
          s.content.image = getRandomPremiumImage();
        }
      }
    });
  });

  log(`${C.dim}After filtering: ${cleanPages.length} valid pages${C.reset}`);
  log("");

  for (const p of cleanPages) {
    info(`📄 ${p.slug} — "${p.title}" (${p.sections.length} blocks)`);
  }
  log("");

  // 3. Clear existing pages + blocks
  log(`${C.bold}${C.yellow}🗑️  Clearing existing CMS data...${C.reset}`);

  const { error: delBlocksErr } = await supabase
    .from("blocks")
    .delete()
    .not("page_id", "is", null); // Only delete page-linked blocks

  if (delBlocksErr) {
    warn(`Could not clear blocks: ${delBlocksErr.message}`);
  } else {
    ok("Cleared existing page blocks");
  }

  const { error: delPagesErr } = await supabase
    .from("pages")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

  if (delPagesErr) {
    warn(`Could not clear pages: ${delPagesErr.message}`);
  } else {
    ok("Cleared existing pages");
  }

  // 4. Insert pages and blocks
  log("");
  log(`${C.bold}${C.cyan}📥  Inserting new pages & blocks...${C.reset}`);

  let totalBlocks = 0;
  let pagesCreated = 0;

  for (const p of cleanPages) {
    // Create the page
    const { data: pageRow, error: pageErr } = await supabase
      .from("pages")
      .insert([{
        title: p.title,
        slug: p.slug,
        is_published: true,
      }])
      .select()
      .single();

    if (pageErr) {
      err(`Failed to create page "${p.slug}": ${pageErr.message}`);
      continue;
    }

    pagesCreated++;
    const pageId = pageRow.id;

    // Create blocks for this page
    for (const section of p.sections) {
      const blockData: Record<string, unknown> = {
        page_id: pageId,
        type: section.type,
        sort_order: section.sort_order,
        content: section.content,
        settings: section.settings || { bgColor: "", textColor: "", paddingTop: "pt-0", paddingBottom: "pb-0" },
        animation_config: { type: "fade_up", duration: 0.8, delay: 0.1, ease: "power2.out", trigger: "scroll" },
      };

      const { error: blockErr } = await supabase
        .from("blocks")
        .insert([blockData]);

      if (blockErr) {
        warn(`  Block "${section.type}" for ${p.slug}: ${blockErr.message}`);
      } else {
        totalBlocks++;
      }
    }

    ok(`  ${p.slug} → ${p.sections.length} blocks`);
  }

  // 5. Summary
  log("");
  log(`${C.bold}${C.green}╔══════════════════════════════════════════════════╗${C.reset}`);
  log(`${C.bold}${C.green}║${C.reset}  ${C.bold}${C.white}✅  Seeding Complete!${C.reset}                           ${C.bold}${C.green}║${C.reset}`);
  log(`${C.bold}${C.green}╠══════════════════════════════════════════════════╣${C.reset}`);
  log(`${C.bold}${C.green}║${C.reset}  Pages created:   ${C.bold}${pagesCreated}${C.reset}${" ".repeat(30 - String(pagesCreated).length)}${C.bold}${C.green}║${C.reset}`);
  log(`${C.bold}${C.green}║${C.reset}  Blocks inserted:  ${C.bold}${totalBlocks}${C.reset}${" ".repeat(29 - String(totalBlocks).length)}${C.bold}${C.green}║${C.reset}`);
  log(`${C.bold}${C.green}╚══════════════════════════════════════════════════╝${C.reset}`);
  log("");
}

main().catch((e) => {
  err(`Fatal: ${e.message}`);
  process.exit(1);
});
