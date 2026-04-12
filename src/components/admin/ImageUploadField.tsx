"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  bucket?: string;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Image",
  placeholder = "https://example.com/image.jpg",
  bucket = "public-images",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `cms/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err?.message || "Upload failed. Check your storage bucket.");
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (files: FileList | null) => {
    if (files && files[0]) upload(files[0]);
  };

  const inputClass =
    "w-full bg-[#0B0F14] border border-[#1f2937] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] text-xs transition-all";
  const labelClass =
    "block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-2">
      {label && <label className={labelClass}>{label}</label>}

      {/* Preview */}
      {value && (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-[#1f2937] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all font-semibold"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs bg-red-500/40 hover:bg-red-500/60 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all font-semibold"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Drop zone / Upload button — only shown when no image */}
      {!value && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragging
              ? "border-[#D4AF37] bg-[#D4AF37]/5"
              : "border-[#1f2937] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5"
          }`}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-[#D4AF37]" />
          ) : (
            <>
              <Upload size={18} className="text-gray-500 mb-1.5" />
              <span className="text-[10px] text-gray-500 font-semibold">
                Drop image or click to upload
              </span>
              <span className="text-[9px] text-gray-600 mt-0.5">
                PNG, JPG, WEBP · max 10 MB
              </span>
            </>
          )}
        </div>
      )}

      {/* URL input — always visible so user can paste a URL directly */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass + " flex-1"}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 bg-[#1f2937] hover:bg-[#263040] text-gray-300 hover:text-white px-3 py-2 rounded-lg text-[10px] font-bold tracking-wide transition-all disabled:opacity-50 shrink-0"
        >
          {uploading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Upload size={11} />
          )}
          Upload
        </button>
      </div>

      {error && (
        <p className="text-[10px] text-red-400 font-medium">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}
