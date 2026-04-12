"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Settings, Palette } from "lucide-react";
import { getSiteFooter, upsertSiteFooter } from "@/lib/cms";
import { getSettings } from "@/lib/settings";
import { toast } from "@/components/ui/Toaster";
import { FooterEditor, StylePanel, DEFAULT_ANIMATION, DEFAULT_SETTINGS } from "@/components/admin/VisualBuilder";
import { AdminBlockRenderer } from "@/components/blocks/AdminBlockRenderer";

type PanelTab = "content" | "style";

const FOOTER_PREVIEW_ID = "site-footer-preview";

export default function SiteFooterEditorPage() {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("content");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [site, s] = await Promise.all([getSiteFooter(), getSettings()]);
      const base = (site?.content || {}) as Record<string, unknown>;
      const merged = {
        brandName: base.brandName ?? s.company_name ?? "EcoVistaLife",
        tagline:
          base.tagline ??
          s.footer_tagline ??
          "Premium, sustainable, and luxurious real estate properties designed for the modern lifestyle.",
        address: base.address ?? s.address ?? "",
        phone: base.phone ?? s.phone_number ?? "",
        email: base.email ?? s.contact_email ?? "",
        socialLinks: base.socialLinks ?? {
          facebook: s.social_facebook || "#",
          instagram: s.social_instagram || "#",
          linkedin: s.social_linkedin || "#",
          twitter: s.social_twitter || "#",
        },
        columns: base.columns,
      };
      setContent(merged);
      setSettings(
        site?.settings && Object.keys(site.settings).length > 0
          ? site.settings
          : { bgColor: "#0F3D3E", textColor: "#ffffff" }
      );
    } catch (e) {
      toast({
        title: "Failed to load footer",
        description: e instanceof Error ? e.message : undefined,
        type: "error",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const previewBlock = {
    id: FOOTER_PREVIEW_ID,
    type: "footer",
    content,
    settings: settings || DEFAULT_SETTINGS,
    animation_config: DEFAULT_ANIMATION,
  };

  const updateContent = (_id: string, key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const updateSettings = (_id: string, key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertSiteFooter({ content, settings });
      toast({ title: "Footer saved", type: "success" });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : undefined,
        type: "error",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F14]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] overflow-hidden">
      <header className="flex items-center justify-between bg-[#111827] px-5 h-12 border-b border-[#1f2937] shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blocks"
            className="p-1.5 text-gray-500 hover:text-white rounded-md hover:bg-[#1f2937] transition-all"
          >
            <ArrowLeft size={17} />
          </Link>
          <div className="w-px h-5 bg-[#1f2937]" />
          <span className="text-sm font-bold text-white">Site footer</span>
          <span className="text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">site_footer</span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-4 py-1.5 rounded-lg font-bold text-xs transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[#0a0e16] flex flex-col">
          <div className="sticky top-0 z-20 bg-[#f5f5f7] px-4 py-2 border-b border-gray-300 text-[11px] text-gray-500 shrink-0">
            Preview — quick links on the live site are built from published CMS pages.
          </div>
          <div className="bg-white min-h-full flex-1">
            <AdminBlockRenderer blocks={[previewBlock]} />
          </div>
        </main>

        <aside className="w-80 shrink-0 flex flex-col bg-[#0c121e] border-l border-[#1f2937] overflow-y-auto">
          <div className="flex border-b border-[#1f2937] shrink-0">
            <button
              type="button"
              onClick={() => setPanelTab("content")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all border-b-2 ${
                panelTab === "content"
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <Settings size={11} /> Content
            </button>
            <button
              type="button"
              onClick={() => setPanelTab("style")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all border-b-2 ${
                panelTab === "style"
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <Palette size={11} /> Style
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {panelTab === "content" && (
              <FooterEditor block={previewBlock} onChange={updateContent} />
            )}
            {panelTab === "style" && <StylePanel block={previewBlock} onChange={updateSettings} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
