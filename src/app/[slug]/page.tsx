import { getPageBySlug, getBlocksForPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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
