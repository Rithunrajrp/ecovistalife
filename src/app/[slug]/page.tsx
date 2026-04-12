import type { Metadata } from "next";
import { getPageBySlug, getBlocksForPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { notFound } from "next/navigation";
import { SEO_DEFAULT_DESCRIPTION, SEO_KEYWORDS, SITE_NAME, getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }

  const description = `${page.title} — ${SITE_NAME}: sustainable luxury real estate, green building & premium construction in Mumbai and across India. ${SEO_DEFAULT_DESCRIPTION.slice(0, 90)}…`;
  const path = `/${slug}`;
  const url = `${getSiteUrl()}${path}`;
  const baseMeta: Metadata = {
    title: page.title,
    description: description.slice(0, 320),
    keywords: [...SEO_KEYWORDS],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url,
      title: page.title,
      description: description.slice(0, 200),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: description.slice(0, 200),
    },
  };

  if (!page.is_published) {
    return { ...baseMeta, robots: { index: false, follow: false } };
  }

  return baseMeta;
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await getPageBySlug(slug);
  if (!page) return notFound();

  const blocks = await getBlocksForPage(page.id);

  return (
    <div>
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
