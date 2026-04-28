"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number; // lower number = more subtle parallax. Default 0.2
}

export function ParallaxImage({ src, alt, className = "", speed = 0.2 }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current || !imageRef.current) return;

    // Entrance animation: reveal mask
    const ctx = gsap.context(() => {
      // Parallax effect
      gsap.fromTo(
        imageRef.current,
        {
          yPercent: -15 * speed,
        },
        {
          yPercent: 15 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom", // when top of container hits bottom of viewport
            end: "bottom top", // when bottom of container hits top of viewport
            scrub: true,
          },
        }
      );
      
      // Mask reveal entrance
      gsap.fromTo(
        containerRef.current,
        {
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", // hidden at bottom
        },
        {
          clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)", // revealed
          duration: 1.5,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* We make the image slightly taller than container so it can parallax up and down */}
      <div className="absolute inset-[-10%] w-[120%] h-[120%]">
        <Image
          ref={imageRef}
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
