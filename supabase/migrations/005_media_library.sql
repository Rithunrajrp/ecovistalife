-- CMS media library: folders + assets (Supabase Storage paths in public-images bucket under media/)

CREATE TABLE IF NOT EXISTS media_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_id);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID NOT NULL REFERENCES media_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'video', 'document')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_created ON media_assets(created_at DESC);

ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_folders_authenticated" ON media_folders;
CREATE POLICY "media_folders_authenticated" ON media_folders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "media_assets_authenticated" ON media_assets;
CREATE POLICY "media_assets_authenticated" ON media_assets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Default root folder for first-time use (id stable for optional app references)
INSERT INTO media_folders (id, parent_id, name)
SELECT 'a0000000-0000-0000-0000-000000000001'::uuid, NULL, 'Library'
WHERE NOT EXISTS (SELECT 1 FROM media_folders WHERE id = 'a0000000-0000-0000-0000-000000000001');

-- Storage: ensure bucket "public-images" allows uploads under media/ (configure in Dashboard if uploads fail)
