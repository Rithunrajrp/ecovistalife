-- Site footer (singleton) + reusable library blocks for admin "Blocks" section

CREATE TABLE IF NOT EXISTS site_footer (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_footer_singleton CHECK (id = 1)
);

INSERT INTO site_footer (id, content, settings)
VALUES (
  1,
  '{
    "brandName": "EcoVistaLife",
    "tagline": "Premium, sustainable, and luxurious real estate properties designed for the modern lifestyle.",
    "address": "123 Eco Blvd, Green Tech Park, Mumbai, Maharashtra 400001, India",
    "phone": "+91 98765 43210",
    "email": "info@ecovistalife.in",
    "socialLinks": {
      "facebook": "#",
      "instagram": "#",
      "linkedin": "#",
      "twitter": "#"
    },
    "columns": [
      {
        "title": "Projects",
        "links": [
          { "name": "Ongoing Projects", "url": "/projects?type=ongoing" },
          { "name": "Upcoming Projects", "url": "/projects?type=upcoming" },
          { "name": "Completed Projects", "url": "/projects?type=completed" }
        ]
      }
    ]
  }'::jsonb,
  '{"bgColor": "#0F3D3E", "textColor": "#ffffff"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS library_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  animation_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT library_blocks_type_check CHECK (
    type IN (
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
  )
);

CREATE INDEX IF NOT EXISTS idx_library_blocks_created_at ON library_blocks(created_at DESC);
