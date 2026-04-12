"use client";
import { useEffect, useRef } from "react";

export type AnimationType = "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scale" | "none";
export type AnimationTrigger = "scroll" | "load";

export interface AnimationConfig {
  type?: AnimationType;
  duration?: number;
  delay?: number;
  ease?: string;
  trigger?: AnimationTrigger;
}

export function useBlockAnimation(config: AnimationConfig) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config || config.type === "none" || !config.type) return;

    let gsapInstance: any = null;
    let ScrollTriggerInstance: any = null;
    let ctx: any = null;
    let tween: any = null;

    const animate = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      gsapInstance = gsap;
      ScrollTriggerInstance = ScrollTrigger;

      if (!ref.current) return;

      const duration = config.duration ?? 0.8;
      const delay = config.delay ?? 0;
      const ease = config.ease ?? "power2.out";

      const fromVars: Record<string, any> = { duration, delay, ease };

      switch (config.type) {
        case "fade":
          fromVars.opacity = 0;
          break;
        case "slideUp":
          fromVars.opacity = 0;
          fromVars.y = 60;
          break;
        case "slideDown":
          fromVars.opacity = 0;
          fromVars.y = -60;
          break;
        case "slideLeft":
          fromVars.opacity = 0;
          fromVars.x = 80;
          break;
        case "slideRight":
          fromVars.opacity = 0;
          fromVars.x = -80;
          break;
        case "scale":
          fromVars.opacity = 0;
          fromVars.scale = 0.85;
          break;
      }

      ctx = gsap.context(() => {
        if (config.trigger === "scroll") {
          fromVars.scrollTrigger = {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          };
        }
        tween = gsap.from(ref.current, fromVars);
      });
    };

    animate();

    return () => {
      ctx?.revert();
      tween?.kill();
      ScrollTriggerInstance?.getAll().forEach((t: any) => t.kill());
    };
  }, [config.type, config.duration, config.delay, config.ease, config.trigger]);

  return ref;
}

export const ANIMATION_TYPES: { value: AnimationType | "none"; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade In" },
  { value: "slideUp", label: "Slide Up" },
  { value: "slideDown", label: "Slide Down" },
  { value: "slideLeft", label: "Slide In Left" },
  { value: "slideRight", label: "Slide In Right" },
  { value: "scale", label: "Scale In" },
];

export const EASING_OPTIONS = [
  { value: "power1.out", label: "Smooth" },
  { value: "power2.out", label: "Ease Out" },
  { value: "power3.out", label: "Strong Out" },
  { value: "back.out(1.7)", label: "Bounce Back" },
  { value: "elastic.out(1, 0.3)", label: "Elastic" },
  { value: "linear", label: "Linear" },
];
