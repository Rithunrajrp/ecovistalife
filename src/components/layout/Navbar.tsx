"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Navbar({ links = [] }: { links?: { name: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="z-50 shrink-0 flex items-center gap-2">
          {!logoError ? (
            <img 
              src="/logo.png" 
              alt="EcoVistaLife Logo" 
              className="h-10 md:h-12 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-2xl md:text-3xl font-heading font-bold text-[#0F3D3E] tracking-tight">
              EcoVista<span className="text-[#D4AF37]">Life</span>
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 xl:gap-10">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm xl:text-base font-semibold text-gray-700 hover:text-[#D4AF37] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link href="/book-visit">
            <Button variant="secondary" size="md" className="font-semibold px-6 shadow-sm hover:shadow-md transition-shadow">
              Book a Site Visit
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden z-50 text-[#0F3D3E] p-1 focus:outline-none"
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
            <Link href="/book-visit" onClick={() => setIsOpen(false)}>
              <Button variant="secondary" size="lg" className="mt-4">
                Book a Site Visit
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
