"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitTextReveal } from "../ui/SplitTextReveal";
import { MagneticButton } from "../ui/MagneticButton";

export function HeroBlock({ content }: { content: any }) {
  const containerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // We create a unified timeline for the initial load
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Subtle scale-down effect for the hero image
    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { scale: 1.15 },
        { scale: 1, duration: 2, ease: "power2.out" },
        0
      );
    }

    // Subtitle fade in
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        0.8 // Start slightly after text reveal starts
      );
    }

    // Button fade in
    if (buttonWrapperRef.current) {
      tl.fromTo(
        buttonWrapperRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1 },
        1.0
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {content.image && (
          <Image 
            ref={imageRef}
            src={content.image} 
            alt={content.title || ""} 
            fill 
            className="object-cover" 
            priority 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F3D3E]/90 to-[#0F3D3E]/40" />
      </div>
      <div className="container relative z-10 mx-auto px-4 md:px-8 text-white">
        <div className="max-w-3xl">
          <SplitTextReveal as="h1" delay={0.2} duration={1.2} className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-[1.1]">
            {content.title}
          </SplitTextReveal>
          
          {content.subtitle && (
            <p ref={subtitleRef} className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed opacity-0">
              {content.subtitle}
            </p>
          )}
          
          {content.buttonText && content.buttonLink && (
            <div ref={buttonWrapperRef} className="opacity-0">
              <Link href={content.buttonLink}>
                <MagneticButton className="px-8 py-4 bg-[#D4AF37] text-[#0F3D3E] font-bold rounded-lg hover:bg-[#E5C354] transition-colors shadow-2xl text-lg">
                  {content.buttonText}
                </MagneticButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
