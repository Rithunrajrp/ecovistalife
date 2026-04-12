import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables manually
const envPath = path.resolve(process.cwd(), ".env.local");
const envVars = fs.readFileSync(envPath, "utf-8").split("\n");
const env: Record<string, string> = {};
for (const line of envVars) {
  const [key, ...values] = line.split("=");
  if (key && values.length > 0) {
    env[key.trim()] = values.join("=").trim().replace(/"/g, "");
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding started...");

  // PAGES
  console.log("Seeding Pages...");
  const pages = [
    { title: "Home", slug: "home" },
    { title: "About Us", slug: "about" },
    { title: "Our Projects", slug: "projects" },
    { title: "Insights & Blog", slug: "blogs" },
    { title: "Contact", slug: "contact" }
  ];

  for (const page of pages) {
    // Upsert equivalent by checking first
    const { data: existing } = await supabase.from("pages").select("id").eq("slug", page.slug).single();
    let pageId;
    if (!existing) {
      const { data } = await supabase.from("pages").insert([page]).select().single();
      pageId = data?.id;
      console.log(`Created page: ${page.slug}`);
    } else {
      pageId = existing.id;
      console.log(`Page exists: ${page.slug}`);
    }
  }

  // Fetch all pages
  const { data: allPages } = await supabase.from("pages").select("*");
  const getPageId = (slug: string) => allPages?.find((p: any) => p.slug === slug)?.id;

  // HOME BLOCKS
  await insertBlocks(getPageId("home"), [
    { type: 'hero', sort_order: 0, content: {"title": "Where Nature Meets Luxury.", "subtitle": "Discover exquisitely designed, sustainable homes that offer an unparalleled standard of living. Invest in a future that values both elegance and the environment.", "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000", "buttonText": "Explore Projects", "buttonLink": "/projects"} },
    { type: 'projects_grid', sort_order: 1, content: {"heading": "Featured Projects", "filterType": "all"} },
    { type: 'text', sort_order: 2, content: {"heading": "Redefining Modern Living", "subheading": "About EcoVistaLife", "body": "We are committed to delivering exceptional real estate developments that perfectly balance luxurious amenities with sustainable practices. Every project is a testament to our dedication towards innovation and environmental consciousness."} },
    { type: 'blogs_grid', sort_order: 3, content: {"heading": "Latest News"} },
    { type: 'cta', sort_order: 4, content: {"heading": "Ready to step into luxury living?", "description": "Get in touch with our experts today and discover the perfect property that matches your lifestyle and aspirations.", "buttonText": "Contact Us Today", "buttonLink": "/contact"} }
  ]);

  // ABOUT BLOCKS
  await insertBlocks(getPageId("about"), [
    { type: 'hero', sort_order: 0, content: {"title": "About EcoVistaLife", "subtitle": "Pioneering sustainable luxury in real estate development since 2010.", "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"} },
    { type: 'image_text', sort_order: 1, content: {"heading": "Building the Future, Naturally.", "body": "Founded on the principles of sustainability and uncompromising quality, EcoVistaLife emerged with a vision to redefine the real estate landscape. We believe that a home is more than just a structure; it''s a sanctuary that should harmonize with its natural surroundings.\n\nOver the years, our dedicated team of architects, designers, and environmental experts have collaborated to craft living spaces that not only offer premium luxury but also significantly reduce environmental impact.", "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800", "imagePosition": "left"} },
    { type: 'text', sort_order: 2, content: {"heading": "Our Vision", "body": "To be the global leader in sustainable luxury real estate, creating intelligent communities that inspire a modern, eco-conscious way of living while preserving the planet for future generations."} },
    { type: 'text', sort_order: 3, content: {"heading": "Our Mission", "body": "To design and build premium properties that seamlessly integrate cutting-edge green technologies, timeless aesthetics, and superior comfort without compromising on environmental integrity."} }
  ]);

  // PROJECTS BLOCKS
  await insertBlocks(getPageId("projects"), [
    { type: 'hero', sort_order: 0, content: {"title": "Our Projects", "subtitle": "Explore our diverse portfolio of sustainable luxury properties.", "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000"} },
    { type: 'projects_grid', sort_order: 1, content: {"heading": "All Projects", "filterType": "all"} }
  ]);

  // BLOGS BLOCKS
  await insertBlocks(getPageId("blogs"), [
    { type: 'hero', sort_order: 0, content: {"title": "Insights & News", "subtitle": "Latest trends in real estate, sustainable living, and home design.", "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000"} },
    { type: 'blogs_grid', sort_order: 1, content: {"heading": "Latest Articles"} }
  ]);

  // CONTACT BLOCKS
  await insertBlocks(getPageId("contact"), [
    { type: 'hero', sort_order: 0, content: {"title": "Contact Us", "subtitle": "We are here to help you find your perfect home.", "image": ""} },
    { type: 'contact_info', sort_order: 1, content: {"heading": "Get in Touch", "body": "Reach out to us for any inquiries. We''ll get back to you as soon as possible."} },
    { type: 'form', sort_order: 2, content: {"heading": "Send us a Message", "formId": "f1000000-0000-0000-0000-000000000001", "buttonText": "Submit"} }
  ]);

  console.log("Seeding complete!");
}

async function insertBlocks(pageId: string | undefined, blocks: any[]) {
  if (!pageId) return;

  // Delete old blocks
  await supabase.from("blocks").delete().eq("page_id", pageId);

  // Insert new blocks
  for (const block of blocks) {
    await supabase.from("blocks").insert([{
      page_id: pageId,
      type: block.type,
      sort_order: block.sort_order,
      content: block.content
    }]);
  }
  console.log(`Inserted ${blocks.length} blocks for page ${pageId}`);
}

seed().catch(console.error);
