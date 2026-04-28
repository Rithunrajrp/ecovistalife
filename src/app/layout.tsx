import type { Metadata } from "next";
import { headers } from "next/headers";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getPages } from "@/lib/cms";
import { buildRootMetadata } from "@/lib/seo";
import { SeoJsonLd } from "@/components/seo/SeoJsonLd";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = buildRootMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isAdmin = host.startsWith("admin.");
  const isPortal = host.startsWith("portal.");
  const isApp = isAdmin || isPortal; // Hide public layout for admin/portal

  // Fetch dynamic page routes for navigation
  const pages = await getPages();
  const PAGE_NAMES: Record<string, string> = {
    "home": "Home",
    "about-us": "About Us",
    "ecolife": "EcoLife",
    "blog": "Blog",
    "contact": "Contact"
  };
  const ALLOWED_NAV_SLUGS = Object.keys(PAGE_NAMES);
  
  const navLinks = (pages || [])
    .filter((p) => p.is_published && ALLOWED_NAV_SLUGS.includes(p.slug))
    .sort((a, b) => {
      return ALLOWED_NAV_SLUGS.indexOf(a.slug) - ALLOWED_NAV_SLUGS.indexOf(b.slug);
    })
    .map((p) => ({
      name: PAGE_NAMES[p.slug],
      href: p.slug === "home" ? "/" : `/${p.slug}`,
    }));

  // Also include Projects in the nav manually since they are handled separately
  navLinks.splice(2, 0, { name: "Projects", href: "/projects" });

  return (
    <html
      lang="en-IN"
      className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-0">
        {!isApp ? (
          <SmoothScrollProvider>
            <SeoJsonLd />
            <Navbar links={navLinks} />
            <main className="flex-grow">{children}</main>
            <FloatingWhatsApp />
            <Footer pages={navLinks} />
          </SmoothScrollProvider>
        ) : (
          <main className="flex-grow">{children}</main>
        )}
      </body>
    </html>
  );
}
