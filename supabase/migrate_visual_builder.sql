-- ============================================
-- Visual Builder Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to existing blocks table (non-breaking)
ALTER TABLE blocks
  ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS animation_config JSONB NOT NULL DEFAULT '{}';

-- Add 'slideshow' to the allowed block types check constraint.
-- We must drop and recreate the constraint because ALTER CONSTRAINT
-- cannot change the expression in PostgreSQL.
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
    'slideshow'
  )
);
