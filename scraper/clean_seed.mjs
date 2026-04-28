import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdownDir = path.join(__dirname, "output", "markdown");
const seedFile = path.join(__dirname, "output", "seed.json");

const seedData = JSON.parse(fs.readFileSync(seedFile, "utf8"));

// Normalize arrays or duplicated string lines to unique lines
function getUniqueLines(text) {
  if (!text) return "";
  if (Array.isArray(text)) return [...new Set(text)].join("\n");
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  return [...new Set(lines)].join("\n");
}

function classifySection(textStr) {
  const text = (textStr || "").toLowerCase();
  if (text.includes("where craftsmanship meets") || text.includes("crafted with care")) return "hero";
  if (text.match(/terms and conditions|privacy policy|copyright/i)) return "footer";
  if (text.includes("contact us") || text.includes("info@ecovista")) return "contact";
  if (text.includes("frequently asked questions")) return "faq";
  if (text.includes("what our clients are saying") || text.includes("mrs.") || text.includes("mr.")) return "testimonials";
  if (text.match(/amenities|facilities|cctv|secure gated community/i)) return "features";
  if (text.length > 300) return "about";
  return "text";
}

const pages = [];

for (const page of seedData.pages) {
  let slug = page.slug === "home" ? "/" : `/${page.slug.replace(/^\/+/, "")}`;
  
  const cleanedSections = [];
  let foundHero = false;
  
  page.sections.forEach((sec, idx) => {
    let type = sec.type;
    let content = { ...sec.content };
    
    // Clean strings and deduplicate
    for (const key of Object.keys(content)) {
      if (typeof content[key] === "string") {
         let cleaned = getUniqueLines(content[key]);
         content[key] = cleaned.replace(/\s+/g, ' ').trim();
      }
    }
    
    if (type === "image_text" || type === "text") {
       const inferred = classifySection([content.heading, content.body].join(" "));
       if (inferred === "hero" && !foundHero) {
           type = "hero";
           foundHero = true;
       } else if (inferred !== "text") {
           type = inferred;
       }
    }
    
    if (type === "hero") {
      content.buttons = content.buttons || [{ text: "Get Started", href: "/contact" }];
    }
    
    cleanedSections.push({
      type,
      sort_order: sec.sort_order || idx,
      content,
      settings: sec.settings || { bgColor: "", textColor: "", paddingTop: "pt-0", paddingBottom: "pb-0" } // Keep simple
    });
  });
  
  if (!cleanedSections.some(s => s.type === "hero")) {
     if (cleanedSections.length > 0) {
        cleanedSections[0].type = "hero";
     } else {
        cleanedSections.push({
          type: "hero",
          sort_order: 0,
          content: { heading: page.title, body: "", buttons: [], image: "" },
          settings: { bgColor: "", textColor: "", paddingTop: "pt-0", paddingBottom: "pb-0"}
        });
     }
  }
  
  pages.push({
    slug,
    title: String(page.title).trim(),
    sections: cleanedSections
  });
}

// Ensure unique pages are not blank empty arrays
const finalData = { pages };
const finalJson = JSON.stringify(finalData, null, 2);

fs.writeFileSync(path.join(__dirname, "output", "final_seed.json"), finalJson, "utf8");
console.log("Successfully generated final_seed.json");
