import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/dal";
import { PortalLayoutClient } from "./PortalLayoutClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers();

  // The middleware stamps 'x-is-public-route: 1' for /login and /accept-invite.
  // If we are on a public route, skip the auth check entirely — running getSession()
  // here would cause an infinite redirect loop because this layout wraps /portal/login
  // in the Next.js App Router file tree.
  const isPublicRoute = headersList.get("x-is-public-route") === "1";
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Get session (returns null if not authenticated)
  const session = await getSession();

  // Safety net: middleware should have redirected unauthenticated users already,
  // but guard here too for direct /portal/* navigations.
  if (!session) {
    redirect("/login");
  }

  return (
    <PortalLayoutClient user={session.portalUser}>
      {children}
    </PortalLayoutClient>
  );
}

