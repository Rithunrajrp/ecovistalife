import Image from "next/image";

export function ImageBlock({ content }: { content: any }) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {content.heading && (
            <h3 className="text-3xl font-heading font-bold text-[#0F3D3E] mb-8 text-center">{content.heading}</h3>
          )}
          {content.image && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xl">
              <Image src={content.image} alt={content.caption || content.heading || ""} fill className="object-cover" />
            </div>
          )}
          {content.caption && (
            <p className="text-center text-gray-500 mt-4 text-sm">{content.caption}</p>
          )}
        </div>
      </div>
    </section>
  );
}
