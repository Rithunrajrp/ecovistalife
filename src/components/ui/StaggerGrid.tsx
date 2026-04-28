"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function StaggerGrid({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const items = containerRef.current.children;
    if (items.length === 0) return;

    // We make them hidden initially
    gsap.set(items, { y: 50, opacity: 0 });

    ScrollTrigger.batch(items, {
      start: "top 85%",
      onEnter: (elements) => {
        gsap.to(elements, {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          overwrite: true
        });
      },
      once: true
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === items[0] || t.targets().includes(items[0])) t.kill();
      });
    };
  }, [children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
