"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Settings, Palette, Zap, MousePointer } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { AdminBlockRenderer } from "@/components/blocks/AdminBlockRenderer";
import { CompositionBlock } from "@/components/blocks/CompositionBlock";
import { CompositionEditor } from "@/components/admin/CompositionEditor";
import {
  ContentPanel,
  StylePanel,
  AnimationPanel,
  DEFAULT_SETTINGS,
  DEFAULT_ANIMATION,
} from "@/components/admin/VisualBuilder";
import { getLibraryBlockById, updateLibraryBlock } from "@/lib/cms";
import { defaultCompositionContent } from "@/lib/composition";

type PanelTab = "content" | "style" | "animation";

export function LibraryBlockEditor({ id }: { id: string }) {
  const [block, setBlock] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("content");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const row = await getLibraryBlockById(id);
      if (!row) {
        setBlock(null);
        toast({ title: "Block not found", type: "error" });
      } else {
        setBlock(row);
        setName(row.name || "");
        setPanelTab(row.type === "composition" ? "style" : "content");
      }
    } catch (e) {
      toast({
        title: "Failed to load block",
        description: e instanceof Error ? e.message : undefined,
        type: "error",
      });
      setBlock(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateContent = (blockId: string, key: string, value: unknown) => {
    setBlock((prev: any) =>
      prev ? { ...prev, content: { ...(prev.content || {}), [key]: value } } : prev
    );
  };

  const updateSettings = (blockId: string, key: string, value: unknown) => {
    setBlock((prev: any) =>
      prev ? { ...prev, settings: { ...(prev.settings || {}), [key]: value } } : prev
    );
  };

  const updateAnimation = (blockId: string, key: string, value: unknown) => {
    setBlock((prev: any) =>
      prev
        ? {
            ...prev,
            animation_config: { ...(prev.animation_config || DEFAULT_ANIMATION), [key]: value },
          }
        : prev
    );
  };

  const handleSave = async () => {
    if (!block) return;
    setSaving(true);
    try {
      await updateLibraryBlock(block.id, {
        name: name.trim() || "Untitled block",
        content: block.content,
        settings: block.settings || DEFAULT_SETTINGS,
        animation_config: block.animation_config || DEFAULT_ANIMATION,
      });
      toast({ title: "Block saved", type: "success" });
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

  if (!block) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p className="mb-4">This block could not be loaded.</p>
        <Link href="/admin/blocks" className="text-[#D4AF37] hover:underline">
          Back to Blocks
        </Link>
      </div>
    );
  }

  const b = {
    ...block,
    settings: block.settings || DEFAULT_SETTINGS,
    animation_config: block.animation_config || DEFAULT_ANIMATION,
  };

  const isComposition = block.type === "composition";
  const compositionItems = Array.isArray(b.content?.items) ? b.content.items : defaultCompositionContent().items;

  const sidebarTabs = isComposition
    ? ([
        { id: "style" as PanelTab, label: "Style", icon: Palette },
        { id: "animation" as PanelTab, label: "Animate", icon: Zap },
      ] as const)
    : ([
        { id: "content" as PanelTab, label: "Content", icon: Settings },
        { id: "style" as PanelTab, label: "Style", icon: Palette },
        { id: "animation" as PanelTab, label: "Animate", icon: Zap },
      ] as const);

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] overflow-hidden">
      <header className="flex items-center justify-between bg-[#111827] px-5 h-12 border-b border-[#1f2937] shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/blocks"
            className="p-1.5 text-gray-500 hover:text-white rounded-md hover:bg-[#1f2937] transition-all shrink-0"
          >
            <ArrowLeft size={17} />
          </Link>
          <div className="w-px h-5 bg-[#1f2937] shrink-0" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm font-bold text-white bg-transparent border border-transparent hover:border-[#1f2937] focus:border-[#D4AF37]/50 rounded px-2 py-0.5 max-w-[min(100%,280px)]"
            placeholder="Block name"
          />
          <span className="text-[11px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded shrink-0">
            {block.type}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-4 py-1.5 rounded-lg font-bold text-xs transition-all disabled:opacity-60 shrink-0"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[#0a0e16] flex flex-col min-w-0">
          <div className="sticky top-0 z-20 bg-[#f5f5f7] px-4 py-2 border-b border-gray-300 flex items-center justify-between shadow-sm shrink-0">
            <span className="text-[11px] font-mono text-gray-500">
              {isComposition ? "Composer — build your block below" : "Library block preview"}
            </span>
            {!isComposition && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <MousePointer size={11} /> Add this block to pages from the Pages screen
              </span>
            )}
          </div>

          {isComposition ? (
            <div className="p-4 md:p-6 space-y-6 flex-1">
              <CompositionEditor
                items={compositionItems}
                onChange={(next) => updateContent(b.id, "items", next)}
                className="min-h-0"
              />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Live preview</p>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <CompositionBlock content={b.content} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white min-h-full flex-1">
              <AdminBlockRenderer blocks={[b]} />
            </div>
          )}
        </main>

        <aside className="w-80 shrink-0 flex flex-col bg-[#0c121e] border-l border-[#1f2937] overflow-y-auto">
          <div className="flex border-b border-[#1f2937] shrink-0">
            {sidebarTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPanelTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold transition-all border-b-2 ${
                    panelTab === tab.id
                      ? "border-[#D4AF37] text-[#D4AF37]"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Icon size={11} /> {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!isComposition && panelTab === "content" && <ContentPanel block={b} onChange={updateContent} />}
            {isComposition && panelTab === "style" && (
              <p className="text-[11px] text-gray-500">
                Padding and colors for the whole composed block (applied on the live site when this library block is placed on a page).
              </p>
            )}
            {panelTab === "style" && <StylePanel block={b} onChange={updateSettings} />}
            {panelTab === "animation" && <AnimationPanel block={b} onChange={updateAnimation} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
