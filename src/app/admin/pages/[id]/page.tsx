"use client";
import { useParams } from "next/navigation";
import { VisualBuilder } from "@/components/admin/VisualBuilder";

export default function PageBuilderPage() {
  const params = useParams();
  const raw = params?.id;
  const pageId = Array.isArray(raw) ? raw[0] : raw;
  if (!pageId) return null;
  return <VisualBuilder entityId={pageId} entityType="page" />;
}
