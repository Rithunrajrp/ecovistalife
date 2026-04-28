"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SplitTextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: React.ElementType;
}

export function SplitTextReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  as: Component = "span",
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!containerRef.current) return;

    // Split text into words for animation
    const words = containerRef.current.querySelectorAll(".word-wrapper");
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { y: "100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: duration,
          stagger: 0.05,
          ease: "power3.out",
          delay: delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [delay, duration]);

  const words = children.split(" ");

  return (
    <Component ref={containerRef} className={`${className} flex flex-wrap`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="overflow-hidden inline-flex mr-[0.25em]"
        >
          <span className="word-wrapper inline-block translate-y-full opacity-0">
            {word}
          </span>
        </span>
      ))}
    </Component>
  );
}
