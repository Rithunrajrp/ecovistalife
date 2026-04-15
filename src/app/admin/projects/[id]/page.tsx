"use client";
import { useParams } from "next/navigation";
import { VisualBuilder } from "@/components/admin/VisualBuilder";

export default function AdminProjectBuilder() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!projectId) {
    return <div className="p-10 text-white">Invalid Project ID</div>;
  }

  return <VisualBuilder entityId={projectId} entityType="project" />;
}
