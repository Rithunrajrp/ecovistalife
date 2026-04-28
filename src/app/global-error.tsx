"use client";

import { Maintenance } from "@/components/layout/Maintenance";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Maintenance onRetry={reset} />
      </body>
    </html>
  );
}
