import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export interface ProjectType {
  id: string;
  title: string;
  type: "ongoing" | "upcoming" | "completed";
  location: string;
  price: string;
  image: string;
}

export function ProjectCard({ project }: { project: ProjectType }) {
  const typeColors = {
    ongoing: "bg-blue-100 text-blue-800",
    upcoming: "bg-amber-100 text-amber-800",
    completed: "bg-emerald-100 text-emerald-800",
  };

  return (
    <Card className="group cursor-pointer">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={project.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shadow-sm backdrop-blur-md bg-white/90 ${typeColors[project.type]}`}>
            {project.type}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-heading font-bold text-[#0F3D3E] mb-2 group-hover:text-[#D4AF37] transition-colors">{project.title}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin size={16} className="mr-1 shrink-0 text-[#D4AF37]" />
          <span className="truncate">{project.location}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="font-semibold text-[#0F3D3E]">{project.price}</span>
          <Link href={`/projects/${project.id}`} className="text-sm font-medium text-[#D4AF37] hover:text-[#0F3D3E] transition-colors">
            View Details &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
