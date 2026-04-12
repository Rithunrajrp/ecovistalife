import Image from "next/image";
import Link from "next/link";

export function HeroBlock({ content }: { content: any }) {
  return (
    <section className="relative h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {content.image && (
          <Image src={content.image} alt={content.title || ""} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F3D3E]/90 to-[#0F3D3E]/40" />
      </div>
      <div className="container relative z-10 mx-auto px-4 md:px-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-[1.1]">
            {content.title}
          </h1>
          {content.subtitle && (
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed">
              {content.subtitle}
            </p>
          )}
          {content.buttonText && content.buttonLink && (
            <Link
              href={content.buttonLink}
              className="inline-block px-8 py-4 bg-[#D4AF37] text-[#0F3D3E] font-bold rounded-lg hover:bg-[#E5C354] transition-all shadow-2xl hover:-translate-y-1 text-lg"
            >
              {content.buttonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
