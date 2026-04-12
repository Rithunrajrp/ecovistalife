"use client";

import { useParams } from "next/navigation";
import { LibraryBlockEditor } from "@/components/admin/LibraryBlockEditor";

export default function LibraryBlockEditPage() {
  const params = useParams();
  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) return null;
  return <LibraryBlockEditor id={id} />;
}
