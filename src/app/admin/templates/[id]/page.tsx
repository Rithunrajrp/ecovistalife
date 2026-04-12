"use client";
import { useParams } from "next/navigation";
import { VisualBuilder } from "@/components/admin/VisualBuilder";

export default function TemplateBuilderPage() {
  const params = useParams();
  const raw = params?.id;
  const templateId = Array.isArray(raw) ? raw[0] : raw;
  if (!templateId) return null;
  return <VisualBuilder entityId={templateId} entityType="template" />;
}
