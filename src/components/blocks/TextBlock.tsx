export function TextBlock({ content }: { content: any }) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {content.subheading && (
            <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider mb-2">{content.subheading}</h2>
          )}
          {content.heading && (
            <h3 className="text-3xl md:text-5xl font-heading font-bold text-[#0F3D3E] mb-6">{content.heading}</h3>
          )}
          {content.body && (
            <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{content.body}</p>
          )}
        </div>
      </div>
    </section>
  );
}
