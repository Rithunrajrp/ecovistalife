import { HeroBlock } from "./HeroBlock";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ImageTextBlock } from "./ImageTextBlock";
import { GalleryBlock } from "./GalleryBlock";
import { CTABlock } from "./CTABlock";
import { FAQBlock } from "./FAQBlock";
import { FormBlock } from "./FormBlock";
import { ProjectsGridBlock } from "./ProjectsGridBlock";
import { BlogsGridBlock } from "./BlogsGridBlock";
import { ContactInfoBlock } from "./ContactInfoBlock";
import { AnimatedBlock } from "./AnimatedBlock";
import { SlideshowBlock } from "./SlideshowBlock";
import { CompositionBlock } from "./CompositionBlock";

/** Not rendered inside page body (footer is global; others removed from product). */
const SKIP_PAGE_BLOCK_TYPES = new Set(["footer", "custom_html", "global_block"]);

const BLOCK_MAP: Record<string, React.ComponentType<{ content: any }>> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  image_text: ImageTextBlock,
  gallery: GalleryBlock,
  cta: CTABlock,
  faq: FAQBlock,
  form: FormBlock,
  projects_grid: ProjectsGridBlock,
  blogs_grid: BlogsGridBlock,
  contact_info: ContactInfoBlock,
  slideshow: SlideshowBlock,
  composition: CompositionBlock,
};

export function BlockRenderer({ blocks }: { blocks: any[] }) {
  const visible = blocks.filter((b) => !SKIP_PAGE_BLOCK_TYPES.has(b.type));
  return (
    <>
      {visible.map((block) => {
        const Component = BLOCK_MAP[block.type];
        if (!Component) {
          return (
            <div key={block.id} className="py-8 text-center text-gray-400 bg-gray-100">
              Unknown block type: {block.type}
            </div>
          );
        }
        return (
          <AnimatedBlock key={block.id} animation_config={block.animation_config}>
            <Component content={block.content} />
          </AnimatedBlock>
        );
      })}
    </>
  );
}
