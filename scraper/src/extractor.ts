// ============================================
// Extractor — Visits each page and extracts
// structured content from the rendered DOM
// ============================================

import type { Browser } from "puppeteer";
import type { PageData, ExtractedSection, HeadingData, ImageData, ButtonData, ListData } from "./types.js";

// --- Section type heuristics (runs in Node, not browser) ---

const SECTION_HINTS: Record<string, RegExp> = {
  hero: /hero|banner|jumbotron|splash|masthead|showcase/i,
  features: /feature|benefit|advantage|highlight|capability/i,
  about: /about|who-we-are|company|our.?story|overview/i,
  services: /service|solution|offering|what-we-do/i,
  testimonials: /testimonial|review|quote|client.?say/i,
  contact: /contact|get.?in.?touch|reach.?us|enquir/i,
  faq: /faq|question|accordion/i,
  footer: /footer|site.?info/i,
  gallery: /gallery|portfolio|showcase|grid/i,
  cta: /cta|call.?to.?action|ready|get.?started|sign.?up/i,
  team: /team|people|staff|member/i,
  pricing: /pricing|plan|package/i,
  stats: /stat|number|counter|metric|achievement/i,
  blog: /blog|article|news|post|insight/i,
  projects: /project|work|case.?stud/i,
};

function classifySection(el: { tag: string; id: string; className: string; text: string }): string {
  const blob = `${el.tag} ${el.id} ${el.className} ${el.text}`.toLowerCase();
  if (el.tag === "footer") return "footer";
  if (el.tag === "header" || el.tag === "nav") return "nav";
  for (const [type, regex] of Object.entries(SECTION_HINTS)) {
    if (regex.test(blob)) return type;
  }
  return "generic";
}

// Browser-side scripts as STRINGS so esbuild cannot transform them
const SCROLL_SCRIPT = `
(async () => {
  await new Promise(function(resolve) {
    var totalHeight = 0;
    var distance = 400;
    var timer = setInterval(function() {
      var scrollHeight = document.body.scrollHeight;
      window.scrollBy(0, distance);
      totalHeight += distance;
      if (totalHeight >= scrollHeight) {
        clearInterval(timer);
        window.scrollTo(0, 0);
        resolve();
      }
    }, 100);
    setTimeout(function() { clearInterval(timer); window.scrollTo(0, 0); resolve(); }, 10000);
  });
})()
`;

const EXTRACT_SCRIPT = `
(function() {
  function visibleText(el) {
    var style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return "";
    return (el.textContent || "").trim();
  }

  var title = document.title || "";
  var metaEl = document.querySelector('meta[name="description"]');
  var description = metaEl ? metaEl.content || "" : "";

  var sectionCandidates = [];
  var semanticTags = ["header", "nav", "section", "article", "aside", "footer", "main"];
  for (var t = 0; t < semanticTags.length; t++) {
    var tag = semanticTags[t];
    var els = document.querySelectorAll(tag);
    for (var e = 0; e < els.length; e++) {
      var el = els[e];
      var parent = el.parentElement;
      if (parent === document.body || (parent && parent.tagName === "MAIN") || (parent && parent.parentElement === document.body)) {
        sectionCandidates.push(el);
      }
    }
  }

  if (sectionCandidates.length < 2) {
    var container = document.querySelector("main") || document.body;
    var children = container.children;
    for (var c = 0; c < children.length; c++) {
      if (children[c].tagName === "DIV" && children[c].children.length > 0) {
        sectionCandidates.push(children[c]);
      }
    }
  }

  var filtered = sectionCandidates.filter(function(el) {
    return !sectionCandidates.some(function(other) { return other !== el && other.contains(el); });
  });

  var sections = [];
  for (var f = 0; f < filtered.length; f++) {
    var sec = filtered[f];

    var headings = [];
    sec.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(function(h) {
      var text = visibleText(h);
      if (text) headings.push({ level: parseInt(h.tagName[1]), text: text });
    });

    var paragraphs = [];
    sec.querySelectorAll("p").forEach(function(p) {
      var text = visibleText(p);
      if (text && text.length > 10) paragraphs.push(text);
    });

    var images = [];
    sec.querySelectorAll("img").forEach(function(img) {
      var src = img.src || img.dataset.src || "";
      var alt = img.alt || "";
      if (src && src.indexOf("data:image/svg") === -1 && src.indexOf("1x1") === -1) {
        images.push({ src: src, alt: alt });
      }
    });

    sec.querySelectorAll("[style]").forEach(function(styled) {
      var bg = styled.style.backgroundImage;
      if (bg && bg.indexOf("url(") === 0) {
        var src = bg.slice(4, -1).replace(/["']/g, "");
        if (src.indexOf("http") === 0) images.push({ src: src, alt: "" });
      }
    });

    var buttons = [];
    sec.querySelectorAll("a, button").forEach(function(btn) {
      var text = visibleText(btn);
      var href = btn.href || "";
      if (text && text.length < 60 && href.indexOf("javascript:") !== 0) {
        var nav = btn.closest("nav, header");
        if (!nav) buttons.push({ text: text, href: href });
      }
    });

    var lists = [];
    sec.querySelectorAll("ul, ol").forEach(function(list) {
      var items = [];
      list.querySelectorAll(":scope > li").forEach(function(li) {
        var text = visibleText(li);
        if (text) items.push(text);
      });
      if (items.length > 0) lists.push({ items: items, ordered: list.tagName === "OL" });
    });

    var sectionText = visibleText(sec).slice(0, 200);

    sections.push({
      tag: sec.tagName.toLowerCase(),
      id: sec.id || "",
      className: typeof sec.className === "string" ? sec.className : "",
      headings: headings,
      paragraphs: paragraphs,
      images: images,
      buttons: buttons,
      lists: lists,
      text: sectionText
    });
  }

  return { title: title, description: description, sections: sections };
})()
`;

// --- Main Extract Function ---

export async function extractPages(
  browser: Browser,
  urls: string[],
  log: (msg: string) => void = console.log
): Promise<PageData[]> {
  const pages: PageData[] = [];
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  );

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = new URL(url).pathname || "/";

    log(`  ↳ Extracting [${i + 1}/${urls.length}]: ${url}`);

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 25000 });

      // Auto-scroll (string-based, esbuild safe)
      await page.evaluate(SCROLL_SCRIPT);

      // Wait for images to settle
      await new Promise((r) => setTimeout(r, 1000));

      // Extract content (string-based, esbuild safe)
      const raw = await page.evaluate(EXTRACT_SCRIPT) as any;

      // Post-process: classify sections (runs in Node)
      const sections: ExtractedSection[] = raw.sections.map((s: any) => {
        const sectionType = classifySection(s);
        return {
          type: sectionType,
          headings: s.headings as HeadingData[],
          paragraphs: s.paragraphs,
          images: s.images as ImageData[],
          buttons: s.buttons as ButtonData[],
          lists: s.lists as ListData[],
        };
      });

      // Filter out nav/empty sections
      const meaningful = sections.filter(
        (s) =>
          s.type !== "nav" &&
          (s.headings.length > 0 || s.paragraphs.length > 0 || s.images.length > 0)
      );

      pages.push({
        url,
        slug,
        title: raw.title,
        description: raw.description,
        sections: meaningful,
      });
    } catch (err) {
      log(`  ⚠ Failed to extract ${url}: ${(err as Error).message}`);
    }
  }

  await page.close();
  return pages;
}
