import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, User, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export interface BlogType {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
}

export function BlogCard({ blog }: { blog: BlogType }) {
  // Using a simulated category and author since they aren't explicitly in the schema yet
  const category = "Modern Houses";
  const author = "Ecovistalife";

  return (
    <Card className="group flex flex-col h-full overflow-hidden border-none shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 rounded-2xl cursor-pointer">
      <Link href={`/blogs/${blog.id}`} className="contents">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={blog.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <CardContent className="p-6 md:p-8 flex flex-col flex-grow bg-white">
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 font-medium mb-4">
            <div className="flex items-center gap-1.5">
              <User size={15} className="text-gray-400" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-gray-400" />
              <span>{new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Home size={15} className="text-gray-400" />
              <span>{category}</span>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-[#111827] mb-4 line-clamp-3 leading-snug group-hover:text-[#D4AF37] transition-colors">
            {blog.title}
          </h3>
          
          <p className="text-[15px] text-gray-600 mb-8 line-clamp-2 flex-grow leading-relaxed">
            {blog.excerpt}
          </p>

          <div className="mt-auto">
            <div className="inline-flex items-center px-6 py-2.5 rounded-full border border-gray-300 text-[13px] font-bold text-[#111827] tracking-wide hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 uppercase">
              Read More <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
