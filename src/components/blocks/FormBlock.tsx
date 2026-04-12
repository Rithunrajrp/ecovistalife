"use client";
import { useEffect, useState } from "react";
import { getFormById, submitForm } from "@/lib/cms";
import { toast } from "@/components/ui/Toaster";

export function FormBlock({ content, embedded }: { content: any; embedded?: boolean }) {
  const formId = content.formId;
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (formId) {
      getFormById(formId).then(setForm);
    }
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) return;
    setSubmitting(true);
    try {
      await submitForm(formId, formData);
      toast({ title: "Form submitted successfully!", type: "success" });
      setFormData({});
    } catch {
      toast({ title: "Submission failed", type: "error" });
    }
    setSubmitting(false);
  };

  if (!form) {
    return (
      <div className={embedded ? "py-6 text-center text-gray-400 text-sm" : "py-16 bg-gray-50"}>
        {!embedded && <div className="container mx-auto px-4 text-center text-gray-400">Loading form...</div>}
        {embedded && "Loading form…"}
      </div>
    );
  }

  const fields: any[] = form.fields || [];

  if (embedded) {
    return (
      <div className="space-y-4">
        {content.heading ? (
          <h3 className="text-2xl font-heading font-bold text-[#0F3D3E]">{content.heading}</h3>
        ) : null}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow border border-gray-100 space-y-5">
          {fields.map((field: any) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  rows={4}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent transition-all"
                />
              ) : (
                <input
                  type={field.type === "phone" ? "tel" : field.type}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent transition-all"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#D4AF37] text-[#0F3D3E] font-bold rounded-xl hover:bg-[#E5C354] transition-all disabled:opacity-60"
          >
            {submitting ? "Submitting..." : content.buttonText || "Submit"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        {content.heading && (
          <h3 className="text-3xl font-heading font-bold text-[#0F3D3E] mb-10 text-center">{content.heading}</h3>
        )}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 space-y-6">
          {fields.map((field: any) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  rows={4}
                  value={formData[field.name] || ""}
                  onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent transition-all"
                />
              ) : (
                <input
                  type={field.type === "phone" ? "tel" : field.type}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent transition-all"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#D4AF37] text-[#0F3D3E] font-bold rounded-xl hover:bg-[#E5C354] transition-all shadow-lg disabled:opacity-60"
          >
            {submitting ? "Submitting..." : (content.buttonText || "Submit")}
          </button>
        </form>
      </div>
    </section>
  );
}
