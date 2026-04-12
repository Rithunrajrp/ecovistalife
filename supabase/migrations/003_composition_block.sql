-- Composable "composition" block: multiple inner sections (text, image, form, etc.)

ALTER TABLE library_blocks DROP CONSTRAINT IF EXISTS library_blocks_type_check;
ALTER TABLE library_blocks ADD CONSTRAINT library_blocks_type_check CHECK (
  type IN (
    'composition',
    'hero',
    'text',
    'image',
    'image_text',
    'gallery',
    'cta',
    'faq',
    'form',
    'projects_grid',
    'blogs_grid',
    'contact_info',
    'slideshow'
  )
);

-- CMS page blocks: union of init + prior migrations + composition (fails if a row has another type)
ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_type_check;
ALTER TABLE blocks ADD CONSTRAINT blocks_type_check CHECK (
  type IN (
    'composition',
    'hero',
    'text',
    'image',
    'image_text',
    'gallery',
    'cta',
    'faq',
    'form',
    'features',
    'testimonials',
    'stats',
    'team',
    'contact_info',
    'projects_grid',
    'blogs_grid',
    'slideshow',
    'footer',
    'global_block',
    'custom_html'
  )
);
