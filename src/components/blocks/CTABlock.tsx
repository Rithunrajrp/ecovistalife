import Link from "next/link";

export function CTABlock({ content }: { content: any }) {
  return (
    <section className="relative py-28 bg-[#0F3D3E] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D3E] to-transparent opacity-80"></div>
      <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
        {content.heading && (
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">{content.heading}</h2>
        )}
        {content.description && (
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">{content.description}</p>
        )}
        {content.buttonText && content.buttonLink && (
          <Link
            href={content.buttonLink}
            className="inline-block px-10 py-4 bg-[#D4AF37] text-[#0F3D3E] font-bold rounded-lg hover:bg-[#E5C354] transition-all shadow-2xl hover:-translate-y-1 text-lg"
          >
            {content.buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}
