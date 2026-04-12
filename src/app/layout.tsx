import type { Metadata } from "next";
import { headers } from "next/headers";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getPages } from "@/lib/cms";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoVistaLife - Premium Construction & Real Estate",
  description: "EcoVistaLife offers premium, sustainable, and luxurious real estate properties. Book a site visit today.",
};

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
  const navLinks = (pages || [])
    .filter((p) => p.is_published)
    .sort((a, b) => {
      if (a.slug === "home") return -1;
      if (b.slug === "home") return 1;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    })
    .map((p) => ({
      name: p.title,
      href: p.slug === "home" ? "/" : `/${p.slug}`,
    }));

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col pt-0">
        {!isApp && <Navbar links={navLinks} />}
        <main className="flex-grow">{children}</main>
        {!isApp && <FloatingWhatsApp />}
        {!isApp && <Footer pages={navLinks} />}
      </body>
    </html>
  );
}
