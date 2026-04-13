"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Folder, ChevronRight, Image as ImageIcon, Video, FileText, Loader2 } from "lucide-react";
import { getMediaFolders, getMediaAssetsForFolder, type MediaAssetRow, type MediaFolderRow } from "@/lib/cms";

export type MediaLibraryFilter = "image" | "video" | "document" | "all";

interface MediaLibraryPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (publicUrl: string) => void;
  filter?: MediaLibraryFilter;
  title?: string;
}

function filterAssets(assets: MediaAssetRow[], filter: MediaLibraryFilter): MediaAssetRow[] {
  if (filter === "all") return assets;
  return assets.filter((a) => a.kind === filter);
}

function breadcrumb(folderId: string | null, folders: MediaFolderRow[]): MediaFolderRow[] {
  if (!folderId) return [];
  const byId = new Map(folders.map((f) => [f.id, f]));
  const chain: MediaFolderRow[] = [];
  let cur: MediaFolderRow | undefined = byId.get(folderId);
  while (cur) {
    chain.unshift(cur);
    cur = cur.parent_id ? byId.get(cur.parent_id) : undefined;
  }
  return chain;
}

export function MediaLibraryPicker({
  open,
  onOpenChange,
  onSelect,
  filter = "all",
  title = "Media library",
}: MediaLibraryPickerProps) {
  const [folders, setFolders] = useState<MediaFolderRow[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [assets, setAssets] = useState<MediaAssetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = useCallback(async (folderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getMediaAssetsForFolder(folderId);
      setAssets(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load files");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const rows = await getMediaFolders();
      setFolders(rows);
      if (rows.length === 0) return;
      setCurrentFolderId((prev) => {
        if (prev && rows.some((r) => r.id === prev)) return prev;
        const root = rows.find((f) => f.parent_id === null) ?? rows[0];
        return root.id;
      });
    })();
  }, [open]);

  useEffect(() => {
    if (!open || !currentFolderId) return;
    loadAssets(currentFolderId);
  }, [open, currentFolderId, loadAssets]);

  const childFolders = useMemo(
    () => folders.filter((f) => f.parent_id === currentFolderId).sort((a, b) => a.name.localeCompare(b.name)),
    [folders, currentFolderId]
  );

  const crumbs = useMemo(() => breadcrumb(currentFolderId, folders), [currentFolderId, folders]);

  const visibleAssets = useMemo(() => filterAssets(assets, filter), [assets, filter]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-library-title"
        className="w-full max-w-2xl max-h-[85vh] bg-[#111827] border border-[#1f2937] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f2937] shrink-0">
          <h2 id="media-library-title" className="text-sm font-bold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 py-2 border-b border-[#1f2937] flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
          <button
            type="button"
            className="hover:text-[#D4AF37] font-medium"
            onClick={() => {
              const root = folders.find((f) => f.parent_id === null);
              if (root) setCurrentFolderId(root.id);
            }}
          >
            Root
          </button>
          {crumbs.map((c) => (
            <span key={c.id} className="flex items-center gap-1">
              <ChevronRight size={12} className="text-gray-600" />
              <button type="button" className="hover:text-[#D4AF37] font-medium" onClick={() => setCurrentFolderId(c.id)}>
                {c.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          {error && <p className="text-xs text-red-400">{error}</p>}

          {childFolders.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Folders</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {childFolders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCurrentFolderId(f.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0F14] border border-[#1f2937] hover:border-[#D4AF37]/40 text-left text-xs text-gray-200 transition-colors"
                  >
                    <Folder size={16} className="text-[#D4AF37] shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Files</div>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
              </div>
            ) : visibleAssets.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                No matching files in this folder. Upload in Admin → Documents.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {visibleAssets.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onSelect(a.public_url);
                      onOpenChange(false);
                    }}
                    className="group flex flex-col rounded-xl border border-[#1f2937] bg-[#0B0F14] overflow-hidden hover:border-[#D4AF37]/50 transition-colors text-left"
                  >
                    <div className="aspect-video bg-black/40 flex items-center justify-center overflow-hidden">
                      {a.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.public_url} alt="" className="w-full h-full object-cover" />
                      ) : a.kind === "video" ? (
                        <Video size={32} className="text-gray-500 group-hover:text-[#D4AF37]" />
                      ) : (
                        <FileText size={32} className="text-gray-500 group-hover:text-[#D4AF37]" />
                      )}
                    </div>
                    <div className="p-2 flex items-start gap-2 min-w-0">
                      {a.kind === "image" ? (
                        <ImageIcon size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      ) : a.kind === "video" ? (
                        <Video size={14} className="text-violet-400 shrink-0 mt-0.5" />
                      ) : (
                        <FileText size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-[10px] text-gray-300 truncate leading-snug">{a.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#1f2937] text-[10px] text-gray-500 shrink-0">
          Choose a file to insert its public URL into the block.
        </div>
      </div>
    </div>
  );
}
