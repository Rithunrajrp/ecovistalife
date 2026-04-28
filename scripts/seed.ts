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

// --- Default animation config ---
const ANIM_FADE_UP = { type: "fade_up", duration: 0.8, delay: 0.1, ease: "power2.out", trigger: "scroll" };
const ANIM_NONE = { type: "none", duration: 0.8, delay: 0, ease: "power2.out", trigger: "scroll" };

// --- Premium Unsplash images ---
const IMG = {
  heroHome: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000",
  heroAbout: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000",
  heroProjects: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000",
  heroBlog: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000",
  heroContact: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000",
  aboutSection: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
  frenchville: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800",
  mountShadows: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800",
  gardenia: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=800",
};

async function seed() {
  console.log("");
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  💾  Premium CMS Seeder → Supabase               ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("");

  // ═══════════════════════════════════════════════
  // 1. Clear existing page blocks & pages
  // ═══════════════════════════════════════════════
  console.log("🗑️  Clearing existing CMS data...");

  await supabase.from("blocks").delete().not("page_id", "is", null);
  await supabase.from("blocks").delete().not("project_id", "is", null);
  await supabase.from("pages").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("✓ Cleared pages & blocks");

  // ═══════════════════════════════════════════════
  // 2. CMS Pages
  // ═══════════════════════════════════════════════
  console.log("\n📥 Inserting pages...");

  const pages = [
    { title: "Home", slug: "home" },
    { title: "About Us", slug: "about-us" },
    { title: "Our Projects", slug: "projects" },
    { title: "Blog", slug: "blog" },
    { title: "Contact", slug: "contact" },
    { title: "EcoLife", slug: "ecolife" },
    { title: "Book a Site Visit", slug: "book-visit" },
  ];

  const pageIds: Record<string, string> = {};

  for (const page of pages) {
    const { data: existing } = await supabase.from("pages").select("id").eq("slug", page.slug).single();
    if (existing) {
      pageIds[page.slug] = existing.id;
      console.log(`  Page exists: ${page.slug}`);
    } else {
      const { data } = await supabase.from("pages").insert([{ ...page, is_published: true }]).select().single();
      pageIds[page.slug] = data?.id;
      console.log(`  ✓ Created: ${page.slug}`);
    }
  }

  // ═══════════════════════════════════════════════
  // 3. HOME page blocks
  // ═══════════════════════════════════════════════
  console.log("\n📄 Seeding HOME blocks...");
  await insertBlocks(pageIds["home"], [
    {
      type: "hero", sort_order: 0,
      content: {
        title: "Where Nature Meets Luxury.",
        subtitle: "Discover exquisitely designed, sustainable homes that offer an unparalleled standard of living. Invest in a future that values both elegance and the environment.",
        image: IMG.heroHome,
        buttonText: "Explore Projects",
        buttonLink: "/projects",
      },
      animation_config: ANIM_NONE,
    },
    {
      type: "text", sort_order: 1,
      content: {
        heading: "Redefining Modern Living",
        subheading: "About EcoVistaLife",
        body: "We are committed to delivering exceptional real estate developments that perfectly balance luxurious amenities with sustainable practices. Every project is a testament to our dedication towards innovation and environmental consciousness.\n\nProperty developers in Karamadai, ECOVISTALIFE sets itself apart by offering clients the unique opportunity to design homes that reflect their personal visions. Backed by a proven track record, we bring a strategic, market-aware approach that prioritizes exceptional value.",
      },
      animation_config: ANIM_FADE_UP,
    },
    {
      type: "projects_grid", sort_order: 2,
      content: { heading: "Featured Projects", filterType: "all" },
      animation_config: ANIM_FADE_UP,
    },
    {
      type: "cta", sort_order: 3,
      content: {
        heading: "Ready to step into luxury living?",
        description: "Get in touch with our experts today and discover the perfect property that matches your lifestyle and aspirations.",
        buttonText: "Contact Us Today",
        buttonLink: "/contact",
      },
      animation_config: ANIM_FADE_UP,
    },
  ]);

  // ═══════════════════════════════════════════════
  // 4. ABOUT US blocks
  // ═══════════════════════════════════════════════
  console.log("📄 Seeding ABOUT-US blocks...");
  await insertBlocks(pageIds["about-us"], [
    {
      type: "hero", sort_order: 0,
      content: {
        title: "About EcoVistaLife",
        subtitle: "Pioneering sustainable luxury in real estate development. Building the future, naturally.",
        image: IMG.heroAbout,
      },
      animation_config: ANIM_NONE,
    },
    {
      type: "image_text", sort_order: 1,
      content: {
        heading: "Building the Future, Naturally.",
        body: "Founded on the principles of sustainability and uncompromising quality, EcoVistaLife emerged with a vision to redefine the real estate landscape. We believe that a home is more than just a structure; it's a sanctuary that should harmonize with its natural surroundings.\n\nOver the years, our dedicated team of architects, designers, and environmental experts have collaborated to craft living spaces that not only offer premium luxury but also significantly reduce environmental impact.",
        image: IMG.aboutSection,
        imagePosition: "left",
      },
      animation_config: ANIM_FADE_UP,
    },
    {
      type: "text", sort_order: 2,
      content: {
        heading: "Our Vision",
        body: "To be the global leader in sustainable luxury real estate, creating intelligent communities that inspire a modern, eco-conscious way of living while preserving the planet for future generations.",
      },
      animation_config: ANIM_FADE_UP,
    },
    {
      type: "text", sort_order: 3,
      content: {
        heading: "Our Mission",
        body: "To design and build premium properties that seamlessly integrate cutting-edge green technologies, timeless aesthetics, and superior comfort without compromising on environmental integrity.",
      },
      animation_config: ANIM_FADE_UP,
    },
    {
      type: "cta", sort_order: 4,
      content: {
        heading: "Want to know more about us?",
        description: "Visit our projects or get in touch to learn how we're building a sustainable future.",
        buttonText: "View Projects",
        buttonLink: "/projects",
      },
      animation_config: ANIM_FADE_UP,
    },
  ]);

  // ═══════════════════════════════════════════════
  // 5. PROJECTS page blocks
  // ═══════════════════════════════════════════════
  console.log("📄 Seeding PROJECTS blocks...");
  await insertBlocks(pageIds["projects"], [
    {
      type: "hero", sort_order: 0,
      content: {
        title: "Our Projects",
        subtitle: "Explore our diverse portfolio of sustainable luxury properties across Coimbatore.",
        image: IMG.heroProjects,
      },
      animation_config: ANIM_NONE,
    },
    {
      type: "projects_grid", sort_order: 1,
      content: { heading: "All Projects", filterType: "all" },
      animation_config: ANIM_FADE_UP,
    },
  ]);

  // ═══════════════════════════════════════════════
  // 6. BLOG page blocks
  // ═══════════════════════════════════════════════
  console.log("📄 Seeding BLOG blocks...");
  await insertBlocks(pageIds["blog"], [
    {
      type: "hero", sort_order: 0,
      content: {
        title: "Insights & News",
        subtitle: "Latest trends in real estate, sustainable living, and home design.",
        image: IMG.heroBlog,
      },
      animation_config: ANIM_NONE,
    },
    {
      type: "blogs_grid", sort_order: 1,
      content: { heading: "Latest Articles" },
      animation_config: ANIM_FADE_UP,
    },
  ]);

  // ═══════════════════════════════════════════════
  // 7. CONTACT page blocks
  // ═══════════════════════════════════════════════
  console.log("📄 Seeding CONTACT blocks...");
  await insertBlocks(pageIds["contact"], [
    {
      type: "hero", sort_order: 0,
      content: {
        title: "Contact Us",
        subtitle: "We are here to help you find your perfect home. Reach out anytime.",
        image: IMG.heroContact,
      },
      animation_config: ANIM_NONE,
    },
    {
      type: "contact_info", sort_order: 1,
      content: {
        heading: "Get in Touch",
        body: "Reach out to us for any inquiries. We'll get back to you as soon as possible.\n\nDoor no. 60/1, 60/2, Thirumurugan Nagar, Krishna Park, Veeriyampalayam Road, Nehru Nagar, Kalapatti, Coimbatore – 641048\n\nECOVISTALIFE Site Office, EB Colony, next to SRSI School, Karamadai\n\n+91 97877 95555\ninfo@ecovistalife.in",
      },
      animation_config: ANIM_FADE_UP,
    },
  ]);

  // ═══════════════════════════════════════════════
  // 7.5 BOOK A SITE VISIT FORM
  // ═══════════════════════════════════════════════
  console.log("📄 Seeding BOOK-VISIT blocks and form...");

  // Fetch projects to populate the select options
  const { data: currentProjects } = await supabase.from("projects").select("id, title, location").order("title");
  const projectOptions = (currentProjects || []).map((p: any) => ({
    label: `${p.title} — ${p.location}`,
    value: p.id
  }));

  // Create the generic form record in the database
  const { data: formRecord, error: formError } = await supabase.from("forms").insert([{
    name: "Book a Site Visit",
    fields: [
      { name: "full_name", label: "Full Name", type: "text", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "phone", label: "Phone Number", type: "phone", required: true },
      { name: "project_id", label: "Select Project", type: "select", options: projectOptions, required: true },
      { name: "preferred_date", label: "Preferred Date", type: "date", required: true },
      {
        name: "preferred_time", label: "Preferred Time", type: "select", required: false,
        options: [
          { label: "Morning (9 AM \u2013 12 PM)", value: "Morning (9 AM \u2013 12 PM)" },
          { label: "Afternoon (12 PM \u2013 3 PM)", value: "Afternoon (12 PM \u2013 3 PM)" },
          { label: "Evening (3 PM \u2013 6 PM)", value: "Evening (3 PM \u2013 6 PM)" }
        ]
      },
      { name: "message", label: "Additional Notes", type: "textarea", required: false }
    ]
  }]).select().single();

  if (formError || !formRecord) {
    console.error("  ⚠ Failed to insert form:", formError);
  } else {
    // Insert the page blocks using the generic form component
    await insertBlocks(pageIds["book-visit"], [
      {
        type: "hero", sort_order: 0,
        content: {
          title: "Book a Site Visit",
          subtitle: "Experience our premium properties firsthand. Choose your preferred project, date, and time \u2014 we'll take care of the rest.",
          image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000",
        },
        animation_config: ANIM_NONE,
      },
      {
        type: "form", sort_order: 1,
        content: {
          heading: "Schedule Your Visit",
          formId: formRecord.id,
          buttonText: "Request Site Visit"
        },
        animation_config: ANIM_FADE_UP,
      },
    ]);
  }

  // ═══════════════════════════════════════════════
  // 8. ECOLIFE page blocks
  // ═══════════════════════════════════════════════
  console.log("📄 Seeding ECOLIFE blocks...");
  await insertBlocks(pageIds["ecolife"], [
    {
      type: "hero", sort_order: 0,
      content: {
        title: "EcoLife Living",
        subtitle: "Our community combines eco-friendly living with modern convenience, offering carefully planned residential plots that promote a responsible and harmonious lifestyle.",
        image: IMG.heroProjects,
      },
      animation_config: ANIM_NONE,
    },
    {
      type: "text", sort_order: 1,
      content: {
        heading: "Sustainable Communities",
        subheading: "Live Green, Live Better",
        body: "Explore our eco-friendly residential plots for sale, combining convenience and sustainability for a harmonious living environment. Discover our secure plots for sale in Coimbatore, offering safe, accessible spaces for your family or business.\n\nWe guarantee transparent pricing with no hidden fees, ensuring the best value for your investment in Coimbatore. Our dedicated team ensures a smooth property purchase experience, whether for land in Karamadai or nearby plots.",
      },
      animation_config: ANIM_FADE_UP,
    },
    {
      type: "cta", sort_order: 2,
      content: {
        heading: "Interested in sustainable living?",
        description: "Explore our eco-friendly residential plots and discover your perfect space.",
        buttonText: "Explore Projects",
        buttonLink: "/projects",
      },
      animation_config: ANIM_FADE_UP,
    },
  ]);

  // ═══════════════════════════════════════════════
  // 9. Update projects with descriptions and images, then seed project blocks
  // ═══════════════════════════════════════════════
  console.log("\n📦 Updating projects & seeding project blocks...");

  const projectUpdates = [
    {
      id: "b4000000-0000-0000-0000-000000000004",
      title: "Frenchville",
      description: "Frenchville is a premium villa community located in the serene locale of Sulur, Coimbatore. Designed with French-inspired architecture, these spacious villas feature lush green landscapes, modern amenities, and sustainable building practices that define the EcoVistaLife standard.",
      image: IMG.frenchville,
      heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000",
    },
    {
      id: "b3000000-0000-0000-0000-000000000003",
      title: "Ecolife Mount Shadows",
      description: "Ecolife Mount Shadows offers premium residential plots nestled in the foothills of Karamadai, Coimbatore. Surrounded by breathtaking mountain views and pristine air, this project is perfect for those seeking a tranquil retreat without compromising on modern connectivity.",
      image: IMG.mountShadows,
      heroImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000",
    },
    {
      id: "b1000000-0000-0000-0000-000000000001",
      title: "Ecolife Gardenia",
      description: "Ecolife Gardenia is a thoughtfully planned residential community in Kovilpalayam, Coimbatore. Offering affordable yet premium plots, Gardenia blends natural beauty with urban convenience, making it the ideal choice for families seeking a balanced lifestyle.",
      image: IMG.gardenia,
      heroImage: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=2000",
    },
  ];

  for (const proj of projectUpdates) {
    // Update project record with description and image
    await supabase.from("projects").update({
      description: proj.description,
      image: proj.image,
    }).eq("id", proj.id);

    // Delete any existing project blocks
    await supabase.from("blocks").delete().eq("project_id", proj.id);

    // Insert project-level blocks
    const projectBlocks = [
      {
        project_id: proj.id,
        type: "hero",
        sort_order: 0,
        content: {
          title: proj.title,
          subtitle: proj.description.split(".")[0] + ".",
          image: proj.heroImage,
        },
        settings: {},
        animation_config: ANIM_NONE,
      },
      {
        project_id: proj.id,
        type: "text",
        sort_order: 1,
        content: {
          heading: "About " + proj.title,
          body: proj.description,
        },
        settings: {},
        animation_config: ANIM_FADE_UP,
      },
      {
        project_id: proj.id,
        type: "image_text",
        sort_order: 2,
        content: {
          heading: "Premium Living Awaits",
          body: "Every detail of " + proj.title + " has been meticulously planned to offer you the perfect blend of luxury, comfort, and sustainability. From landscaped gardens to modern infrastructure, experience living at its finest.",
          image: proj.image,
          imagePosition: "left",
        },
        settings: {},
        animation_config: ANIM_FADE_UP,
      },
      {
        project_id: proj.id,
        type: "cta",
        sort_order: 3,
        content: {
          heading: "Interested in " + proj.title + "?",
          description: "Schedule a site visit today and experience the beauty of this project firsthand.",
          buttonText: "Book a Site Visit",
          buttonLink: "/contact",
        },
        settings: {},
        animation_config: ANIM_FADE_UP,
      },
    ];

    for (const block of projectBlocks) {
      const { error } = await supabase.from("blocks").insert([block]);
      if (error) console.log(`  ⚠ Block error for ${proj.title}: ${error.message}`);
    }
    console.log(`  ✓ ${proj.title} → 4 blocks + updated description/image`);
  }

  // ═══════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║  ✅  Premium Seeding Complete!                    ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
}

async function insertBlocks(pageId: string | undefined, blocks: any[]) {
  if (!pageId) return;

  // Delete old blocks for this page
  await supabase.from("blocks").delete().eq("page_id", pageId);

  // Insert new blocks
  for (const block of blocks) {
    const { error } = await supabase.from("blocks").insert([{
      page_id: pageId,
      type: block.type,
      sort_order: block.sort_order,
      content: block.content,
      settings: block.settings || { bgColor: "", textColor: "", paddingTop: "pt-0", paddingBottom: "pb-0" },
      animation_config: block.animation_config || ANIM_FADE_UP,
    }]);
    if (error) console.log(`  ⚠ Block error: ${error.message}`);
  }
  console.log(`  ✓ Inserted ${blocks.length} blocks`);
}

seed().catch(console.error);
