import type { SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "public-images";
export const MEDIA_STORAGE_PREFIX = "media";

export type MediaKind = "image" | "video" | "document";

export function classifyMediaKind(mime: string): MediaKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-()+ ]/g, "_").replace(/\s+/g, " ").trim() || "file";
}

/** All folder ids in the subtree rooted at `rootId` (including `rootId`). */
export function collectSubtreeFolderIds(
  rootId: string,
  folders: { id: string; parent_id: string | null }[]
): string[] {
  const ids = new Set<string>();
  const walk = (id: string) => {
    ids.add(id);
    for (const f of folders) {
      if (f.parent_id === id) walk(f.id);
    }
  };
  walk(rootId);
  return [...ids];
}

export async function uploadMediaFile(
  supabase: SupabaseClient,
  folderId: string,
  file: File
): Promise<{ storagePath: string; publicUrl: string; kind: MediaKind; mimeType: string; sizeBytes: number }> {
  const kind = classifyMediaKind(file.type || "application/octet-stream");
  const safe = sanitizeFileName(file.name);
  const unique = `${crypto.randomUUID()}_${safe}`;
  const storagePath = `${MEDIA_STORAGE_PREFIX}/${folderId}/${unique}`;

  const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  return {
    storagePath,
    publicUrl: data.publicUrl,
    kind,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  };
}
