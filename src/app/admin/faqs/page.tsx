"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Edit2, Trash2, Plus, MessageCircle } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    question: "",
    answer: "",
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    const { data } = await supabase.from("faqs").select("*");
    if (data) setFaqs(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.id) {
      const { error } = await supabase.from("faqs").update({ question: formData.question, answer: formData.answer }).match({ id: formData.id });
      if (error) toast({ title: "Error updating FAQ", description: error.message, type: "error" });
      else toast({ title: "FAQ updated", type: "success" });
    } else {
      const { error } = await supabase.from("faqs").insert([{ question: formData.question, answer: formData.answer }]);
      if (error) toast({ title: "Error creating FAQ", description: error.message, type: "error" });
      else toast({ title: "FAQ created", type: "success" });
    }
    
    setIsModalOpen(false);
    fetchFaqs();
  };

  const handleEdit = (faq: any) => {
    setFormData({ id: faq.id, question: faq.question, answer: faq.answer });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this FAQ?")) return;
    const { error } = await supabase.from("faqs").delete().match({ id });
    if (error) toast({ title: "Error deleting FAQ", type: "error" });
    else {
      toast({ title: "FAQ deleted", type: "success" });
      fetchFaqs();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage the public knowledgebase.</p>
        </div>
        <button 
          onClick={() => { setFormData({ id: "", question: "", answer: "" }); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all"
        >
          <Plus size={18} /> Add FAQ
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500">Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-[#0B0F14]">
            No FAQs found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F14] text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs">Question & Answer</th>
                  <th className="p-6 font-semibold uppercase tracking-wider text-xs text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-[#1a2333]/40 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-start gap-4">
                        <MessageCircle className="text-[#D4AF37] shrink-0 mt-1" size={20} />
                        <div>
                          <div className="font-bold text-white text-base mb-1">{faq.question}</div>
                          <div className="text-gray-400 text-sm whitespace-pre-wrap">{faq.answer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right align-top">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(faq)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-white hover:border-gray-600 transition-all shadow-sm"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(faq.id)} className="p-2.5 text-gray-400 bg-[#0B0F14] border border-gray-800 rounded-xl hover:text-red-400 hover:border-red-500/30 transition-all shadow-sm"><Trash2 size={16} /></button>
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
          <div className="bg-[#111827] border border-gray-800 rounded-[2rem] p-8 md:p-10 max-w-2xl w-full shadow-[0_10px_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-8">{formData.id ? "Edit FAQ" : "Add New FAQ"}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Question</label>
                <input 
                  required value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Answer</label>
                <textarea 
                  required rows={4} value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-gray-300 px-5 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-sm leading-relaxed whitespace-pre-wrap"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-800/60 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white font-semibold transition-all">Cancel</button>
                <button type="submit" className="bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
