"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFormById, updateForm } from "@/lib/cms";
import { Plus, Trash2, Loader2, GripVertical, Save } from "lucide-react";
import { toast } from "@/components/ui/Toaster";

const FIELD_TYPES = ["text", "email", "phone", "textarea"];

export default function FormEditor() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<any[]>([]);
  const [formName, setFormName] = useState("");

  useEffect(() => {
    const fetchForm = async () => {
      const data = await getFormById(formId);
      if (data) {
        setForm(data);
        setFormName(data.name);
        setFields(data.fields || []);
      }
      setLoading(false);
    };
    fetchForm();
  }, [formId]);

  const handleAddField = () => {
    setFields([...fields, { name: `field_${Date.now()}`, label: "", type: "text", required: false }]);
  };

  const handleFieldChange = (index: number, key: string, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    // Auto-generate name from label
    if (key === "label") {
      updated[index].name = value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    }
    setFields(updated);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateForm(formId, { name: formName, fields });
      toast({ title: "Form saved!", type: "success" });
    } catch {
      toast({ title: "Error saving form", type: "error" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#D4AF37]" size={40} /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Edit Form</h1>
          <code className="text-gray-400 text-xs font-mono bg-[#0B0F14] px-2 py-1 rounded-lg mt-2 inline-block border border-gray-800">ID: {formId}</code>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-6 py-2.5 rounded-xl font-bold shadow-[0_4px_14px_rgba(212,175,55,0.2)] transition-all text-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saving ? "Saving..." : "Save Form"}
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-xl">
        <div className="mb-8">
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Form Name</label>
          <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all text-lg font-semibold" />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Form Fields</h3>
          {fields.map((field, index) => (
            <div key={index} className="bg-[#0B0F14] border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center group">
              <GripVertical size={18} className="text-gray-700 shrink-0 hidden md:block mt-1" />
              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <input value={field.label} onChange={e => handleFieldChange(index, "label", e.target.value)} placeholder="Field Label" className="bg-[#111827] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]" />
                <select value={field.type} onChange={e => handleFieldChange(index, "type", e.target.value)} className="bg-[#111827] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] appearance-none">
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(index, "required", e.target.checked)} className="rounded border-gray-700 bg-[#111827] text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0" />
                    Required
                  </label>
                  <button onClick={() => handleRemoveField(index)} className="text-gray-600 hover:text-red-400 transition-colors ml-auto p-1"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={handleAddField} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-700 rounded-2xl text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all text-sm font-semibold">
            <Plus size={18} /> Add Field
          </button>
        </div>
      </div>
    </div>
  );
}
