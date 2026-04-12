"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Blocks, Loader2, Plus, Edit2, Trash2, PanelBottom } from "lucide-react";
import { getLibraryBlocks, deleteLibraryBlock } from "@/lib/cms";
import { toast } from "@/components/ui/Toaster";

export default function AdminBlocksIndex() {
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const libs = await getLibraryBlocks();
      setLibraryItems(libs || []);
    } catch (e) {
      toast({
        title: "Could not load library blocks",
        description: e instanceof Error ? e.message : undefined,
        type: "error",
      });
      setLibraryItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete library block "${name}"?`)) return;
    try {
      await deleteLibraryBlock(id);
      toast({ title: "Deleted", type: "success" });
      load();
    } catch {
      toast({ title: "Delete failed", type: "error" });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
          <Blocks className="text-[#D4AF37]" size={32} />
          Blocks
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Edit the site footer and manage reusable blocks stored in <code className="text-amber-400/90 text-xs">library_blocks</code>.
        </p>
      </div>

      <Link
        href="/admin/blocks/footer"
        className="flex items-center gap-4 p-6 rounded-2xl border border-[#1f2937] bg-[#111827] hover:border-[#D4AF37]/40 hover:bg-[#1a2333]/60 transition-all group"
      >
        <div className="w-14 h-14 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
          <PanelBottom className="text-[#D4AF37]" size={28} />
        </div>
        <div className="text-left min-w-0">
          <h2 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">Site footer</h2>
          <p className="text-sm text-gray-500 mt-1">
            Stored in the database and rendered below all public pages. Quick links follow your published CMS pages automatically.
          </p>
        </div>
        <span className="ml-auto text-[#D4AF37] text-sm font-semibold shrink-0">Edit →</span>
      </Link>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-white">Library blocks</h2>
        <Link
          href="/admin/blocks/library/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0B0F14] font-bold text-sm hover:bg-[#E5C354] transition-colors"
        >
          <Plus size={18} />
          New block
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24 border border-gray-800 rounded-2xl bg-[#111827]">
          <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
        </div>
      ) : libraryItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-700 rounded-2xl text-gray-500">
          <p>No library blocks yet.</p>
          <p className="text-sm mt-2">
            Run migration <code className="text-amber-400/90 text-xs">002_site_footer_library_blocks.sql</code> in Supabase if the table is missing, then create blocks here.
          </p>
          <Link
            href="/admin/blocks/library/new"
            className="inline-block mt-4 text-[#D4AF37] font-semibold hover:underline"
          >
            Create your first block →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-[#111827]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {libraryItems.map((row) => (
                <tr key={row.id} className="hover:bg-[#1a2333]/40 transition-colors">
                  <td className="p-4 font-medium text-white">{row.name}</td>
                  <td className="p-4">
                    <code className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">{row.type}</code>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/blocks/library/${row.id}`}
                        className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-white hover:border-gray-600 transition-all"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id, row.name)}
                        className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
