"use client";

import { ParallaxImage } from "../ui/ParallaxImage";
import { SplitTextReveal } from "../ui/SplitTextReveal";
import { AnimatedBlock } from "./AnimatedBlock";

export function ImageTextBlock({ content }: { content: any }) {
  const imageLeft = content.imagePosition === "left";

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`flex flex-col ${content.image ? (imageLeft ? "md:flex-row" : "md:flex-row-reverse") : ""} gap-16 items-center max-w-7xl mx-auto`}>
          {content.image && (
            <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-2xl shadow-2xl">
              <ParallaxImage 
                src={content.image} 
                alt={content.heading || "Image"} 
                className="w-full h-full rounded-2xl"
                speed={0.15}
              />
            </div>
          )}
          <div className={`w-full ${content.image ? "md:w-1/2" : "max-w-4xl text-center"}`}>
            {content.heading && (
              <SplitTextReveal as="h3" className="text-4xl md:text-5xl font-heading font-bold text-[#0F3D3E] mb-8 leading-tight">
                {content.heading}
              </SplitTextReveal>
            )}
            {content.body && (
              <AnimatedBlock animation_config={{ type: "fade", delay: 0.3, duration: 1 }}>
                <div className="text-gray-600 text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
                  {content.body}
                </div>
              </AnimatedBlock>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
