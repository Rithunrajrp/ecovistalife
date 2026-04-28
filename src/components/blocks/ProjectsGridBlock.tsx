import { ProjectCard } from "@/components/ProjectCard";
import { supabase } from "@/lib/supabase";
import { StaggerGrid } from "../ui/StaggerGrid";
import { SplitTextReveal } from "../ui/SplitTextReveal";

export async function ProjectsGridBlock({ content }: { content: any }) {
  const heading = content.heading || "Our Portfolio";
  const filterType = content.filterType || "all";

  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (filterType !== "all") {
    query = query.eq("type", filterType);
  }

  const { data: allProjects } = await query;
  const projectsList = (allProjects || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    location: p.location,
    price: p.price,
    image: p.image || (p.images && p.images[0]) || "",
  }));

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        {heading && (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="max-w-2xl">
              <SplitTextReveal as="h2" className="text-3xl md:text-5xl font-heading font-bold text-[#0F3D3E]">{heading}</SplitTextReveal>
            </div>
          </div>
        )}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsList.map((project: any) => (
            <div key={project.id}>
              <ProjectCard project={project} />
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
