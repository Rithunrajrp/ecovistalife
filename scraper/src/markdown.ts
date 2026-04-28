// ============================================
// Markdown Generator — Converts extracted
// PageData into clean .md files
// ============================================

import fs from "fs";
import path from "path";
import type { PageData, ExtractedSection } from "./types.js";

function slugToFilename(slug: string): string {
  if (slug === "/" || slug === "") return "home";
  return slug
    .replace(/^\/+|\/+$/g, "")
    .replace(/\//g, "_")
    .replace(/[^a-z0-9_-]/gi, "-")
    .toLowerCase();
}

function sectionToMarkdown(section: ExtractedSection): string {
  const lines: string[] = [];

  // Section type comment
  lines.push(`<!-- section: ${section.type} -->`);
  lines.push("");

  // Headings
  for (const h of section.headings) {
    const prefix = "#".repeat(Math.min(h.level, 6));
    lines.push(`${prefix} ${h.text}`);
    lines.push("");
  }

  // Paragraphs
  for (const p of section.paragraphs) {
    lines.push(p);
    lines.push("");
  }

  // Images
  for (const img of section.images) {
    lines.push(`![${img.alt || "image"}](${img.src})`);
    lines.push("");
  }

  // Lists
  for (const list of section.lists) {
    for (let i = 0; i < list.items.length; i++) {
      const prefix = list.ordered ? `${i + 1}.` : "-";
      lines.push(`${prefix} ${list.items[i]}`);
    }
    lines.push("");
  }

  // Buttons / CTAs
  for (const btn of section.buttons) {
    lines.push(`[${btn.text}](${btn.href})`);
    lines.push("");
  }

  return lines.join("\n");
}

export function pageToMarkdown(page: PageData): string {
  const lines: string[] = [];

  // Front-matter style metadata
  lines.push("---");
  lines.push(`title: "${page.title}"`);
  lines.push(`slug: "${page.slug}"`);
  lines.push(`url: "${page.url}"`);
  if (page.description) {
    lines.push(`description: "${page.description.replace(/"/g, '\\"')}"`);
  }
  lines.push("---");
  lines.push("");

  // Title
  lines.push(`# ${page.title}`);
  lines.push("");

  // Sections
  for (const section of page.sections) {
    lines.push(sectionToMarkdown(section));
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function writeMarkdownFiles(pages: PageData[], outputDir: string, log: (msg: string) => void) {
  // Ensure output dir exists
  fs.mkdirSync(outputDir, { recursive: true });

  for (const page of pages) {
    const filename = slugToFilename(page.slug) + ".md";
    const filepath = path.join(outputDir, filename);
    const content = pageToMarkdown(page);

    fs.writeFileSync(filepath, content, "utf-8");
    log(`  ↳ Wrote ${filename} (${page.sections.length} sections)`);
  }
}
