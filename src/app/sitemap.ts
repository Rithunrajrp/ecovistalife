import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];

  const push = (
    url: string,
    lastModified: Date,
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
    priority: number,
  ) => {
    if (seen.has(url)) return;
    seen.add(url);
    out.push({ url, lastModified, changeFrequency, priority });
  };

  push(base, new Date(), "weekly", 1);

  const { data: pages } = await supabase.from("pages").select("slug, created_at, is_published");
  for (const row of pages || []) {
    if (!row.is_published) continue;
    const path = row.slug === "home" ? "/" : `/${row.slug}`;
    const url = path === "/" ? base : `${base}${path}`;
    push(url, new Date(row.created_at || Date.now()), "monthly", row.slug === "home" ? 1 : 0.75);
  }

  const { data: blogs } = await supabase.from("blogs").select("id, created_at");
  for (const row of blogs || []) {
    push(`${base}/blogs/${row.id}`, new Date(row.created_at || Date.now()), "weekly", 0.65);
  }

  return out;
}
