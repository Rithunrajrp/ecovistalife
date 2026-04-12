"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Navbar({ links = [] }: { links?: { name: string; href: string }[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-4 md:py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="text-2xl font-heading font-bold text-[#0F3D3E] z-50">
          EcoVista<span className="text-[#D4AF37]">Life</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "font-medium hover:text-[#D4AF37] transition-colors",
                isScrolled ? "text-gray-800" : "text-white md:text-gray-800"
              )}
            >
              {link.name}
            </Link>
          ))}
          <Button variant="secondary" size="md">Book a Site Visit</Button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className={cn(
            "md:hidden z-50 transition-colors",
            isScrolled || isOpen ? "text-[#0F3D3E]" : "text-[#0F3D3E]" 
            // In a real app we might want white on dark hero, but we'll stick to primary for simplicity
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col pt-24 px-6 md:hidden z-40">
          <div className="flex flex-col gap-6 text-xl">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-gray-800 font-medium border-b border-gray-100 pb-4"
              >
                {link.name}
              </Link>
            ))}
            <Button variant="secondary" size="lg" className="mt-4">
              Book a Site Visit
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
