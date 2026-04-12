"use client";

import { useCallback, useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  GripVertical,
  Trash2,
  Type,
  AlignLeft,
  ImageIcon,
  Square,
  Minus,
  LayoutList,
  FileText,
} from "lucide-react";
import {
  type CompositionInnerBlock,
  type CompositionInnerType,
  COMPOSITION_INNER_LABELS,
  createCompositionInner,
} from "@/lib/composition";
import { getForms } from "@/lib/cms";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const ADD_TYPES: { type: CompositionInnerType; icon: typeof Type }[] = [
  { type: "heading", icon: Type },
  { type: "paragraph", icon: AlignLeft },
  { type: "image", icon: ImageIcon },
  { type: "button", icon: Square },
  { type: "form", icon: FileText },
  { type: "spacer", icon: LayoutList },
  { type: "divider", icon: Minus },
];

function previewLine(block: CompositionInnerBlock): string {
  const p = block.props || {};
  switch (block.type) {
    case "heading":
      return (p.text as string)?.slice(0, 48) || "Heading";
    case "paragraph":
      return (p.text as string)?.replace(/\s+/g, " ").slice(0, 56) || "Text";
    case "image":
      return (p.url as string)?.slice(0, 40) || "Image";
    case "button":
      return `${p.label || "Button"} → ${p.href || "/"}`;
    case "form":
      return p.formId ? `Form: ${String(p.formId).slice(0, 8)}…` : "Form (pick ID)";
    case "spacer":
      return `${p.height || 24}px gap`;
    case "divider":
      return "— divider —";
    default:
      return block.type;
  }
}

function Inspector({
  block,
  forms,
  onUpdateProps,
}: {
  block: CompositionInnerBlock;
  forms: { id: string; name: string }[];
  onUpdateProps: (patch: Record<string, unknown>) => void;
}) {
  const p = block.props || {};
  const input =
    "w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs";
  const label = "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-3">
          <div>
            <label className={label}>Text</label>
            <input className={input} value={(p.text as string) || ""} onChange={(e) => onUpdateProps({ text: e.target.value })} />
          </div>
          <div>
            <label className={label}>Level</label>
            <select
              className={input}
              value={(p.level as string) || "h2"}
              onChange={(e) => onUpdateProps({ level: e.target.value })}
            >
              <option value="h2">Large (H2)</option>
              <option value="h3">Medium (H3)</option>
              <option value="h4">Small (H4)</option>
            </select>
          </div>
        </div>
      );
    case "paragraph":
      return (
        <div>
          <label className={label}>Text</label>
          <textarea
            rows={8}
            className={input + " resize-y min-h-[120px]"}
            value={(p.text as string) || ""}
            onChange={(e) => onUpdateProps({ text: e.target.value })}
          />
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <ImageUploadField label="Image" value={(p.url as string) || ""} onChange={(url) => onUpdateProps({ url })} />
          <div>
            <label className={label}>Or image URL</label>
            <input className={input} value={(p.url as string) || ""} onChange={(e) => onUpdateProps({ url: e.target.value })} />
          </div>
          <div>
            <label className={label}>Alt text</label>
            <input className={input} value={(p.alt as string) || ""} onChange={(e) => onUpdateProps({ alt: e.target.value })} />
          </div>
          <div>
            <label className={label}>Caption</label>
            <input className={input} value={(p.caption as string) || ""} onChange={(e) => onUpdateProps({ caption: e.target.value })} />
          </div>
        </div>
      );
    case "button":
      return (
        <div className="space-y-3">
          <div>
            <label className={label}>Label</label>
            <input className={input} value={(p.label as string) || ""} onChange={(e) => onUpdateProps({ label: e.target.value })} />
          </div>
          <div>
            <label className={label}>Link</label>
            <input className={input} value={(p.href as string) || ""} onChange={(e) => onUpdateProps({ href: e.target.value })} />
          </div>
          <div>
            <label className={label}>Style</label>
            <select
              className={input}
              value={(p.variant as string) || "primary"}
              onChange={(e) => onUpdateProps({ variant: e.target.value })}
            >
              <option value="primary">Primary (gold)</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        </div>
      );
    case "spacer":
      return (
        <div>
          <label className={label}>Height (px)</label>
          <input
            type="number"
            min={8}
            max={200}
            className={input}
            value={Number(p.height) || 24}
            onChange={(e) => onUpdateProps({ height: parseInt(e.target.value, 10) || 24 })}
          />
        </div>
      );
    case "divider":
      return <p className="text-[11px] text-gray-500">No settings. This draws a horizontal line.</p>;
    case "form":
      return (
        <div className="space-y-3">
          <div>
            <label className={label}>Form</label>
            <select
              className={input}
              value={(p.formId as string) || ""}
              onChange={(e) => onUpdateProps({ formId: e.target.value })}
            >
              <option value="">— Select form —</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Heading (optional)</label>
            <input className={input} value={(p.heading as string) || ""} onChange={(e) => onUpdateProps({ heading: e.target.value })} />
          </div>
          <div>
            <label className={label}>Submit button text</label>
            <input
              className={input}
              value={(p.buttonText as string) || "Submit"}
              onChange={(e) => onUpdateProps({ buttonText: e.target.value })}
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function CompositionEditor({
  items,
  onChange,
  className = "",
}: {
  items: CompositionInnerBlock[];
  onChange: (next: CompositionInnerBlock[]) => void;
  className?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id ?? null);
  const [forms, setForms] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getForms().then((rows) => setForms((rows || []).map((r: any) => ({ id: r.id, name: r.name }))));
  }, []);

  useEffect(() => {
    if (selectedId && !items.some((i) => i.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  const selected = items.find((i) => i.id === selectedId) || null;

  const updateProps = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      onChange(
        items.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...patch } } : b))
      );
    },
    [items, onChange]
  );

  const remove = (id: string) => {
    const next = items.filter((b) => b.id !== id);
    onChange(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const add = (type: CompositionInnerType) => {
    const next = [...items, createCompositionInner(type)];
    onChange(next);
    setSelectedId(next[next.length - 1].id);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onChange(reordered);
  };

  return (
    <div className={`flex flex-col md:flex-row gap-0 min-h-[420px] border border-[#1f2937] rounded-xl overflow-hidden bg-[#0c121e] ${className}`}>
      <div className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-[#1f2937]">
        <div className="px-3 py-2 border-b border-[#1f2937] bg-[#111827]">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Add section</p>
          <div className="flex flex-wrap gap-1.5">
            {ADD_TYPES.map(({ type, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => add(type)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-[#0B0F14] border border-[#1f2937] text-gray-300 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
              >
                <Icon size={12} />
                {COMPOSITION_INNER_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 max-h-[min(70vh,560px)]">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 text-sm py-12 px-4">Add headings, text, images, forms, and more. Drag handles to reorder.</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="composition-inner">
                {(provided) => (
                  <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-1.5">
                    {items.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(dragProvided, snapshot) => (
                          <li
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={`rounded-lg border transition-all ${
                              selectedId === block.id
                                ? "border-[#D4AF37] bg-[#D4AF37]/5"
                                : "border-[#1f2937] bg-[#0B0F14] hover:border-gray-600"
                            } ${snapshot.isDragging ? "shadow-lg ring-1 ring-[#D4AF37]/40" : ""}`}
                          >
                            <div
                              role="button"
                              tabIndex={0}
                              className="w-full flex items-center gap-2 px-2 py-2 text-left cursor-pointer"
                              onClick={() => setSelectedId(block.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedId(block.id);
                                }
                              }}
                            >
                              <span {...dragProvided.dragHandleProps} className="text-gray-600 hover:text-gray-400 p-0.5 cursor-grab shrink-0">
                                <GripVertical size={14} />
                              </span>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] w-16 shrink-0">
                                {COMPOSITION_INNER_LABELS[block.type]}
                              </span>
                              <span className="text-[11px] text-gray-400 truncate flex-1">{previewLine(block)}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove(block.id);
                                }}
                                className="p-1 text-gray-600 hover:text-red-400 shrink-0"
                                aria-label="Remove"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>

      <div className="w-full md:w-[280px] shrink-0 flex flex-col bg-[#111827]">
        <div className="px-3 py-2 border-b border-[#1f2937]">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Selected section</p>
        </div>
        <div className="p-3 overflow-y-auto flex-1 max-h-[min(70vh,560px)]">
          {selected ? (
            <Inspector block={selected} forms={forms} onUpdateProps={(patch) => updateProps(selected.id, patch)} />
          ) : (
            <p className="text-xs text-gray-500">Select a section to edit its content.</p>
          )}
        </div>
      </div>
    </div>
  );
}
