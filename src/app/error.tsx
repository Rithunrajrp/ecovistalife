"use client";

import { Maintenance } from "@/components/layout/Maintenance";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <Maintenance onRetry={reset} />;
}
