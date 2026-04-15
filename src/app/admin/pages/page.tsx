"use client";
import { useEffect, useState } from "react";
import { getPages, createPage, deletePage } from "@/lib/cms";
import { Plus, Edit2, Trash2, Globe, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import Link from "next/link";

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const data = await getPages();
      setPages(data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createPage(newTitle, newSlug);
      toast({ title: "Page created", type: "success" });
      setIsModalOpen(false);
      setNewTitle("");
      setNewSlug("");
      fetchPages();
    } catch (err: any) {
      toast({ title: "Error creating page", description: err.message, type: "error" });
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page and all its blocks?")) return;
    try {
      await deletePage(id);
      toast({ title: "Page deleted", type: "success" });
      fetchPages();
    } catch {
      toast({ title: "Error deleting page", type: "error" });
    }
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">CMS Pages</h1>
          <p className="text-gray-400 mt-1 text-sm">Build and manage dynamic pages with the block editor.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all"
        >
          <Plus size={18} /> Create Page
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin" size={32} /></div>
        ) : pages.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-[#0B0F14]">No pages yet. Create your first page!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F14] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Page Title</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Slug</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Created</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-[#1a2333]/40 transition-colors group">
                    <td className="p-6 font-bold text-white">{page.title}</td>
                    <td className="p-6">
                      <code className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded-lg text-xs font-mono">/{page.slug}</code>
                    </td>
                    <td className="p-6 text-gray-400 text-xs">
                      {new Date(page.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/pages/${page.id}`} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-white hover:border-gray-600 transition-all shadow-sm" title="Edit blocks"><Edit2 size={16} /></Link>
                        <button onClick={() => handleDelete(page.id)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F14]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-gray-800 rounded-[2rem] p-8 md:p-10 max-w-lg w-full shadow-[0_10px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-8">Create New Page</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Page Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={e => { setNewTitle(e.target.value); setNewSlug(autoSlug(e.target.value)); }}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                  placeholder="e.g. Our Services"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">URL Slug</label>
                <div className="flex items-center bg-[#0B0F14] border border-gray-800 rounded-2xl overflow-hidden shadow-inner">
                  <span className="text-gray-600 pl-5 text-sm">/</span>
                  <input
                    required
                    value={newSlug}
                    onChange={e => setNewSlug(e.target.value)}
                    className="flex-1 bg-transparent text-white px-2 py-3.5 focus:outline-none"
                    placeholder="our-services"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/60">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] transition-all">
                  {creating ? "Creating..." : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
