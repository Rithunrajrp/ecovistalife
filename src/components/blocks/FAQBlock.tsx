"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQBlock({ content }: { content: any }) {
  const items: { question: string; answer: string }[] = content.items || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {content.heading && (
          <h3 className="text-3xl md:text-5xl font-heading font-bold text-[#0F3D3E] mb-12 text-center">{content.heading}</h3>
        )}
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center p-6 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-[#0F3D3E] text-lg pr-4">{item.question}</span>
                <ChevronDown
                  size={22}
                  className={`text-[#D4AF37] shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
