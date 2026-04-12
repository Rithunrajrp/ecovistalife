import { HeroBlock } from "./HeroBlock";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ImageTextBlock } from "./ImageTextBlock";
import { GalleryBlock } from "./GalleryBlock";
import { CTABlock } from "./CTABlock";
import { FAQBlock } from "./FAQBlock";
import { FormBlock } from "./FormBlock";
import { SlideshowBlock } from "./SlideshowBlock";
import { FooterBlock } from "./FooterBlock";
import { CompositionBlock } from "./CompositionBlock";

// Mock renderers for async Server Components to prevent "async Client Component" errors
function MockProjectsGridBlock({ content }: { content: any }) {
  const heading = content.heading || "Our Portfolio";
  return (
    <div className="py-24 bg-gray-50 flex items-center justify-center flex-col gap-4 border-2 border-dashed border-amber-300">
      <h2 className="text-3xl font-heading font-bold text-[#0F3D3E]">{heading}</h2>
      <p className="text-gray-500 font-mono text-sm">[Projects Grid Placeholder: Rendered on Public Site]</p>
    </div>
  );
}

function MockBlogsGridBlock({ content }: { content: any }) {
  const heading = content.heading || "Insights & News";
  return (
    <div className="py-24 bg-white flex items-center justify-center flex-col gap-4 border-2 border-dashed border-blue-300">
      <h2 className="text-3xl font-heading font-bold text-[#0F3D3E]">{heading}</h2>
      <p className="text-gray-500 font-mono text-sm">[Blogs Grid Placeholder: Rendered on Public Site]</p>
    </div>
  );
}

function MockContactInfoBlock({ content }: { content: any }) {
  const heading = content.heading || "Get in Touch";
  return (
    <div className="w-full border-2 border-dashed border-emerald-300 p-8 rounded-2xl flex flex-col items-center justify-center bg-gray-50">
      <h2 className="text-3xl font-heading font-bold text-[#0F3D3E]">{heading}</h2>
      <p className="text-gray-500 font-mono text-sm">[Contact Info Placeholder: Rendered on Public Site]</p>
    </div>
  );
}

const ADMIN_BLOCK_MAP: Record<string, React.ComponentType<{ content: any }>> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  image_text: ImageTextBlock,
  gallery: GalleryBlock,
  cta: CTABlock,
  faq: FAQBlock,
  form: FormBlock,
  projects_grid: MockProjectsGridBlock,
  blogs_grid: MockBlogsGridBlock,
  contact_info: MockContactInfoBlock,
  slideshow: SlideshowBlock,
  footer: FooterBlock,
  composition: CompositionBlock,
};

export function AdminBlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <>
      {blocks.map((block) => {
        const Component = ADMIN_BLOCK_MAP[block.type];
        if (!Component) {
          return (
            <div key={block.id} className="py-8 text-center text-gray-400 bg-gray-100">
              Unknown block type: {block.type}
            </div>
          );
        }
        const inner =
          block.type === "composition" ? (
            <div className="pointer-events-none select-none">
              <Component content={block.content} />
            </div>
          ) : (
            <Component content={block.content} />
          );
        return <div key={block.id}>{inner}</div>;
      })}
    </>
  );
}
