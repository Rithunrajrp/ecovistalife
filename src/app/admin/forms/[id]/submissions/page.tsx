"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFormById, getFormSubmissions } from "@/lib/cms";
import { Loader2, Calendar } from "lucide-react";

export default function FormSubmissions() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [formData, subsData] = await Promise.all([
        getFormById(formId),
        getFormSubmissions(formId),
      ]);
      setForm(formData);
      setSubmissions(subsData || []);
      setLoading(false);
    };
    fetchData();
  }, [formId]);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#D4AF37]" size={40} /></div>;
  }

  const fields: any[] = form?.fields || [];
  const fieldNames = fields.map((f: any) => f.label || f.name);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <h1 className="text-3xl font-heading font-bold text-white">Submissions: {form?.name}</h1>
        <p className="text-gray-400 mt-1 text-sm">{submissions.length} total submissions received.</p>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
        {submissions.length === 0 ? (
          <div className="p-16 text-center text-gray-500 bg-[#0B0F14]">No submissions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0B0F14] text-gray-400 border-b border-gray-800">
                <tr>
                  {fieldNames.map((name: string) => (
                    <th key={name} className="p-5 font-semibold uppercase tracking-wider text-xs">{name}</th>
                  ))}
                  <th className="p-5 font-semibold uppercase tracking-wider text-xs">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#1a2333]/40 transition-colors">
                    {fields.map((field: any) => (
                      <td key={field.name} className="p-5 text-gray-300 max-w-[200px] truncate">{sub.data?.[field.name] || "—"}</td>
                    ))}
                    <td className="p-5 text-gray-500 text-xs flex items-center gap-1.5">
                      <Calendar size={12} /> {new Date(sub.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
