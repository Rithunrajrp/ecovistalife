"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Quote, Star, Calendar, Plus } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

type Testimonial = {
  id: string;
  name?: string | null;
  customer_name?: string | null;
  title?: string | null;
  company?: string | null;
  role?: string | null;
  quote?: string | null;
  message?: string | null;
  testimonial?: string | null;
  feedback?: string | null;
  rating?: number | null;
  created_at?: string | null;
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    title: "",
    company: "",
    quote: "",
    rating: "5",
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Unable to load testimonials",
        description: error.message,
        type: "error",
      });
    } else {
      setTestimonials((data as Testimonial[]) || []);
    }
    setLoading(false);
  };

  const resolveName = (item: Testimonial) => item.name || item.customer_name || "Anonymous Customer";
  const resolveText = (item: Testimonial) =>
    item.quote || item.message || item.testimonial || item.feedback || "No testimonial content.";
  const resolveMeta = (item: Testimonial) => {
    const left = item.role || item.title;
    const right = item.company;
    if (left && right) return `${left} at ${right}`;
    return left || right || "";
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      title: "",
      company: "",
      quote: "",
      rating: "5",
    });
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const ratingNumber = Number(formData.rating);
    const primaryPayload = {
      customer_name: formData.customerName.trim(),
      title: formData.title.trim() || null,
      company: formData.company.trim() || null,
      quote: formData.quote.trim(),
      rating: Number.isFinite(ratingNumber) ? ratingNumber : null,
    };

    const fallbackPayload = {
      name: formData.customerName.trim(),
      role: formData.title.trim() || null,
      company: formData.company.trim() || null,
      message: formData.quote.trim(),
      rating: Number.isFinite(ratingNumber) ? ratingNumber : null,
    };

    let insertError: Error | null = null;
    const primaryResult = await supabase.from("testimonials").insert([primaryPayload]);
    if (primaryResult.error) {
      const fallbackResult = await supabase.from("testimonials").insert([fallbackPayload]);
      if (fallbackResult.error) {
        insertError = fallbackResult.error;
      }
    }

    if (insertError) {
      toast({
        title: "Error adding testimonial",
        description: insertError.message,
        type: "error",
      });
    } else {
      toast({ title: "Testimonial added", type: "success" });
      setIsModalOpen(false);
      resetForm();
      await fetchTestimonials();
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Customer Testimonials</h1>
          <p className="text-gray-400 mt-1 text-sm">View social proof and customer feedback from your website.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all"
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-16 text-center text-gray-500 shadow-xl">
          Loading testimonials...
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-16 text-center text-gray-500 shadow-xl">
          No testimonials found yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testimonials.map((item) => {
            const rating = Number(item.rating || 0);
            return (
              <div
                key={item.id}
                className="bg-[#111827] border border-gray-800 shadow-xl hover:shadow-2xl hover:border-gray-700 transition-all rounded-3xl overflow-hidden"
              >
                <div className="bg-[#0B0F14] px-8 py-6 border-b border-gray-800 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-xl text-white">{resolveName(item)}</h3>
                    {resolveMeta(item) && <p className="text-sm text-gray-400 mt-1">{resolveMeta(item)}</p>}
                  </div>
                  <Quote size={24} className="text-[#D4AF37] shrink-0" />
                </div>

                <div className="p-8 space-y-5">
                  {rating > 0 && (
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      {Array.from({ length: Math.min(5, rating) }).map((_, index) => (
                        <Star key={`${item.id}-star-${index}`} size={16} fill="currentColor" />
                      ))}
                    </div>
                  )}

                  <div className="bg-[#0B0F14] p-6 rounded-2xl text-sm text-gray-300 border border-gray-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {resolveText(item)}
                  </div>

                  {item.created_at && (
                    <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5 bg-[#0B0F14] px-3 py-2 rounded-xl border border-gray-800 w-fit">
                      <Calendar size={14} className="text-gray-500" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0B0F14]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-gray-800 rounded-[2rem] p-8 md:p-10 max-w-2xl w-full shadow-[0_10px_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold text-white mb-8">Add New Testimonial</h2>
            <form onSubmit={handleAddTestimonial} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Customer Name</label>
                <input
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Title / Role</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Company</label>
                  <input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Rating (1-5)</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all appearance-none"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Great</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Testimonial</label>
                <textarea
                  required
                  rows={5}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full bg-[#0B0F14] border border-gray-800 text-gray-300 px-5 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-sm leading-relaxed whitespace-pre-wrap"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-800/60 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white font-semibold transition-all"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
