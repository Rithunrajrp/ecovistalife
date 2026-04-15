import { supabase } from "./supabase";
import { defaultCompositionContent } from "./composition";

// ============================================
// Pages
// ============================================

export async function getPages() {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPageBySlug(slug: string) {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getPageById(id: string) {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createPage(title: string, slug: string) {
  const { data, error } = await supabase
    .from("pages")
    .insert([{ title, slug }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePage(id: string, updates: { title?: string; slug?: string; is_published?: boolean }) {
  const { error } = await supabase.from("pages").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deletePage(id: string) {
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Blocks & Templates
// ============================================

export async function getBlockTemplates() {
  const { data, error } = await supabase
    .from("block_templates")
    .select("*")
    .order("created_at", { ascending: false });
  // Missing table / RLS / network must not break the page editor; templates are optional until migrated.
  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[cms] getBlockTemplates:", error.message);
    }
    return [];
  }
  return data || [];
}

export async function getBlockTemplateById(id: string) {
  const { data, error } = await supabase
    .from("block_templates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createBlockTemplate(name: string, description: string = "") {
  const { data, error } = await supabase
    .from("block_templates")
    .insert([{ name, description }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBlockTemplate(id: string, updates: { name?: string; description?: string }) {
  const { error } = await supabase.from("block_templates").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteBlockTemplate(id: string) {
  const { error } = await supabase.from("block_templates").delete().eq("id", id);
  if (error) throw error;
}

export async function getBlocksForPage(pageId: string) {
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getBlocksForTemplate(templateId: string) {
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getBlocksForProject(projectId: string) {
  const { data, error } = await supabase
    .from("blocks")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createBlock(
  pageId: string | null,
  type: string,
  sortOrder: number,
  content: Record<string, any> = {},
  settings: Record<string, any> = {},
  animationConfig: Record<string, any> = {},
  templateId: string | null = null,
  projectId: string | null = null
) {
  const full: Record<string, unknown> = {
    type,
    sort_order: sortOrder,
    content,
    settings,
    animation_config: animationConfig,
  };
  if (pageId != null) full.page_id = pageId;
  if (templateId != null) full.template_id = templateId;
  if (projectId != null) full.project_id = projectId;

  let { data, error } = await supabase.from("blocks").insert([full]).select().single();

  // Older DBs (init.sql only) often lack template_id / settings / animation_config → PostgREST 400
  if (error) {
    const minimal: Record<string, unknown> = {
      type,
      sort_order: sortOrder,
      content,
    };
    if (pageId != null) minimal.page_id = pageId;
    if (templateId != null) minimal.template_id = templateId;
    if (projectId != null) minimal.project_id = projectId;
    const second = await supabase.from("blocks").insert([minimal]).select().single();
    data = second.data;
    error = second.error;
  }

  if (error) throw error;
  return data!;
}

export async function updateBlock(
  id: string,
  updates: {
    content?: Record<string, any>;
    sort_order?: number;
    settings?: Record<string, any>;
    animation_config?: Record<string, any>;
  }
) {
  let { error } = await supabase.from("blocks").update(updates).eq("id", id);
  if (error) {
    const fallback: Record<string, unknown> = {};
    if (updates.content !== undefined) fallback.content = updates.content;
    if (updates.sort_order !== undefined) fallback.sort_order = updates.sort_order;
    if (Object.keys(fallback).length > 0) {
      ({ error } = await supabase.from("blocks").update(fallback).eq("id", id));
    }
  }
  if (error) throw error;
}

export async function deleteBlock(id: string) {
  const { error } = await supabase.from("blocks").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderBlocks(blocks: { id: string; sort_order: number }[]) {
  for (const block of blocks) {
    await supabase.from("blocks").update({ sort_order: block.sort_order }).eq("id", block.id);
  }
}

// ============================================
// Site footer (singleton) + library blocks
// ============================================

export const LIBRARY_BLOCK_TYPES = [
  "composition",
  "hero",
  "text",
  "image",
  "image_text",
  "gallery",
  "cta",
  "faq",
  "form",
  "projects_grid",
  "blogs_grid",
  "contact_info",
  "slideshow",
] as const;

export type LibraryBlockType = (typeof LIBRARY_BLOCK_TYPES)[number];

const DEFAULT_LIBRARY_CONTENT: Record<string, Record<string, unknown>> = {
  composition: defaultCompositionContent() as unknown as Record<string, unknown>,
  hero: {
    title: "Your Heading Here",
    subtitle: "A compelling subtitle to engage your visitors.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000",
    buttonText: "Get Started",
    buttonLink: "/",
  },
  text: {
    heading: "Section Title",
    subheading: "SUBTITLE",
    body: "Enter your content here.",
  },
  image: {
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800",
    caption: "",
    heading: "",
  },
  image_text: {
    heading: "Title",
    body: "Description goes here...",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800",
    imagePosition: "left",
  },
  gallery: { heading: "Gallery", images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800"] },
  cta: {
    heading: "Ready to get started?",
    description: "Take the next step today.",
    buttonText: "Contact Us",
    buttonLink: "/contact",
  },
  faq: {
    heading: "Frequently Asked Questions",
    items: [{ question: "What do you offer?", answer: "We offer premium, sustainable real estate." }],
  },
  form: { heading: "Contact Us", formId: "", buttonText: "Submit" },
  projects_grid: { heading: "Our Projects", filterType: "all" },
  blogs_grid: { heading: "Latest Insights" },
  contact_info: { heading: "Get in Touch", body: "Reach out to us anytime." },
  slideshow: {
    slides: [
      {
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000",
        text: "Luxury Living, Reimagined",
        subtext: "Discover premium homes that harmonise with nature.",
      },
    ],
    globalText: "",
    globalSubtext: "",
    timer: 5,
    transition: "fade",
    height: "large",
    overlayOpacity: 40,
  },
};

export function defaultLibraryContent(type: string) {
  return { ...(DEFAULT_LIBRARY_CONTENT[type] || {}) };
}

export async function getSiteFooter() {
  const { data, error } = await supabase.from("site_footer").select("*").eq("id", 1).maybeSingle();
  if (error) {
    if (process.env.NODE_ENV === "development") console.warn("[cms] getSiteFooter:", error.message);
    return null;
  }
  return data;
}

export async function upsertSiteFooter(updates: { content: Record<string, unknown>; settings: Record<string, unknown> }) {
  const { error } = await supabase.from("site_footer").upsert({
    id: 1,
    content: updates.content,
    settings: updates.settings,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function getLibraryBlocks() {
  const { data, error } = await supabase.from("library_blocks").select("*").order("created_at", { ascending: false });
  if (error) {
    if (process.env.NODE_ENV === "development") console.warn("[cms] getLibraryBlocks:", error.message);
    return [];
  }
  return data || [];
}

export async function getLibraryBlockById(id: string) {
  const { data, error } = await supabase.from("library_blocks").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data;
}

export async function createLibraryBlock(name: string, type: LibraryBlockType) {
  const content = defaultLibraryContent(type);
  const { data, error } = await supabase
    .from("library_blocks")
    .insert([
      {
        name,
        type,
        content,
        settings: {},
        animation_config: { type: "none", duration: 0.8, delay: 0, ease: "power2.out", trigger: "scroll" },
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLibraryBlock(
  id: string,
  updates: {
    name?: string;
    content?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    animation_config?: Record<string, unknown>;
  }
) {
  const { error } = await supabase
    .from("library_blocks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteLibraryBlock(id: string) {
  const { error } = await supabase.from("library_blocks").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Forms
// ============================================

export async function getForms() {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getFormById(id: string) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createForm(name: string, fields: any[] = []) {
  const { data, error } = await supabase
    .from("forms")
    .insert([{ name, fields }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateForm(id: string, updates: { name?: string; fields?: any[] }) {
  const { error } = await supabase.from("forms").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteForm(id: string) {
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// Form Submissions
// ============================================

export async function getFormSubmissions(formId: string) {
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function submitForm(formId: string, formData: Record<string, any>) {
  const { error } = await supabase
    .from("form_submissions")
    .insert([{ form_id: formId, data: formData }]);
  if (error) throw error;
}

// ============================================
// Media library (folders + assets)
// ============================================

export type MediaFolderRow = {
  id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
};

export type MediaAssetRow = {
  id: string;
  folder_id: string;
  name: string;
  storage_path: string;
  public_url: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: "image" | "video" | "document";
  created_at: string;
};

export async function getMediaFolders(): Promise<MediaFolderRow[]> {
  const { data, error } = await supabase.from("media_folders").select("*").order("name", { ascending: true });
  if (error) {
    if (process.env.NODE_ENV === "development") console.warn("[cms] getMediaFolders:", error.message);
    return [];
  }
  return data || [];
}

export async function createMediaFolder(name: string, parentId: string | null): Promise<MediaFolderRow> {
  const { data, error } = await supabase
    .from("media_folders")
    .insert([{ name: name.trim(), parent_id: parentId }])
    .select()
    .single();
  if (error) throw error;
  return data as MediaFolderRow;
}

export async function deleteMediaFolder(id: string): Promise<void> {
  const { error } = await supabase.from("media_folders").delete().eq("id", id);
  if (error) throw error;
}

export async function getMediaAssetsForFolder(folderId: string): Promise<MediaAssetRow[]> {
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("folder_id", folderId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getMediaAssetsInFolders(folderIds: string[]): Promise<MediaAssetRow[]> {
  if (folderIds.length === 0) return [];
  const { data, error } = await supabase.from("media_assets").select("*").in("folder_id", folderIds);
  if (error) throw error;
  return data || [];
}

export async function createMediaAsset(row: {
  folder_id: string;
  name: string;
  storage_path: string;
  public_url: string;
  mime_type: string | null;
  size_bytes: number | null;
  kind: "image" | "video" | "document";
}): Promise<MediaAssetRow> {
  const { data, error } = await supabase.from("media_assets").insert([row]).select().single();
  if (error) throw error;
  return data as MediaAssetRow;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const { error } = await supabase.from("media_assets").delete().eq("id", id);
  if (error) throw error;
}
