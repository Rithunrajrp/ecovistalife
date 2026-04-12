import Image from "next/image";

export function ImageTextBlock({ content }: { content: any }) {
  const imageLeft = content.imagePosition === "left";

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className={`flex flex-col ${imageLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center max-w-6xl mx-auto`}>
          {content.image && (
            <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image src={content.image} alt={content.heading || ""} fill className="object-cover" />
            </div>
          )}
          <div className="w-full md:w-1/2">
            {content.heading && (
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-[#0F3D3E] mb-6">{content.heading}</h3>
            )}
            {content.body && (
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{content.body}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
