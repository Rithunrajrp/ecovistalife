"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, FileText, MessageSquare, Settings, LogOut, Loader2, Menu, X, HelpCircle, Layers, ClipboardList, Blocks } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Toaster } from "@/components/ui/Toaster";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const pathParts = pathname?.split("/").filter(Boolean) ?? [];
  const isPageBuilder =
    pathname?.startsWith("/admin/pages/") &&
    pathParts.length >= 3 &&
    pathParts[2] !== undefined;
  const isSiteFooterEditor = pathname === "/admin/blocks/footer";
  const isLibraryBlockEditor =
    pathname?.startsWith("/admin/blocks/library/") &&
    pathParts.length === 4 &&
    pathParts[3] !== "new";
  const isFullscreenEditor = isPageBuilder || isSiteFooterEditor || isLibraryBlockEditor;

  const isLoginPage = pathname === "/admin/login" || pathname === "/login";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const loginUrl = window.location.hostname.startsWith('admin.') ? '/login' : '/admin/login';
      const homeUrl = window.location.hostname.startsWith('admin.') ? '/' : '/admin';

      if (!session && !isLoginPage) {
        router.push(loginUrl);
      } else if (session && isLoginPage) {
        router.push(homeUrl);
      } else {
        setIsAuthenticated(!!session);
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const loginUrl = window.location.hostname.startsWith('admin.') ? '/login' : '/admin/login';
      const homeUrl = window.location.hostname.startsWith('admin.') ? '/' : '/admin';

      if (event === "SIGNED_OUT") {
        router.push(loginUrl);
      } else if (event === "SIGNED_IN" && isLoginPage) {
        router.push(homeUrl);
      }
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, isLoginPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F14] relative z-40">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
      </div>
    );
  }

  // If on login page, don't show sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#0B0F14] flex flex-col text-white relative z-40">{children}<Toaster /></div>;
  }

  // Require auth to view children otherwise
  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Blocks", href: "/admin/blocks", icon: Blocks },
    { name: "Pages", href: "/admin/pages", icon: Layers },
    { name: "Forms", href: "/admin/forms", icon: ClipboardList },
    { name: "Projects", href: "/admin/projects", icon: FolderKanban },
    { name: "Blogs", href: "/admin/blogs", icon: FileText },
    { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#0B0F14] text-white relative z-40">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <h2 className="text-xl font-heading font-bold text-white">EcoVista<span className="text-[#D4AF37]">Admin</span></h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white">
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      {!isFullscreenEditor && (
        <aside className={`
          w-56 bg-[#111827] text-white fixed h-screen left-0 overflow-y-auto flex-col z-50 border-r border-[#1f2937] transition-transform duration-300
          ${mobileMenuOpen ? "translate-y-16" : "-translate-y-[150%] md:translate-y-0"}
          md:translate-x-0 md:flex
        `}>
        <div className="p-6 border-b border-[#1f2937] hidden md:block">
           <h2 className="text-2xl font-heading font-bold text-white">EcoVista<span className="text-[#D4AF37]">Admin</span></h2>
        </div>
        <nav className="flex-1 py-8 px-4 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Menu</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                }`}
              >
                <Icon size={20} className={isActive ? "text-[#D4AF37]" : "text-gray-500"} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#1f2937] bg-[#0c121e]">
          <button
            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
            className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-xl text-gray-400 border border-gray-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all duration-200 shadow-sm"
          >
            <LogOut size={18} />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${isFullscreenEditor ? "" : "md:ml-56 p-4 md:p-6"} ${isFullscreenEditor ? "" : "pt-20 md:pt-6"} bg-[#0B0F14] min-h-screen flex flex-col`}>
        <div className="w-full">
          {children}
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}
