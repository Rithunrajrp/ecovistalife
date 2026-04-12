import { BlogCard } from "@/components/BlogCard";
import { supabase } from "@/lib/supabase";

export async function BlogsGridBlock({ content }: { content: any }) {
  const heading = content.heading || "Insights & News";

  const { data: blogs } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
  const blogsList = (blogs || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    excerpt: b.content?.substring(0, 150) + (b.content?.length > 150 ? "..." : ""),
    image: b.image || "",
    date: b.created_at,
  }));

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {heading && (
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-[#0F3D3E]">{heading}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogsList.map((blog: any) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </section>
  );
}
