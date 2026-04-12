-- Columns the visual builder inserts; without them PostgREST returns 400 on insert.
-- Safe to run multiple times.

ALTER TABLE blocks ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}';
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS animation_config JSONB NOT NULL DEFAULT '{}';
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS template_id UUID;
