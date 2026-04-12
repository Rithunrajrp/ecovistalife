import Image from "next/image";

export function GalleryBlock({ content }: { content: any }) {
  const images: string[] = content.images || [];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        {content.heading && (
          <h3 className="text-3xl md:text-5xl font-heading font-bold text-[#0F3D3E] mb-12 text-center">{content.heading}</h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <Image src={img} alt={`Gallery image ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
