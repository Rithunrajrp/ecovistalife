"use client";
import { useBlockAnimation, AnimationConfig } from "@/lib/animations";

interface AnimatedBlockProps {
  animation_config?: AnimationConfig;
  children: React.ReactNode;
}

export function AnimatedBlock({ animation_config, children }: AnimatedBlockProps) {
  const ref = useBlockAnimation(animation_config || {});
  return <div ref={ref}>{children}</div>;
}
