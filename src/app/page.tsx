import { getPageBySlug, getBlocksForPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const page = await getPageBySlug("home");
  
  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">CMS Not Initialized</h1>
          <p>Please log in to the Admin Dashboard and create a page with the slug <strong>home</strong>.</p>
        </div>
      </div>
    );
  }

  const blocks = await getBlocksForPage(page.id);

  return (
    <div className="flex flex-col relative w-full">
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
