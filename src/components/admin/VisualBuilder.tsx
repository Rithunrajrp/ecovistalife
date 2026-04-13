"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  getPageById,
  getBlocksForPage,
  getBlockTemplateById,
  getBlocksForTemplate,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  getLibraryBlocks,
} from "@/lib/cms";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, GripVertical,
  Layout, Type, Image as ImageIcon, Columns, Grid3X3,
  Megaphone, HelpCircle, FileText, Layers,
  Settings, Palette, Zap, MousePointer,
  X, LayoutGrid, BookMarked,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toaster";
import { AdminBlockRenderer } from "@/components/blocks/AdminBlockRenderer";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { MediaLibraryPicker } from "@/components/admin/MediaLibraryPicker";
import { CompositionEditor } from "@/components/admin/CompositionEditor";
import { defaultCompositionContent } from "@/lib/composition";
import { ANIMATION_TYPES, EASING_OPTIONS } from "@/lib/animations";

// --- Block Type Registry ---
const BLOCK_TYPES = [
  { type: "composition", label: "Composer", icon: LayoutGrid, color: "text-rose-400", description: "Drag & drop text, images, forms, and more in one block" },
  { type: "hero", label: "Hero", icon: Layout, color: "text-blue-400", description: "Full-page hero banner" },
  { type: "text", label: "Text", icon: Type, color: "text-emerald-400", description: "Heading + body text" },
  { type: "image", label: "Image", icon: ImageIcon, color: "text-pink-400", description: "Single image block" },
  { type: "image_text", label: "Image + Text", icon: Columns, color: "text-amber-400", description: "Side-by-side media" },
  { type: "gallery", label: "Gallery", icon: Grid3X3, color: "text-purple-400", description: "Image grid" },
  { type: "cta", label: "Call to Action", icon: Megaphone, color: "text-red-400", description: "Action prompt banner" },
  { type: "faq", label: "FAQ", icon: HelpCircle, color: "text-cyan-400", description: "Q&A accordion" },
  { type: "form", label: "Form", icon: FileText, color: "text-orange-400", description: "Contact form embed" },
  { type: "projects_grid", label: "Projects Grid", icon: Layout, color: "text-amber-500", description: "Project cards listing" },
  { type: "blogs_grid", label: "Blogs Grid", icon: Layout, color: "text-blue-500", description: "Blog cards listing" },
  { type: "contact_info", label: "Contact Info", icon: Layers, color: "text-emerald-500", description: "Address & contact" },
  { type: "slideshow", label: "Slideshow", icon: ImageIcon, color: "text-violet-400", description: "Auto-advancing image slider" },
];

const DEFAULT_CONTENT: Record<string, any> = {
  composition: defaultCompositionContent(),
  hero: { title: "Your Heading Here", subtitle: "A compelling subtitle to engage your visitors.", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000", buttonText: "Get Started", buttonLink: "/" },
  text: { heading: "Section Title", subheading: "SUBTITLE", body: "Enter your content here. Share your story, values, or key information with your visitors." },
  image: { image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800", caption: "", heading: "" },
  image_text: { heading: "Title", body: "Description goes here...", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800", imagePosition: "left" },
  gallery: { heading: "Gallery", images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800"] },
  cta: { heading: "Ready to get started?", description: "Take the next step today.", buttonText: "Contact Us", buttonLink: "/contact" },
  faq: { heading: "Frequently Asked Questions", items: [{ question: "What do you offer?", answer: "We offer premium, sustainable real estate." }] },
  form: { heading: "Contact Us", formId: "", buttonText: "Submit" },
  projects_grid: { heading: "Our Projects", filterType: "all" },
  blogs_grid: { heading: "Latest Insights" },
  contact_info: { heading: "Get in Touch", body: "Reach out to us anytime." },
  slideshow: {
    slides: [
      { image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000", text: "Luxury Living, Reimagined", subtext: "Discover premium homes that harmonise with nature." },
      { image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000", text: "Elegance Meets Sustainability", subtext: "" },
    ],
    globalText: "",
    globalSubtext: "",
    timer: 5,
    transition: "fade",
    height: "large",
    overlayOpacity: 40,
  },
};

export const DEFAULT_SETTINGS = {
  bgColor: "",
  textColor: "",
  paddingTop: "pt-0",
  paddingBottom: "pb-0",
};

export const DEFAULT_ANIMATION = {
  type: "none",
  duration: 0.8,
  delay: 0,
  ease: "power2.out",
  trigger: "scroll",
};

// --- Sidebar Panel Tabs ---
type PanelTab = "content" | "style" | "animation";

export function VisualBuilder({ entityId, entityType }: { entityId: string; entityType: "page" | "template" }) {
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [libraryBlocks, setLibraryBlocks] = useState<any[]>([]);
  const [panelTab, setPanelTab] = useState<PanelTab>("content");
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const pickerRef = useRef<HTMLDivElement>(null);
  const libraryPickerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (!entityId) {
      setPage(null);
      setBlocks([]);
      setLoading(false);
      return;
    }

    try {
      let entityData: any = null;
      let blocksData: any[] = [];

      if (entityType === "page") {
        [entityData, blocksData] = await Promise.all([
          getPageById(entityId),
          getBlocksForPage(entityId),
        ]);
      } else {
        [entityData, blocksData] = await Promise.all([
          getBlockTemplateById(entityId),
          getBlocksForTemplate(entityId),
        ]);
      }

      setPage(entityData);
      setBlocks(Array.isArray(blocksData) ? blocksData : []);
      getLibraryBlocks().then((rows) => setLibraryBlocks(rows || []));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Could not load page data", description: message, type: "error" });
      setPage(null);
      setBlocks([]);
      setLibraryBlocks([]);
    }
    setLoading(false);
  }, [entityId, entityType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close pickers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (pickerRef.current?.contains(t)) return;
      if (libraryPickerRef.current?.contains(t)) return;
      setShowTypePicker(false);
      setShowLibraryPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddBlock = async (type: string) => {
    const sortOrder = blocks.length;
    const content = DEFAULT_CONTENT[type] || {};
    try {
      const pId = entityType === "page" ? entityId : null;
      const tId = entityType === "template" ? entityId : null;
      const raw = await createBlock(pId, type, sortOrder, content, DEFAULT_SETTINGS, DEFAULT_ANIMATION, tId);
      const newBlock = {
        ...raw,
        settings: raw.settings ?? DEFAULT_SETTINGS,
        animation_config: raw.animation_config ?? DEFAULT_ANIMATION,
      };
      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
      setShowTypePicker(false);
      setExpandedBlocks((prev) => new Set([...prev, newBlock.id]));
      toast({ title: `${type} block added`, type: "success" });
    } catch (e) {
      toast({
        title: "Could not add block",
        description:
          e instanceof Error
            ? e.message
            : "Run Supabase migrations 003 (block types) and 004 (blocks columns), or check the blocks table CHECK constraint.",
        type: "error",
      });
    }
  };

  const handleImportFromLibrary = async (lib: any) => {
    const sortOrder = blocks.length;
    try {
      const content = lib.content && typeof lib.content === "object" ? JSON.parse(JSON.stringify(lib.content)) : {};
      const settings = lib.settings && typeof lib.settings === "object" ? { ...lib.settings } : DEFAULT_SETTINGS;
      const anim =
        lib.animation_config && typeof lib.animation_config === "object" ? { ...lib.animation_config } : DEFAULT_ANIMATION;
      const pId = entityType === "page" ? entityId : null;
      const tId = entityType === "template" ? entityId : null;
      const raw = await createBlock(pId, lib.type, sortOrder, content, settings, anim, tId);
      const newBlock = {
        ...raw,
        settings: raw.settings ?? settings,
        animation_config: raw.animation_config ?? anim,
      };
      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(newBlock.id);
      setShowLibraryPicker(false);
      setExpandedBlocks((prev) => new Set([...prev, newBlock.id]));
      toast({ title: `Imported “${lib.name || "library block"}”`, type: "success" });
    } catch (e) {
      toast({
        title: "Import failed",
        description: e instanceof Error ? e.message : undefined,
        type: "error",
      });
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Remove this block from the page?")) return;
    try {
      await deleteBlock(id);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      if (selectedBlockId === id) setSelectedBlockId(null);
      toast({ title: "Block removed", type: "success" });
    } catch {
      toast({ title: "Error removing block", type: "error" });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(blocks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((b, i) => ({ ...b, sort_order: i }));
    setBlocks(updated);
    await reorderBlocks(updated.map((b) => ({ id: b.id, sort_order: b.sort_order })));
  };

  const updateBlockContent = (blockId: string, key: string, value: any) => {
    setBlocks((prev) =>
      prev.map((b) => b.id === blockId ? { ...b, content: { ...b.content, [key]: value } } : b)
    );
  };

  const updateBlockSettings = (blockId: string, key: string, value: any) => {
    setBlocks((prev) =>
      prev.map((b) => b.id === blockId ? { ...b, settings: { ...(b.settings || {}), [key]: value } } : b)
    );
  };

  const updateBlockAnimation = (blockId: string, key: string, value: any) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, animation_config: { ...(b.animation_config || DEFAULT_ANIMATION), [key]: value } }
          : b
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const block of blocks) {
        await updateBlock(block.id, {
          content: block.content,
          sort_order: block.sort_order,
          settings: block.settings || DEFAULT_SETTINGS,
          animation_config: block.animation_config || DEFAULT_ANIMATION,
        });
      }
      toast({ title: "Page saved!", type: "success" });
    } catch {
      toast({ title: "Error saving", type: "error" });
    }
    setSaving(false);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0B0F14]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between bg-[#111827] px-5 h-12 border-b border-[#1f2937] shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link href={entityType === "page" ? "/admin/pages" : "/admin/templates"} className="p-1.5 text-gray-500 hover:text-white rounded-md hover:bg-[#1f2937] transition-all">
            <ArrowLeft size={17} />
          </Link>
          <div className="w-px h-5 bg-[#1f2937]" />
          <span className="text-sm font-bold text-white">{page?.title || page?.name || "Editor"}</span>
          {entityType === "page" && <span className="text-[11px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">/{page?.slug}</span>}
          {entityType === "template" && <span className="text-[11px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">TEMPLATE</span>}
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#E5C354] text-[#0B0F14] px-4 py-1.5 rounded-lg font-bold text-xs transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      {/* ── 3-Pane Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT: Layer Outline ─── */}
        <aside className="w-64 shrink-0 flex flex-col bg-[#0c121e] border-r border-[#1f2937] overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Layers size={13} className="text-[#D4AF37]" /> Blocks ({blocks.length})
            </span>
          </div>

          {/* Block list */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex-1 py-2 px-2 space-y-1"
                >
                  {blocks.length === 0 && (
                    <div className="py-10 text-center text-gray-600 text-xs">
                      No blocks yet.<br />Click "Add Block" below.
                    </div>
                  )}
                  {blocks.map((block, index) => {
                    const meta = BLOCK_TYPES.find((t) => t.type === block.type);
                    const Icon = meta?.icon || Type;
                    const isSelected = selectedBlockId === block.id;
                    const isExpanded = expandedBlocks.has(block.id);

                    return (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`rounded-lg overflow-hidden transition-all ${snapshot.isDragging ? "shadow-2xl ring-1 ring-[#D4AF37]/50" : ""}`}
                          >
                            <div
                              className={`flex items-center gap-2 px-2 py-2 cursor-pointer rounded-lg transition-all ${
                                isSelected
                                  ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30"
                                  : "hover:bg-[#111827] border border-transparent"
                              }`}
                              onClick={() => {
                                setSelectedBlockId(block.id);
                                setPanelTab("content");
                              }}
                            >
                              <div {...provided.dragHandleProps} className="text-gray-600 hover:text-gray-300 cursor-grab shrink-0" onClick={(e) => e.stopPropagation()}>
                                <GripVertical size={13} />
                              </div>
                              <Icon size={13} className={meta?.color || "text-gray-400"} />
                              <span className="text-xs font-medium text-gray-300 flex-grow truncate">
                                {meta?.label || block.type}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                                className="text-gray-700 hover:text-red-400 transition-colors p-0.5"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Block + Library */}
          <div className="p-3 border-t border-[#1f2937] space-y-2">
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => {
                  setShowTypePicker((v) => !v);
                  setShowLibraryPicker(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#1f2937] rounded-lg text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 transition-all text-xs font-semibold"
              >
                <Plus size={13} /> Add block
              </button>
              {showTypePicker && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-2 py-1 mb-1">Block type</div>
                  {BLOCK_TYPES.map((bt) => {
                    const Icon = bt.icon;
                    return (
                      <button
                        key={bt.type}
                        type="button"
                        onClick={() => handleAddBlock(bt.type)}
                        className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#0B0F14] text-gray-300 hover:text-white transition-all text-left group"
                      >
                        <Icon size={14} className={`${bt.color} mt-0.5 shrink-0`} />
                        <div>
                          <div className="text-xs font-semibold">{bt.label}</div>
                          <div className="text-[10px] text-gray-600 group-hover:text-gray-400">{bt.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="relative" ref={libraryPickerRef}>
              <button
                type="button"
                onClick={() => {
                  setShowLibraryPicker((v) => !v);
                  setShowTypePicker(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#1f2937] rounded-lg text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-xs font-semibold"
              >
                <BookMarked size={13} /> From library
              </button>
              {showLibraryPicker && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111827] border border-[#1f2937] rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider px-2 py-1 mb-1">Saved in Blocks → Library</div>
                  {libraryBlocks.length === 0 ? (
                    <p className="text-[11px] text-gray-500 px-2 py-3">No library blocks yet. Create one under Admin → Blocks.</p>
                  ) : (
                    libraryBlocks.map((lib) => (
                      <button
                        key={lib.id}
                        type="button"
                        onClick={() => handleImportFromLibrary(lib)}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#0B0F14] text-gray-300 hover:text-white transition-all"
                      >
                        <div className="text-xs font-semibold truncate">{lib.name}</div>
                        <div className="text-[10px] text-gray-600 font-mono">{lib.type}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ─── CENTER: Canvas Preview ─── */}
        <main className="flex-1 overflow-y-auto bg-[#0a0e16] relative flex flex-col">
          {/* Browser chrome strip */}
          <div className="sticky top-0 z-20 bg-[#f5f5f7] px-4 py-2 border-b border-gray-300 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex items-center bg-white border border-gray-200 rounded-md px-4 py-0.5 text-[11px] font-mono text-gray-400">
              ecovistalife.com/{page?.slug}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <MousePointer size={11} /> Click a block to edit
            </div>
          </div>

          {/* Live canvas */}
          <div className="bg-white min-h-full relative flex-1">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4 text-gray-400">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Layout size={28} className="text-gray-300" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-500">Your page is empty</p>
                  <p className="text-sm mt-1">Add blocks from the left panel to start building</p>
                </div>
              </div>
            ) : (
              blocks.map((block) => {
                const isSelected = selectedBlockId === block.id;
                const meta = BLOCK_TYPES.find((t) => t.type === block.type);

                return (
                  <div
                    key={block.id}
                    className={`relative group transition-all ${
                      isSelected
                        ? "outline outline-2 outline-[#D4AF37] outline-offset-[-2px]"
                        : "hover:outline hover:outline-1 hover:outline-[#D4AF37]/40 hover:outline-offset-[-1px]"
                    }`}
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setPanelTab("content");
                    }}
                  >
                    {/* Block label overlay */}
                    <div className={`absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all pointer-events-none ${
                      isSelected
                        ? "bg-[#D4AF37] text-[#0B0F14] opacity-100"
                        : "bg-[#D4AF37]/80 text-[#0B0F14] opacity-0 group-hover:opacity-100"
                    }`}>
                      {meta?.label || block.type}
                    </div>

                    {/* Delete button overlay */}
                    <button
                      className="absolute top-2 right-2 z-10 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                      onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                    >
                      <Trash2 size={11} />
                    </button>

                    <AdminBlockRenderer blocks={[block]} />
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* ─── RIGHT: Settings Panel ─── */}
        <aside className={`w-80 shrink-0 flex flex-col bg-[#0c121e] border-l border-[#1f2937] transition-all duration-200 overflow-hidden ${
          selectedBlock ? "translate-x-0" : "translate-x-full w-0"
        }`}>
          {selectedBlock && (
            <>
              {/* Panel Header */}
              <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {(() => { const meta = BLOCK_TYPES.find(t => t.type === selectedBlock.type); const Icon = meta?.icon || Type; return <Icon size={13} className={meta?.color} />; })()}
                  <span className="text-xs font-bold text-white">
                    {BLOCK_TYPES.find(t => t.type === selectedBlock.type)?.label || selectedBlock.type}
                  </span>
                </div>
                <button onClick={() => setSelectedBlockId(null)} className="p-1 text-gray-600 hover:text-white rounded transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Tab Bar */}
              <div className="flex border-b border-[#1f2937] shrink-0">
                {([
                  { id: "content" as PanelTab, label: "Content", icon: Settings },
                  { id: "style" as PanelTab, label: "Style", icon: Palette },
                  { id: "animation" as PanelTab, label: "Animate", icon: Zap },
                ]).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
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

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {panelTab === "content" && (
                  <ContentPanel block={selectedBlock} onChange={updateBlockContent} />
                )}
                {panelTab === "style" && (
                  <StylePanel
                    block={selectedBlock}
                    onChange={updateBlockSettings}
                  />
                )}
                {panelTab === "animation" && (
                  <AnimationPanel
                    block={selectedBlock}
                    onChange={updateBlockAnimation}
                  />
                )}
              </div>
            </>
          )}

          {!selectedBlock && (
            <div className="flex flex-col items-center justify-center h-full text-gray-700 px-6 text-center">
              <MousePointer size={28} className="mb-3 text-gray-800" />
              <p className="text-sm font-semibold">No block selected</p>
              <p className="text-xs mt-1 text-gray-600">Click any block on the canvas to edit its settings here.</p>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}

// ============================================================
// CONTENT PANEL — field editors per block type
// ============================================================
export function ContentPanel({ block, onChange }: { block: any; onChange: (id: string, key: string, val: any) => void }) {
  const c = block.content || {};
  const id = block.id;
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

  const inputClass = "w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs transition-all resize-none";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  const field = (key: string, label: string, type: "text" | "textarea" | "url" | "select" = "text", options?: string[]) => (
    <div key={key} className="space-y-1">
      <label className={labelClass}>{label}</label>
      {type === "textarea" ? (
        <textarea rows={3} value={c[key] || ""} onChange={(e) => onChange(id, key, e.target.value)} className={inputClass} />
      ) : type === "select" && options ? (
        <select value={c[key] || ""} onChange={(e) => onChange(id, key, e.target.value)} className={inputClass + " appearance-none"}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={c[key] || ""} onChange={(e) => onChange(id, key, e.target.value)} className={inputClass} />
      )}
    </div>
  );

  const faqItems = () => {
    const items: any[] = c.items || [];
    return (
      <div className="space-y-1">
        <label className={labelClass}>FAQ Items</label>
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div key={i} className="bg-[#0B0F14] p-3 rounded-lg border border-[#1f2937] space-y-2">
              <input value={item.question} onChange={(e) => { const n = [...items]; n[i] = { ...item, question: e.target.value }; onChange(id, "items", n); }} className={inputClass} placeholder="Question" />
              <textarea rows={2} value={item.answer} onChange={(e) => { const n = [...items]; n[i] = { ...item, answer: e.target.value }; onChange(id, "items", n); }} className={inputClass} placeholder="Answer" />
              <button type="button" onClick={() => onChange(id, "items", items.filter((_, idx) => idx !== i))} className="text-[10px] text-red-400 hover:text-red-300 font-bold">Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => onChange(id, "items", [...items, { question: "", answer: "" }])} className="text-[10px] text-[#D4AF37] font-bold hover:text-[#E5C354]">+ Add Question</button>
        </div>
      </div>
    );
  };

  const galleryImages = () => {
    const images: string[] = c.images || [];
    return (
      <div className="space-y-2">
        <label className={labelClass}>Image URLs (one per line)</label>
        <textarea rows={5} value={images.join("\n")} onChange={(e) => onChange(id, "images", e.target.value.split("\n").filter(Boolean))} className={inputClass + " font-mono"} placeholder="https://example.com/img.jpg" />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setGalleryPickerOpen(true)}
            className="text-[10px] font-bold text-[#D4AF37] hover:text-[#E5C354] tracking-wide"
          >
            + Add from library
          </button>
        </div>
        <MediaLibraryPicker
          open={galleryPickerOpen}
          onOpenChange={setGalleryPickerOpen}
          filter="image"
          title="Add gallery image"
          onSelect={(url) => {
            onChange(id, "images", [...images, url]);
            setGalleryPickerOpen(false);
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {block.type === "composition" && (
        <div className="space-y-2 -mx-1">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            Add sections below and drag to reorder. Preview updates in the canvas when you save or click outside.
          </p>
          <CompositionEditor
            items={Array.isArray(c.items) ? c.items : defaultCompositionContent().items}
            onChange={(next) => onChange(id, "items", next)}
          />
        </div>
      )}
      {block.type === "hero" && (<>
        {field("title", "Title")}
        {field("subtitle", "Subtitle", "textarea")}
        <div className="space-y-1">
          <span className={labelClass}>Background image</span>
          <ImageUploadField value={c.image || ""} onChange={(url) => onChange(id, "image", url)} />
        </div>
        {field("buttonText", "Button Label")}
        {field("buttonLink", "Button Link", "url")}
      </>)}
      {block.type === "text" && (<>
        {field("subheading", "Subheading")}
        {field("heading", "Main Heading")}
        {field("body", "Body Content", "textarea")}
      </>)}
      {block.type === "image" && (<>
        {field("heading", "Heading (optional)")}
        <div className="space-y-1">
          <span className={labelClass}>Image</span>
          <ImageUploadField value={c.image || ""} onChange={(url) => onChange(id, "image", url)} />
        </div>
        {field("caption", "Caption")}
      </>)}
      {block.type === "image_text" && (<>
        {field("heading", "Heading")}
        {field("body", "Body Text", "textarea")}
        <div className="space-y-1">
          <span className={labelClass}>Image</span>
          <ImageUploadField value={c.image || ""} onChange={(url) => onChange(id, "image", url)} />
        </div>
        {field("imagePosition", "Image Position", "select", ["left", "right"])}
      </>)}
      {block.type === "gallery" && (<>
        {field("heading", "Gallery Heading")}
        {galleryImages()}
      </>)}
      {block.type === "cta" && (<>
        {field("heading", "Heading")}
        {field("description", "Description", "textarea")}
        {field("buttonText", "Button Label")}
        {field("buttonLink", "Button Link")}
      </>)}
      {block.type === "faq" && (<>
        {field("heading", "Section Heading")}
        {faqItems()}
      </>)}
      {block.type === "form" && (<>
        {field("heading", "Form Heading")}
        {field("formId", "Form ID")}
        {field("buttonText", "Button Label")}
      </>)}
      {block.type === "projects_grid" && (<>
        {field("heading", "Section Heading")}
        {field("filterType", "Filter Type", "select", ["all", "ongoing", "upcoming", "completed"])}
      </>)}
      {block.type === "blogs_grid" && (<>
        {field("heading", "Section Heading")}
      </>)}
      {block.type === "contact_info" && (<>
        {field("heading", "Heading")}
        {field("body", "Description", "textarea")}
      </>)}
      {block.type === "slideshow" && (
        <SlideshowEditor block={block} onChange={onChange} />
      )}
    </div>
  );
}

// ============================================================
// FOOTER EDITOR
// ============================================================
export function FooterEditor({ block, onChange }: { block: any; onChange: (id: string, key: string, val: any) => void }) {
  const c = block.content || {};
  const id = block.id;

  const inputClass = "w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs transition-all";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-4">
      {/* Brand Info */}
      <div className="bg-[#0B0F14] border border-[#1f2937] rounded-xl p-4 space-y-3">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Brand Information</h4>
        <div>
          <label className={labelClass}>Brand Name</label>
          <input value={c.brandName || ""} onChange={(e) => onChange(id, "brandName", e.target.value)} className={inputClass} placeholder="EcoVistaLife" />
        </div>
        <div>
          <label className={labelClass}>Tagline</label>
          <textarea rows={2} value={c.tagline || ""} onChange={(e) => onChange(id, "tagline", e.target.value)} className={inputClass} />
        </div>
      </div>
      
      {/* Contact Info */}
      <div className="bg-[#0B0F14] border border-[#1f2937] rounded-xl p-4 space-y-3">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact Details</h4>
        <div>
          <label className={labelClass}>Address</label>
          <input value={c.address || ""} onChange={(e) => onChange(id, "address", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input value={c.phone || ""} onChange={(e) => onChange(id, "phone", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input value={c.email || ""} onChange={(e) => onChange(id, "email", e.target.value)} className={inputClass} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SLIDESHOW EDITOR — per-slide management
// ============================================================
export function SlideshowEditor({ block, onChange }: { block: any; onChange: (id: string, key: string, val: any) => void }) {
  const c = block.content || {};
  const id = block.id;
  const slides: any[] = c.slides || [];

  const inputClass = "w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs transition-all";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  const updateSlide = (i: number, key: string, value: string) => {
    const updated = slides.map((s, idx) => idx === i ? { ...s, [key]: value } : s);
    onChange(id, "slides", updated);
  };

  const addSlide = () => {
    onChange(id, "slides", [...slides, { image: "", text: "", subtext: "" }]);
  };

  const removeSlide = (i: number) => {
    onChange(id, "slides", slides.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-5">
      {/* Global settings */}
      <div className="bg-[#0B0F14] border border-[#1f2937] rounded-xl p-4 space-y-3">
        <h4 className={labelClass}>Slideshow Settings</h4>
        <div>
          <label className={labelClass}>Auto-play Timer (seconds)</label>
          <div className="flex items-center gap-3">
            <input type="range" min="2" max="20" step="1" value={c.timer ?? 5} onChange={(e) => onChange(id, "timer", parseInt(e.target.value))} className="flex-1 accent-[#D4AF37] cursor-pointer" />
            <span className="text-xs text-white font-bold w-8 text-center">{c.timer ?? 5}s</span>
          </div>
        </div>
        <div>
          <label className={labelClass}>Transition Style</label>
          <select value={c.transition || "fade"} onChange={(e) => onChange(id, "transition", e.target.value)} className={inputClass + " appearance-none"}>
            <option value="fade">Fade</option>
            <option value="slide">Slide Left</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Height</label>
          <select value={c.height || "large"} onChange={(e) => onChange(id, "height", e.target.value)} className={inputClass + " appearance-none"}>
            <option value="small">Small (40vh)</option>
            <option value="medium">Medium (60vh)</option>
            <option value="large">Large (80vh)</option>
            <option value="full">Full Screen (100vh)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Overlay Darkness: {c.overlayOpacity ?? 40}%</label>
          <input type="range" min="0" max="90" step="5" value={c.overlayOpacity ?? 40} onChange={(e) => onChange(id, "overlayOpacity", parseInt(e.target.value))} className="w-full accent-[#D4AF37] cursor-pointer" />
        </div>
      </div>

      {/* Global text (shown on all slides unless overridden per-slide) */}
      <div className="bg-[#0B0F14] border border-[#1f2937] rounded-xl p-4 space-y-3">
        <h4 className={labelClass}>Global Overlay Text (optional)</h4>
        <div>
          <label className={labelClass}>Title (shown on all slides)</label>
          <input value={c.globalText || ""} onChange={(e) => onChange(id, "globalText", e.target.value)} className={inputClass} placeholder="Leave blank to use per-slide text" />
        </div>
        <div>
          <label className={labelClass}>Subtitle (shown on all slides)</label>
          <input value={c.globalSubtext || ""} onChange={(e) => onChange(id, "globalSubtext", e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Per-slide editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Slides ({slides.length})</label>
          <button type="button" onClick={addSlide} className="text-[10px] font-bold text-[#D4AF37] hover:text-[#E5C354] flex items-center gap-1">
            + Add Slide
          </button>
        </div>
        {slides.map((slide: any, i: number) => (
          <div key={i} className="bg-[#0B0F14] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Slide {i + 1}</span>
              <button type="button" onClick={() => removeSlide(i)} className="text-[10px] text-red-400 hover:text-red-300 font-bold">Remove</button>
            </div>
            <div>
              <ImageUploadField
                label="Image"
                value={slide.image || ""}
                onChange={(url) => updateSlide(i, "image", url)}
              />
            </div>
            <div>
              <label className={labelClass}>Slide Title (overrides global text)</label>
              <input value={slide.text || ""} onChange={(e) => updateSlide(i, "text", e.target.value)} className={inputClass} placeholder="Optional — leave blank to use global" />
            </div>
            <div>
              <label className={labelClass}>Slide Subtitle</label>
              <input value={slide.subtext || ""} onChange={(e) => updateSlide(i, "subtext", e.target.value)} className={inputClass} />
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <button type="button" onClick={addSlide} className="w-full py-6 border border-dashed border-[#1f2937] rounded-xl text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 text-xs font-semibold transition-all">
            + Add your first slide
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STYLE PANEL
// ============================================================
export function StylePanel({ block, onChange }: { block: any; onChange: (id: string, key: string, val: any) => void }) {
  const s = block.settings || DEFAULT_SETTINGS;
  const id = block.id;

  const inputClass = "w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs transition-all";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  const PADDING_OPTIONS = ["pt-0", "pt-8", "pt-12", "pt-16", "pt-24", "pt-32"];
  const PADDING_BOTTOM_OPTIONS = ["pb-0", "pb-8", "pb-12", "pb-16", "pb-24", "pb-32"];

  return (
    <div className="space-y-5">
      <div className="bg-[#0B0F14] border border-[#1f2937] rounded-xl p-4 space-y-4">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Background</h4>
        <div>
          <label className={labelClass}>Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={s.bgColor || "#ffffff"} onChange={(e) => onChange(id, "bgColor", e.target.value)} className="w-10 h-9 rounded-lg border border-[#1f2937] bg-[#0B0F14] cursor-pointer p-1" />
            <input type="text" value={s.bgColor || ""} onChange={(e) => onChange(id, "bgColor", e.target.value)} placeholder="e.g. #ffffff or transparent" className={inputClass + " flex-1"} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Text Color Override</label>
          <div className="flex gap-2">
            <input type="color" value={s.textColor || "#111827"} onChange={(e) => onChange(id, "textColor", e.target.value)} className="w-10 h-9 rounded-lg border border-[#1f2937] bg-[#0B0F14] cursor-pointer p-1" />
            <input type="text" value={s.textColor || ""} onChange={(e) => onChange(id, "textColor", e.target.value)} placeholder="e.g. #111827" className={inputClass + " flex-1"} />
          </div>
        </div>
      </div>

      <div className="bg-[#0B0F14] border border-[#1f2937] rounded-xl p-4 space-y-4">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Spacing</h4>
        <div>
          <label className={labelClass}>Padding Top</label>
          <select value={s.paddingTop || "pt-0"} onChange={(e) => onChange(id, "paddingTop", e.target.value)} className={inputClass + " appearance-none"}>
            {PADDING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Padding Bottom</label>
          <select value={s.paddingBottom || "pb-0"} onChange={(e) => onChange(id, "paddingBottom", e.target.value)} className={inputClass + " appearance-none"}>
            {PADDING_BOTTOM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ANIMATION PANEL (GSAP)
// ============================================================
export function AnimationPanel({ block, onChange }: { block: any; onChange: (id: string, key: string, val: any) => void }) {
  const a = block.animation_config || DEFAULT_ANIMATION;
  const id = block.id;

  const inputClass = "w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs appearance-none transition-all";
  const labelClass = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-5">
      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-3">
        <p className="text-[10px] text-[#D4AF37] font-semibold flex items-center gap-1.5">
          <Zap size={10} /> Powered by GSAP
        </p>
        <p className="text-[10px] text-gray-500 mt-1">Animations auto-trigger on the public site. Save the page to apply.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Animation Type</label>
          <select value={a.type || "none"} onChange={(e) => onChange(id, "type", e.target.value)} className={inputClass}>
            {ANIMATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {a.type && a.type !== "none" && (<>
          <div>
            <label className={labelClass}>Trigger</label>
            <select value={a.trigger || "scroll"} onChange={(e) => onChange(id, "trigger", e.target.value)} className={inputClass}>
              <option value="scroll">On Scroll (Intersection)</option>
              <option value="load">On Page Load</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Duration: {a.duration || 0.8}s</label>
            <input type="range" min="0.2" max="2" step="0.1" value={a.duration || 0.8} onChange={(e) => onChange(id, "duration", parseFloat(e.target.value))} className="w-full accent-[#D4AF37] cursor-pointer" />
          </div>

          <div>
            <label className={labelClass}>Delay: {a.delay || 0}s</label>
            <input type="range" min="0" max="1.5" step="0.1" value={a.delay || 0} onChange={(e) => onChange(id, "delay", parseFloat(e.target.value))} className="w-full accent-[#D4AF37] cursor-pointer" />
          </div>

          <div>
            <label className={labelClass}>Easing</label>
            <select value={a.ease || "power2.out"} onChange={(e) => onChange(id, "ease", e.target.value)} className={inputClass}>
              {EASING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </>)}
      </div>
    </div>
  );
}
