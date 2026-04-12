"use client";

import Link from "next/link";
import type { CompositionInnerBlock } from "@/lib/composition";
import { FormBlock } from "./FormBlock";

function Inner({ block }: { block: CompositionInnerBlock }) {
  const p = block.props || {};
  switch (block.type) {
    case "heading": {
      const text = (p.text as string) || "";
      const level = (p.level as string) || "h2";
      const className = "font-heading font-bold text-[#0F3D3E] " + (level === "h3" ? "text-2xl" : level === "h4" ? "text-xl" : "text-3xl md:text-4xl");
      if (level === "h3") return <h3 className={className}>{text}</h3>;
      if (level === "h4") return <h4 className={className}>{text}</h4>;
      return <h2 className={className}>{text}</h2>;
    }
    case "paragraph":
      return (
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {(p.text as string) || ""}
        </div>
      );
    case "image": {
      const url = (p.url as string) || "";
      const alt = (p.alt as string) || "";
      const caption = (p.caption as string) || "";
      if (!url) return null;
      return (
        <figure className="space-y-2">
          <div className="relative w-full rounded-xl overflow-hidden aspect-[16/10] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element -- composition allows any image URL */}
            <img src={url} alt={alt || ""} className="w-full h-full object-cover" />
          </div>
          {caption ? <figcaption className="text-sm text-gray-500 text-center">{caption}</figcaption> : null}
        </figure>
      );
    }
    case "button": {
      const label = (p.label as string) || "Button";
      const href = (p.href as string) || "/";
      const variant = (p.variant as string) || "primary";
      const cls =
        variant === "outline"
          ? "inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-[#0F3D3E] text-[#0F3D3E] font-semibold hover:bg-[#0F3D3E]/5 transition-colors"
          : "inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0B0F14] font-bold hover:bg-[#E5C354] transition-colors";
      return (
        <Link href={href} className={cls}>
          {label}
        </Link>
      );
    }
    case "spacer":
      return <div style={{ height: Math.max(8, Number(p.height) || 24) }} aria-hidden />;
    case "divider":
      return <hr className="border-0 border-t border-gray-200" />;
    case "form": {
      const formId = (p.formId as string) || "";
      if (!formId) {
        return (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center text-amber-800 text-sm">
            Select a form in the block editor.
          </div>
        );
      }
      return (
        <FormBlock
          embedded
          content={{
            formId,
            heading: (p.heading as string) || undefined,
            buttonText: (p.buttonText as string) || "Submit",
          }}
        />
      );
    }
    default:
      return null;
  }
}

export function CompositionBlock({ content }: { content: any }) {
  const items: CompositionInnerBlock[] = Array.isArray(content?.items) ? content.items : [];
  if (items.length === 0) {
    return (
      <section className="py-12 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-sm">
        Empty composition — add sections in the editor.
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-8">
        {items.map((block) => (
          <div key={block.id}>
            <Inner block={block} />
          </div>
        ))}
      </div>
    </section>
  );
}
