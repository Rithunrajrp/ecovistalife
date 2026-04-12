import Link from "next/link";
import { ReactNode } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface FooterColumn {
  title: string;
  links: { name: string; url: string }[];
}

export function FooterBlock({
  content,
  settings,
  navPages,
}: {
  content: any;
  settings?: any;
  /** When set (e.g. from CMS pages), replaces any "Quick Links" column with live nav. */
  navPages?: { name: string; href: string }[];
}) {
  const c = content || {};
  const s = settings || {};

  const brandName = c.brandName || "EcoVistaLife";
  const tagline = c.tagline || "Premium, sustainable, and luxurious real estate properties designed for the modern lifestyle.";
  const address = c.address || "123 Eco Blvd, Mumbai, Maharashtra, India 400001";
  const phone = c.phone || "+91 98765 43210";
  const email = c.email || "info@ecovistalife.in";

  const defaultColumns: FooterColumn[] = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", url: "/" },
        { name: "About Us", url: "/about" },
        { name: "Projects", url: "/projects" },
        { name: "Contact", url: "/contact" },
      ],
    },
  ];

  const rawColumns: FooterColumn[] = c.columns?.length ? c.columns : defaultColumns;

  const columns: FooterColumn[] =
    navPages && navPages.length > 0
      ? [
          {
            title: "Quick Links",
            links: navPages.map((p) => ({ name: p.name, url: p.href })),
          },
          ...rawColumns.filter((col) => col.title !== "Quick Links"),
        ]
      : rawColumns;

  const socialLinks = c.socialLinks || {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
    twitter: "#"
  };

  const bgColor = s.bgColor || "bg-[#0F3D3E]";
  const textColor = s.textColor || "text-white";

  return (
    <footer className={twMerge("pt-16 pb-8", s.padding || "py-16")} style={{ backgroundColor: s.bgColor, color: s.textColor }}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Brand & Info */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="text-3xl font-heading font-bold block" style={{ color: s.textColor || "white" }}>
              {brandName.replace("Life", "")}
              {brandName.includes("Life") && <span className="text-[#D4AF37]">Life</span>}
            </Link>
            <p className="text-sm leading-relaxed opacity-80 max-w-sm">
              {tagline}
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.facebook && socialLinks.facebook !== '#' && (
                <a href={socialLinks.facebook} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
                </a>
              )}
              {socialLinks.instagram && socialLinks.instagram !== '#' && (
                <a href={socialLinks.instagram} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {socialLinks.linkedin && socialLinks.linkedin !== '#' && (
                <a href={socialLinks.linkedin} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              )}
              {socialLinks.twitter && socialLinks.twitter !== '#' && (
                <a href={socialLinks.twitter} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Columns */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
             {columns.map((col, idx) => (
                <div key={idx}>
                  <h4 className="text-lg font-heading font-semibold mb-6 text-[#D4AF37]">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((link, lIdx) => (
                      <li key={lIdx}>
                        <Link href={link.url} className="opacity-80 hover:opacity-100 transition-opacity text-sm">{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
             ))}
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-lg font-heading font-semibold mb-6 text-[#D4AF37]">Contact Info</h4>
            <ul className="space-y-4">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="text-[#D4AF37] shrink-0 mt-1" size={20} />
                  <span className="opacity-80 text-sm">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="text-[#D4AF37] shrink-0" size={20} />
                  <span className="opacity-80 text-sm">{phone}</span>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="text-[#D4AF37] shrink-0" size={20} />
                  <span className="opacity-80 text-sm">{email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm flex flex-col md:flex-row justify-between items-center gap-4 opacity-70">
          <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
