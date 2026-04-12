import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, User, Home } from "lucide-react";
import { SEO_DEFAULT_DESCRIPTION, SEO_KEYWORDS, SITE_NAME, getSiteUrl } from "@/lib/seo";

export const revalidate = 60; // Revalidate every 60 seconds

function excerpt(text: string | null | undefined, max = 155): string {
  if (!text?.trim()) return SEO_DEFAULT_DESCRIPTION;
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: blog } = await supabase
    .from("blogs")
    .select("title, content, image")
    .eq("id", id)
    .single();

  if (!blog?.title) {
    return { title: `Blog | ${SITE_NAME}`, robots: { index: false, follow: false } };
  }

  const description = excerpt(blog.content);
  const url = `${getSiteUrl()}/blogs/${id}`;
  const images = blog.image ? [{ url: blog.image }] : undefined;

  return {
    title: blog.title,
    description,
    keywords: [...SEO_KEYWORDS, "EcoVistaLife blog", "sustainable construction news", "green building India"],
    alternates: { canonical: `/blogs/${id}` },
    openGraph: {
      type: "article",
      url,
      title: blog.title,
      description,
      siteName: SITE_NAME,
      locale: "en_IN",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.image ? [blog.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: blog, error } = await supabase.from("blogs").select("*").eq("id", id).single();

  if (error || !blog) {
    notFound();
  }

  // Simulated data to match the card requirements
  const category = "Modern Houses";
  const author = "Ecovistalife";

  return (
    <article className="min-h-screen bg-gray-50 pb-24 pt-32">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <Link 
          href="/blogs" 
          className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#D4AF37] mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to all articles
        </Link>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
          {/* Post Image */}
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={blog.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200"}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="p-8 md:p-14">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-6 text-[14px] text-gray-500 font-medium mb-8 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={16} className="text-gray-500" />
                </div>
                <span>{author}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock size={16} className="text-gray-500" />
                </div>
                <span>{new Date(blog.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Home size={16} className="text-gray-500" />
                </div>
                <span>{category}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-[#111827] mb-10 leading-tight">
              {blog.title}
            </h1>

            {/* Content */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans prose-headings:font-heading prose-headings:text-[#0F3D3E] prose-a:text-[#D4AF37] prose-img:rounded-xl">
              {/* In a real app with rich text, you might use dangerouslySetInnerHTML safely */}
              <div className="whitespace-pre-wrap">{blog.content}</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
