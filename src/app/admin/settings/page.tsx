"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { toast } from "@/components/ui/Toaster";
import Image from "next/image";
import { Save, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("settings").select("*");
    if (data) {
      const settingsObj = data.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      setSettings(settingsObj);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value || "",
    }));
    
    const { error } = await supabase.from("settings").upsert(updates);
    
    setSaving(false);
    if (error) {
      toast({ title: "Error saving settings", description: error.message, type: "error" });
    } else {
      toast({ title: "Settings saved successfully", type: "success" });
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingLogo(true);
    
    const url = await uploadImage(file);
    if (url) {
      handleChange("site_logo", url);
      toast({ title: "Logo uploaded pending save", type: "success" });
    } else {
      toast({ title: "Logo upload failed", type: "error" });
    }
    setUploadingLogo(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 size={40} className="animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-[#111827] p-8 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Platform Settings</h1>
          <p className="text-gray-400 mt-1 text-sm">Configure global text, branding, and contact integrations.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Brand Identity */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">1</span>
            Brand Identity
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Company Name</label>
              <input 
                value={settings.company_name || ""} onChange={e => handleChange("company_name", e.target.value)}
                className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                placeholder="EcoVista Life"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-3">Site Logo Upload</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {settings.site_logo && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 border border-gray-700 bg-white">
                    <Image src={settings.site_logo} alt="Logo" fill className="object-contain p-2" />
                  </div>
                )}
                <label className="flex-grow w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-700 bg-[#0B0F14]/50 rounded-2xl py-3 px-4 hover:bg-[#0B0F14] hover:border-gray-500 transition-colors cursor-pointer min-h-[64px] group">
                   <span className="text-xs font-medium text-gray-400 text-center group-hover:text-white transition-colors">
                     {uploadingLogo ? "Uploading to secure cloud..." : "Browse logo (PNG/JPG)"}
                   </span>
                   <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Global Contact Info */}
        <div className="bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">2</span>
            Contact Integrations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Contact Email</label>
              <input 
                value={settings.contact_email || ""} onChange={e => handleChange("contact_email", e.target.value)}
                className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Support Phone Number</label>
              <input 
                value={settings.phone_number || ""} onChange={e => handleChange("phone_number", e.target.value)}
                className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">WhatsApp Business Number</label>
              <input 
                value={settings.whatsapp_number || ""} onChange={e => handleChange("whatsapp_number", e.target.value)}
                className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
                placeholder="919876543210 (Numbers only)"
              />
              <p className="text-xs text-gray-500 mt-2 ml-1">Links directly to the floating chat button.</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Corporate Address</label>
              <textarea 
                value={settings.address || ""} onChange={e => handleChange("address", e.target.value)}
                rows={3}
                className="w-full bg-[#0B0F14] border border-gray-800 text-white px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] shadow-inner transition-all"
              />
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Social Media Handles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Instagram URL</label>
                <input placeholder="https://instagram.com/..." value={settings.social_instagram || ""} onChange={e => handleChange("social_instagram", e.target.value)} className="w-full bg-[#0B0F14] border border-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37] shadow-inner text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">LinkedIn URL</label>
                <input placeholder="https://linkedin.com/..." value={settings.social_linkedin || ""} onChange={e => handleChange("social_linkedin", e.target.value)} className="w-full bg-[#0B0F14] border border-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4AF37] shadow-inner text-sm" />
              </div>
            </div>
          </div>
        </div>


        {/* Floating Save Action */}
        <div className="bg-[#1a2333]/90 backdrop-blur-xl border border-gray-700 p-6 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between sticky bottom-6 z-50 gap-4">
          <div>
            <h4 className="font-bold text-white text-lg">Deploy Changes</h4>
            <p className="text-gray-400 text-sm mt-0.5">Settings will instantly propagate to the public site.</p>
          </div>
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full md:w-auto bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-10 py-4 rounded-2xl font-bold shadow-[0_4px_24px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? "Saving..." : "Publish Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
