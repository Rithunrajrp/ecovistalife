"use client";
import { useEffect, useState } from "react";
import { getForms, createForm, deleteForm } from "@/lib/cms";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import Link from "next/link";

export default function AdminForms() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const data = await getForms();
      setForms(data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createForm(newName, []);
      toast({ title: "Form created", type: "success" });
      setIsModalOpen(false);
      setNewName("");
      fetchForms();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this form and all its submissions?")) return;
    try {
      await deleteForm(id);
      toast({ title: "Form deleted", type: "success" });
      fetchForms();
    } catch {
      toast({ title: "Error deleting form", type: "error" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Form Builder</h1>
          <p className="text-gray-400 mt-1 text-sm">Create custom forms and embed them on any page.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] transition-all">
          <Plus size={18} /> New Form
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center"><Loader2 className="animate-spin text-gray-500 mx-auto" size={32} /></div>
        ) : forms.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-[#0B0F14]">No forms yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F14] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Form Name</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Form ID</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {forms.map((form) => (
                  <tr key={form.id} className="hover:bg-[#1a2333]/40 transition-colors group">
                    <td className="p-6 font-bold text-white">{form.name}</td>
                    <td className="p-6">
                      <code className="text-gray-400 bg-[#0B0F14] px-2 py-1 rounded-lg text-xs font-mono border border-gray-800">{form.id}</code>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/forms/${form.id}/submissions`} className="px-3 py-2 text-xs font-semibold text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-emerald-400 hover:border-emerald-500/30 transition-all">Submissions</Link>
                        <Link href={`/admin/forms/${form.id}`} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-white hover:border-gray-600 transition-all shadow-sm"><Edit2 size={16} /></Link>
                        <button onClick={() => handleDelete(form.id)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"><Trash2 size={16} /></button>
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
            <h2 className="text-2xl font-bold text-white mb-8">Create New Form</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Form Name</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all" placeholder="e.g. Contact Us" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/60">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white font-semibold transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] transition-all">{creating ? "Creating..." : "Create Form"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
