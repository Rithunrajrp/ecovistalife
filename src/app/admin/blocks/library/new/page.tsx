"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createLibraryBlock, LIBRARY_BLOCK_TYPES, type LibraryBlockType } from "@/lib/cms";
import { toast } from "@/components/ui/Toaster";

const TYPE_LABELS: Record<string, string> = {
  composition: "Composer (drag & drop)",
  hero: "Hero",
  text: "Text",
  image: "Image",
  image_text: "Image + Text",
  gallery: "Gallery",
  cta: "Call to action",
  faq: "FAQ",
  form: "Form",
  projects_grid: "Projects grid",
  blogs_grid: "Blogs grid",
  contact_info: "Contact info",
  slideshow: "Slideshow",
};

export default function NewLibraryBlockPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<LibraryBlockType>("text");
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Enter a name", type: "error" });
      return;
    }
    setCreating(true);
    try {
      const row = await createLibraryBlock(name.trim(), type);
      toast({ title: "Block created", type: "success" });
      router.push(`/admin/blocks/library/${row.id}`);
    } catch (err: unknown) {
      toast({
        title: "Could not create block",
        description: err instanceof Error ? err.message : undefined,
        type: "error",
      });
    }
    setCreating(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/blocks"
          className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[#1f2937] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-white">New library block</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#111827] border border-gray-800 rounded-2xl p-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0B0F14] border border-[#1f2937] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37] text-sm"
            placeholder="e.g. Homepage hero variant"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Block type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LibraryBlockType)}
            className="w-full bg-[#0B0F14] border border-[#1f2937] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37] text-sm appearance-none"
          >
            {LIBRARY_BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t] || t}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="w-full py-3 rounded-xl bg-[#D4AF37] text-[#0B0F14] font-bold text-sm hover:bg-[#E5C354] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {creating ? <Loader2 className="animate-spin" size={18} /> : null}
          Create and edit
        </button>
      </form>
    </div>
  );
}
