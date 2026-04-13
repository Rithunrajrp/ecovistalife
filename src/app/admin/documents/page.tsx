"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderPlus,
  Upload,
  Trash2,
  ChevronRight,
  Folder,
  Image as ImageIcon,
  Video,
  FileText,
  Loader2,
  Library,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  getMediaFolders,
  getMediaAssetsForFolder,
  createMediaFolder,
  createMediaAsset,
  deleteMediaAsset,
  deleteMediaFolder,
  getMediaAssetsInFolders,
  type MediaAssetRow,
  type MediaFolderRow,
} from "@/lib/cms";
import { MEDIA_BUCKET, collectSubtreeFolderIds, uploadMediaFile } from "@/lib/media";
import { toast } from "@/components/ui/Toaster";

function formatBytes(n: number | null): string {
  if (n == null || n <= 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
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

export default function AdminDocumentsPage() {
  const [folders, setFolders] = useState<MediaFolderRow[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [assets, setAssets] = useState<MediaAssetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const refreshFolders = useCallback(async () => {
    const rows = await getMediaFolders();
    setFolders(rows);
    return rows;
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        let rows = await getMediaFolders();
        if (rows.length === 0) {
          await createMediaFolder("Library", null);
          rows = await getMediaFolders();
        }
        setFolders(rows);
        const root = rows.find((f) => f.parent_id === null) ?? rows[0];
        if (root) setCurrentFolderId(root.id);
      } catch (e) {
        toast({
          title: "Media library unavailable",
          description:
            e instanceof Error
              ? e.message
              : "Apply migration 005_media_library.sql and ensure you are signed in.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!currentFolderId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await getMediaAssetsForFolder(currentFolderId);
        if (!cancelled) setAssets(rows);
      } catch {
        if (!cancelled) setAssets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentFolderId]);

  const childFolders = useMemo(
    () => folders.filter((f) => f.parent_id === currentFolderId).sort((a, b) => a.name.localeCompare(b.name)),
    [folders, currentFolderId]
  );

  const crumbs = useMemo(() => breadcrumb(currentFolderId, folders), [currentFolderId, folders]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFolderId) {
      toast({ title: "Open a folder first", type: "error" });
      return;
    }
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await createMediaFolder(name, currentFolderId);
      setNewFolderName("");
      setNewFolderOpen(false);
      await refreshFolders();
      toast({ title: "Folder created", type: "success" });
    } catch (err) {
      toast({
        title: "Could not create folder",
        description: err instanceof Error ? err.message : undefined,
        type: "error",
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !currentFolderId) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { storagePath, publicUrl, kind, mimeType, sizeBytes } = await uploadMediaFile(supabase, currentFolderId, file);
        await createMediaAsset({
          folder_id: currentFolderId,
          name: file.name,
          storage_path: storagePath,
          public_url: publicUrl,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          kind,
        });
      }
      const rows = await getMediaAssetsForFolder(currentFolderId);
      setAssets(rows);
      toast({ title: files.length > 1 ? "Files uploaded" : "File uploaded", type: "success" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Check Storage policies for bucket public-images",
        type: "error",
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteAsset = async (asset: MediaAssetRow) => {
    if (!confirm(`Delete “${asset.name}”?`)) return;
    try {
      await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
      await deleteMediaAsset(asset.id);
      if (currentFolderId) {
        const rows = await getMediaAssetsForFolder(currentFolderId);
        setAssets(rows);
      }
      toast({ title: "File removed", type: "success" });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : undefined,
        type: "error",
      });
    }
  };

  const handleDeleteFolder = async (folder: MediaFolderRow) => {
    if (!confirm(`Delete folder “${folder.name}” and everything inside?`)) return;
    try {
      const subtree = collectSubtreeFolderIds(folder.id, folders);
      const allAssets = await getMediaAssetsInFolders(subtree);
      const paths = allAssets.map((a) => a.storage_path);
      if (paths.length) {
        const { error: rmErr } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
        if (rmErr) throw rmErr;
      }
      const wasCurrent = folder.id === currentFolderId;
      const parentId = folder.parent_id;
      await deleteMediaFolder(folder.id);
      const nextFolders = await refreshFolders();
      if (wasCurrent) {
        const fallback = parentId ?? nextFolders.find((f) => f.parent_id === null)?.id ?? nextFolders[0]?.id ?? null;
        setCurrentFolderId(fallback);
      }
      toast({ title: "Folder removed", type: "success" });
    } catch (err) {
      toast({
        title: "Could not delete folder",
        description: err instanceof Error ? err.message : undefined,
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
            <Library className="text-[#D4AF37]" size={28} />
            Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organise uploads in folders. Copy public URLs into pages and blocks from the library picker.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewFolderOpen(true)}
            disabled={!currentFolderId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1f2937] text-white text-sm font-semibold hover:bg-[#263040] disabled:opacity-40 transition-colors"
          >
            <FolderPlus size={18} />
            New folder
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0B0F14] text-sm font-semibold cursor-pointer hover:bg-[#E5C354] transition-colors">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Upload
            <input
              type="file"
              multiple
              className="hidden"
              disabled={uploading || !currentFolderId}
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 text-sm text-gray-400 px-1">
        <button
          type="button"
          className="hover:text-[#D4AF37] font-medium"
          onClick={() => {
            const root = folders.find((f) => f.parent_id === null);
            if (root) setCurrentFolderId(root.id);
          }}
        >
          Library
        </button>
        {crumbs.map((c) => (
          <span key={c.id} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-600" />
            <button type="button" className="hover:text-[#D4AF37] font-medium" onClick={() => setCurrentFolderId(c.id)}>
              {c.name}
            </button>
          </span>
        ))}
      </div>

      {childFolders.length > 0 && (
        <div>
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Folders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {childFolders.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] hover:border-[#D4AF37]/30 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setCurrentFolderId(f.id)}
                  className="flex items-center gap-3 min-w-0 text-left"
                >
                  <Folder size={22} className="text-[#D4AF37] shrink-0" />
                  <span className="text-sm font-medium text-white truncate">{f.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFolder(f)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  aria-label={`Delete ${f.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Files</h2>
        {assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1f2937] py-16 text-center text-gray-500 text-sm">
            No files in this folder. Upload images, videos, or documents.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assets.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden flex flex-col"
              >
                <div className="aspect-video bg-black/40 flex items-center justify-center overflow-hidden">
                  {a.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.public_url} alt="" className="w-full h-full object-cover" />
                  ) : a.kind === "video" ? (
                    <Video size={40} className="text-gray-500" />
                  ) : (
                    <FileText size={40} className="text-gray-500" />
                  )}
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-start gap-2 min-w-0">
                    {a.kind === "image" ? (
                      <ImageIcon size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : a.kind === "video" ? (
                      <Video size={14} className="text-violet-400 shrink-0 mt-0.5" />
                    ) : (
                      <FileText size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs font-medium text-white truncate">{a.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">{formatBytes(a.size_bytes)}</p>
                  <input
                    readOnly
                    value={a.public_url}
                    className="w-full text-[10px] font-mono bg-[#0B0F14] border border-[#1f2937] rounded-lg px-2 py-1.5 text-gray-400"
                    onFocus={(e) => e.target.select()}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(a)}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {newFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-sm bg-[#111827] border border-[#1f2937] rounded-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white">New folder</h3>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-[#D4AF37]"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setNewFolderOpen(false);
                  setNewFolderName("");
                }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#0B0F14] text-sm font-semibold">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
