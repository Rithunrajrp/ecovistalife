// ============================================
// Seed Generator — Converts extracted PageData
// into CMS-ready JSON for Supabase seeding
// ============================================

import fs from "fs";
import path from "path";
import type { PageData, ExtractedSection, SeedData, SeedPage, SeedSection } from "./types.js";

// --- Map our extracted section types to CMS block types ---

const CMS_BLOCK_MAP: Record<string, string> = {
  hero: "hero",
  features: "text",
  about: "text",
  services: "text",
  testimonials: "text",
  contact: "contact_info",
  faq: "faq",
  footer: "text",
  gallery: "gallery",
  cta: "cta",
  team: "text",
  pricing: "text",
  stats: "text",
  blog: "blogs_grid",
  projects: "projects_grid",
  generic: "text",
};

function sectionToSeedContent(section: ExtractedSection): Record<string, unknown> {
  const blockType = CMS_BLOCK_MAP[section.type] || "text";

  switch (blockType) {
    case "hero": {
      return {
        title: section.headings[0]?.text || "",
        subtitle:
          section.paragraphs[0] ||
          (section.headings.length > 1 ? section.headings[1].text : ""),
        image: section.images[0]?.src || "",
        buttonText: section.buttons[0]?.text || "Learn More",
        buttonLink: section.buttons[0]?.href || "/",
      };
    }

    case "cta": {
      return {
        heading: section.headings[0]?.text || "Get Started",
        description: section.paragraphs[0] || "",
        buttonText: section.buttons[0]?.text || "Contact Us",
        buttonLink: section.buttons[0]?.href || "/contact",
      };
    }

    case "gallery": {
      return {
        heading: section.headings[0]?.text || "Gallery",
        images: section.images.map((img) => img.src),
      };
    }

    case "faq": {
      // Try to pair headings with paragraphs as Q&A
      const items: Array<{ question: string; answer: string }> = [];
      const subHeadings = section.headings.filter((h) => h.level >= 3);
      if (subHeadings.length > 0 && section.paragraphs.length >= subHeadings.length) {
        for (let i = 0; i < subHeadings.length; i++) {
          items.push({
            question: subHeadings[i].text,
            answer: section.paragraphs[i] || "",
          });
        }
      } else {
        // Fallback: use paragraphs alternately
        for (let i = 0; i < section.paragraphs.length; i += 2) {
          items.push({
            question: section.paragraphs[i] || "",
            answer: section.paragraphs[i + 1] || "",
          });
        }
      }
      return {
        heading: section.headings[0]?.text || "FAQ",
        items,
      };
    }

    case "contact_info": {
      return {
        heading: section.headings[0]?.text || "Contact Us",
        body: section.paragraphs.join("\n\n") || "",
      };
    }

    case "projects_grid": {
      return {
        heading: section.headings[0]?.text || "Our Projects",
        filterType: "all",
      };
    }

    case "blogs_grid": {
      return {
        heading: section.headings[0]?.text || "Latest Insights",
      };
    }

    // text (default) — covers about, features, services, team, stats, etc.
    default: {
      const heading = section.headings[0]?.text || "";
      const subheading =
        section.headings.length > 1 ? section.headings[1].text : "";
      const body = section.paragraphs.join("\n\n");

      return {
        heading,
        subheading,
        body: body || (section.lists.length > 0
          ? section.lists
              .flatMap((l) =>
                l.items.map((item, i) =>
                  l.ordered ? `${i + 1}. ${item}` : `• ${item}`
                )
              )
              .join("\n")
          : ""),
      };
    }
  }
}

function convertSection(section: ExtractedSection, index: number): SeedSection {
  const blockType = CMS_BLOCK_MAP[section.type] || "text";

  // For image-heavy text sections with an image, upgrade to image_text
  const hasImage = section.images.length > 0;
  const hasText = section.paragraphs.length > 0 || section.headings.length > 0;
  const finalType =
    blockType === "text" && hasImage && hasText ? "image_text" : blockType;

  let content: Record<string, unknown>;

  if (finalType === "image_text") {
    content = {
      heading: section.headings[0]?.text || "",
      body: section.paragraphs.join("\n\n"),
      image: section.images[0]?.src || "",
      imagePosition: index % 2 === 0 ? "left" : "right",
    };
  } else {
    content = sectionToSeedContent(section);
  }

  return {
    type: finalType,
    sort_order: index,
    content,
    settings: {
      bgColor: "",
      textColor: "",
      paddingTop: "pt-0",
      paddingBottom: "pb-0",
    },
    animation_config: {
      type: "none",
      duration: 0.8,
      delay: 0,
      ease: "power2.out",
      trigger: "scroll",
    },
  };
}

export function generateSeedData(pages: PageData[]): SeedData {
  const seedPages: SeedPage[] = pages.map((page) => {
    const slug = page.slug === "/" ? "home" : page.slug.replace(/^\/+/, "");

    const sections: SeedSection[] = page.sections.map((section, i) =>
      convertSection(section, i)
    );

    return {
      slug,
      title: page.title,
      sections,
    };
  });

  return { pages: seedPages };
}

export function writeSeedFile(seedData: SeedData, outputDir: string, log: (msg: string) => void) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filepath = path.join(outputDir, "seed.json");
  fs.writeFileSync(filepath, JSON.stringify(seedData, null, 2), "utf-8");

  const totalSections = seedData.pages.reduce((sum, p) => sum + p.sections.length, 0);
  log(`  ↳ Wrote seed.json (${seedData.pages.length} pages, ${totalSections} total blocks)`);
}
