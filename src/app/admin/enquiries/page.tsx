"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Phone, Calendar, Trash2, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    const { data } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
    if (data) setEnquiries(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this lead?")) return;
    const { error } = await supabase.from("enquiries").delete().match({ id });
    if (error) {
      toast({ title: "Error deleting enquiry", description: error.message, type: "error" });
    } else {
      toast({ title: "Lead deleted successfully", type: "success" });
      fetchEnquiries();
    }
  };

  const handleMarkContacted = async (id: string) => {
    const { error } = await supabase.from("enquiries").update({ status: 'contacted' }).match({ id });
    if (error) {
      toast({ title: "Error updating status", description: error.message, type: "error" });
    } else {
      toast({ title: "Marked as contacted", type: "success" });
      fetchEnquiries();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Enquiries & Leads</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage contacts from your landing pages.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-16 text-center text-gray-500 shadow-xl">Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-16 text-center text-gray-500 shadow-xl">No enquiries received yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {enquiries.map((enq) => (
            <div key={enq.id} className="bg-[#111827] border border-gray-800 shadow-xl hover:shadow-2xl hover:border-gray-700 transition-all flex flex-col rounded-3xl overflow-hidden group">
              <div className="bg-[#0B0F14] px-8 py-6 border-b border-gray-800 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-white flex items-center gap-3 mb-2">
                    {enq.name}
                  </h3>
                  {enq.status === 'contacted' ? (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                      <CheckCircle size={12} /> Contacted
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 uppercase tracking-widest inline-block">
                      New Lead
                    </span>
                  )}
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-xs font-medium text-gray-400 flex items-center justify-end gap-1.5 bg-[#111827] px-3 py-2 rounded-xl border border-gray-800 shadow-inner">
                    <Calendar size={14} className="text-gray-500" />
                    {new Date(enq.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <a href={`mailto:${enq.email}`} className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 flex items-center gap-3 bg-[#0B0F14] p-4 rounded-2xl border border-gray-800 transition-colors shadow-inner">
                    <Mail size={18} className="text-gray-500" /> <span className="truncate">{enq.email}</span>
                  </a>
                  <a href={`tel:${enq.phone}`} className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 flex items-center gap-3 bg-[#0B0F14] p-4 rounded-2xl border border-gray-800 transition-colors shadow-inner">
                    <Phone size={18} className="text-gray-500" /> <span className="truncate">{enq.phone}</span>
                  </a>
                </div>
                
                <div className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message</div>
                <div className="bg-[#0B0F14] p-6 rounded-2xl text-sm text-gray-300 border border-gray-800 flex-grow whitespace-pre-wrap leading-relaxed shadow-inner font-mono text-opacity-90">
                  {enq.message}
                </div>
                
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-800/50">
                  {enq.status !== 'contacted' && (
                    <button onClick={() => handleMarkContacted(enq.id)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 rounded-xl transition-all border border-emerald-400/20 hover:shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                      <CheckCircle size={16} /> Mark as Contacted
                    </button>
                  )}
                  <button onClick={() => handleDelete(enq.id)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-400 bg-[#0B0F14] hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-gray-800 hover:border-red-400/20">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
