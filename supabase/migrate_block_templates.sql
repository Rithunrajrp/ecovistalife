-- ============================================
-- Reusable Linked Blocks Migration
-- ============================================

CREATE TABLE IF NOT EXISTS block_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- We reuse the existing blocks table to actually hold the structure of these templates
-- This allows templates to be built visually using existing blocks.
ALTER TABLE blocks 
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES block_templates(id) ON DELETE CASCADE;

-- A block can belong to a page OR a template, so page_id must not be strictly required.
ALTER TABLE blocks 
  ALTER COLUMN page_id DROP NOT NULL;

-- We need a constraint to ensure it belongs to one or the other
ALTER TABLE blocks 
  DROP CONSTRAINT IF EXISTS block_parent_check;
  
ALTER TABLE blocks
  ADD CONSTRAINT block_parent_check 
  CHECK (
    (page_id IS NOT NULL AND template_id IS NULL) OR 
    (page_id IS NULL AND template_id IS NOT NULL)
  );

-- Introduce a new block type that acts as a "pointer" to a template
ALTER TABLE blocks DROP CONSTRAINT IF EXISTS blocks_type_check;

ALTER TABLE blocks ADD CONSTRAINT blocks_type_check CHECK (
  type IN (
    'hero',
    'text',
    'image',
    'gallery',
    'cta',
    'features',
    'testimonials',
    'stats',
    'team',
    'contact_info',
    'projects_grid',
    'blogs_grid',
    'slideshow',
    'footer',
    'global_block', -- This block just points to a template_id in its content
    'custom_html'   -- Allows users to build UI logic with tags without needing server code
  )
);
