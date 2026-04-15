import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlocksForProject } from "@/lib/cms";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import type { Metadata } from "next";

export const revalidate = 0; // Ensures fresh data for this dynamic route

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!data) return { title: "Project Not Found" };
  
  return {
    title: `${data.title} | EcoVistaLife Projects`,
    description: data.description?.slice(0, 160) || "Explore our premium real estate project.",
  };
}

export default async function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: project, error } = await supabase.from("projects").select("*").eq("id", id).single();
  
  if (error || !project) {
    return notFound();
  }

  const blocks = await getBlocksForProject(id);

  return (
    <div className="bg-[#FAFAFA] animate-in fade-in duration-500 min-h-screen">
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
