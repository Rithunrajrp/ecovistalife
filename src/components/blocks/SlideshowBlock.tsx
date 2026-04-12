"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export interface SlideItem {
  image: string;
  text?: string;
  subtext?: string;
}

export interface SlideshowContent {
  slides: SlideItem[];
  globalText?: string;
  globalSubtext?: string;
  timer?: number; // seconds between slides
  transition?: "fade" | "slide";
  height?: "small" | "medium" | "large" | "full";
  overlayOpacity?: number; // 0–100
}

const HEIGHT_MAP = {
  small: "h-[40vh]",
  medium: "h-[60vh]",
  large: "h-[80vh]",
  full: "h-screen",
};

export function SlideshowBlock({ content }: { content: SlideshowContent }) {
  const slides: SlideItem[] = content.slides || [];
  const timer = (content.timer ?? 5) * 1000;
  const transition = content.transition ?? "fade";
  const height = HEIGHT_MAP[content.height ?? "large"];
  const opacity = (content.overlayOpacity ?? 40) / 100;

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (animating || slides.length <= 1) return;
      setPrev(current);
      setAnimating(true);
      setCurrent(next);
      setTimeout(() => {
        setPrev(null);
        setAnimating(false);
      }, 700);
    },
    [animating, current, slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, timer);
    return () => clearInterval(interval);
  }, [current, goTo, timer, slides.length]);

  if (slides.length === 0) {
    return (
      <section className={`${height} bg-gray-200 flex items-center justify-center text-gray-500`}>
        No slides added yet
      </section>
    );
  }

  const activeSlide = slides[current];
  const displayText = activeSlide.text || content.globalText || "";
  const displaySubtext = activeSlide.subtext || content.globalSubtext || "";

  return (
    <section className={`relative ${height} overflow-hidden bg-black`}>
      {/* Slides */}
      {slides.map((slide, i) => {
        const isActive = i === current;
        const isPrev = i === prev;

        let slideClass = "absolute inset-0 transition-all duration-700 ";
        if (transition === "fade") {
          slideClass += isActive ? "opacity-100 z-10" : isPrev ? "opacity-0 z-10" : "opacity-0 z-0";
        } else {
          // slide left
          slideClass += isActive
            ? "translate-x-0 z-10"
            : isPrev
            ? "-translate-x-full z-10"
            : i > current
            ? "translate-x-full z-0"
            : "-translate-x-full z-0";
        }

        return (
          <div key={i} className={slideClass}>
            {slide.image && (
              <Image
                src={slide.image}
                alt={slide.text || `Slide ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            )}
            {/* Dark overlay */}
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity }}
            />
          </div>
        );
      })}

      {/* Text overlay */}
      {(displayText || displaySubtext) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 md:px-12">
          <div className="max-w-4xl">
            {displayText && (
              <h2
                key={displayText}
                className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                {displayText}
              </h2>
            )}
            {displaySubtext && (
              <p
                key={displaySubtext}
                className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
              >
                {displaySubtext}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dot navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-[#D4AF37] w-8 h-2.5"
                  : "bg-white/40 hover:bg-white/70 w-2.5 h-2.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* Arrow navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            onClick={() => goTo((current + 1) % slides.length)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}
    </section>
  );
}
