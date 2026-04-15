-- Ensure block_templates exists
CREATE TABLE IF NOT EXISTS block_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist on blocks
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES block_templates(id) ON DELETE CASCADE;
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Remove the strict page_id requirement
ALTER TABLE blocks ALTER COLUMN page_id DROP NOT NULL;

-- Re-create the constraint securely tracking all 3 block types
ALTER TABLE blocks DROP CONSTRAINT IF EXISTS block_parent_check;

ALTER TABLE blocks ADD CONSTRAINT block_parent_check CHECK (
  (page_id IS NOT NULL AND template_id IS NULL AND project_id IS NULL) OR 
  (page_id IS NULL AND template_id IS NOT NULL AND project_id IS NULL) OR 
  (page_id IS NULL AND template_id IS NULL AND project_id IS NOT NULL)
);

-- Introduce the new pointer and composition block types to the ENUM or CHECK if needed.
-- Make sure the constraint allows composition and project specific blocks
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
    'composition',
    'image_text',
    'form',
    'global_block', 
    'custom_html'   
  )
);
