"use client";
import { useEffect, useState } from "react";
import { getBlockTemplates, createBlockTemplate, deleteBlockTemplate } from "@/lib/cms";
import { Plus, Edit2, Trash2, Layers, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import Link from "next/link";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await getBlockTemplates();
      setTemplates(data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createBlockTemplate(newName, newDesc);
      toast({ title: "Template created", type: "success" });
      setIsModalOpen(false);
      setNewName("");
      setNewDesc("");
      fetchTemplates();
    } catch (err: any) {
      toast({ title: "Error creating template", description: err.message, type: "error" });
    }
    setCreating(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"? Any global blocks linking to this will become empty.`)) return;
    try {
      await deleteBlockTemplate(id);
      toast({ title: "Template deleted", type: "success" });
      fetchTemplates();
    } catch {
      toast({ title: "Error deleting template", type: "error" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Global Block Templates</h1>
          <p className="text-gray-400 mt-1 text-sm">Create reusable blocks and sections to use across your website.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all"
        >
          <Plus size={18} /> Create Template
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 flex justify-center"><Loader2 className="animate-spin" size={32} /></div>
        ) : templates.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-[#0B0F14]">No templates yet. Create your first global block!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F14] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Template Name</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Description</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Created</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-[#1a2333]/40 transition-colors group">
                    <td className="p-6 font-bold text-white flex items-center gap-3">
                      <Layers className="text-[#D4AF37]" size={16} />
                      {tpl.name}
                    </td>
                    <td className="p-6 text-gray-400">
                      {tpl.description || <span className="italic text-gray-600">No description</span>}
                    </td>
                    <td className="p-6 text-gray-400 text-xs">
                      {new Date(tpl.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/templates/${tpl.id}`} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-white hover:border-gray-600 transition-all shadow-sm" title="Edit Template"><Edit2 size={16} /></Link>
                        <button onClick={() => handleDelete(tpl.id, tpl.name)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"><Trash2 size={16} /></button>
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
            <h2 className="text-2xl font-bold text-white mb-8">Create Global Template</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Template Name</label>
                <input
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                  placeholder="e.g. Universal Site Footer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Description (Optional)</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all resize-none"
                  placeholder="Where/how is this template used?"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/60">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] transition-all">
                  {creating ? "Creating..." : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
