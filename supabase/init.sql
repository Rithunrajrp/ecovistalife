-- ============================================
-- EcoVistaLife — Complete Database Schema
-- ============================================

-- Existing tables
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ongoing', 'upcoming', 'completed')),
  description TEXT,
  location TEXT,
  price TEXT,
  images TEXT[] DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ============================================
-- CMS Page Builder Tables
-- ============================================

CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('composition', 'hero', 'text', 'image', 'image_text', 'gallery', 'cta', 'faq', 'form', 'projects_grid', 'blogs_grid', 'contact_info')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  animation_config JSONB NOT NULL DEFAULT '{}',
  template_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blocks_page_id ON blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_blocks_sort_order ON blocks(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);

-- ============================================
-- Global Settings (editable from admin)
-- ============================================
INSERT INTO settings (key, value) VALUES
  ('company_name', 'EcoVistaLife'),
  ('contact_email', 'info@ecovistalife.in'),
  ('sales_email', 'sales@ecovistalife.in'),
  ('phone_number', '+91 98765 43210'),
  ('phone_number_2', '+91 12345 67890'),
  ('whatsapp_number', '919876543210'),
  ('address', '123 Eco Blvd, Green Tech Park, Mumbai, Maharashtra 400001, India'),
  ('working_hours', 'Mon - Sat: 9:00 AM - 6:00 PM | Sunday: Closed'),
  ('social_facebook', '#'),
  ('social_instagram', '#'),
  ('social_linkedin', '#'),
  ('social_twitter', '#'),
  ('hero_title', 'Where Nature Meets Luxury.'),
  ('hero_subtitle', 'Discover exquisitely designed, sustainable homes that offer an unparalleled standard of living. Invest in a future that values both elegance and the environment.'),
  ('hero_cta', 'Explore Projects'),
  ('footer_tagline', 'Premium, sustainable, and luxurious real estate properties designed for the modern lifestyle. Experience the perfect blend of nature and architecture.')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Seed: Projects (matching static data exactly)
-- ============================================
INSERT INTO projects (id, title, type, location, price, image) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Eco Residency', 'ongoing', 'Bandra West, Mumbai', '₹ 4.5 Cr Onwards', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800'),
  ('b2000000-0000-0000-0000-000000000002', 'Vista Serenity', 'upcoming', 'Powai, Mumbai', '₹ 3.2 Cr Onwards', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800'),
  ('b3000000-0000-0000-0000-000000000003', 'The Green Orchid', 'completed', 'Worli, Mumbai', '₹ 8.0 Cr Onwards', 'https://images.unsplash.com/photo-1600566753086-00f18efc2291?q=80&w=800'),
  ('b4000000-0000-0000-0000-000000000004', 'Palm Meadows', 'completed', 'Juhu, Mumbai', '₹ 12.0 Cr Onwards', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Seed: Blogs (matching static data exactly)
-- ============================================
INSERT INTO blogs (id, title, content, image, created_at) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'The Future of Sustainable Architecture in Urban India', 'Explore how modern real estate developers are integrating green building principles to create sustainable urban living spaces.', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800', '2023-10-15T10:00:00Z'),
  ('c2000000-0000-0000-0000-000000000002', '5 Tips For Investing in Premium Real Estate', 'A comprehensive guide for first-time luxury homebuyers on what to look for when investing in high-end properties.', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800', '2023-09-22T10:00:00Z'),
  ('c3000000-0000-0000-0000-000000000003', 'Understanding Smart Homes: Beyond Just Automation', 'Smart homes are more than just controlling lights with your phone. Read about the new standard in premium eco-living.', 'https://images.unsplash.com/photo-1583847268964-b28ce8be4df1?q=80&w=800', '2023-08-30T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Seed: FAQs
-- ============================================
INSERT INTO faqs (id, question, answer) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'What makes EcoVistaLife different?', 'We integrate green building principles into every project, ensuring each home is energy-efficient and environmentally responsible.'),
  ('d2000000-0000-0000-0000-000000000002', 'Where are your projects located?', 'Our premium developments are strategically located across Mumbai, Pune, and Bangalore, in areas with excellent connectivity.'),
  ('d3000000-0000-0000-0000-000000000003', 'Do you provide home loans assistance?', 'Yes, we have partnerships with leading banks and NBFCs to help you get the best home loan rates and hassle-free processing.')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Seed: Default Enquiry Form
-- ============================================
INSERT INTO forms (id, name, fields) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'General Enquiry', '[{"name": "name", "label": "Full Name", "type": "text", "required": true}, {"name": "email", "label": "Email Address", "type": "email", "required": true}, {"name": "phone", "label": "Phone Number", "type": "phone", "required": true}, {"name": "message", "label": "Your Message", "type": "textarea", "required": true}]')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Seed: CMS Pages + Blocks
-- ============================================

-- Home page
INSERT INTO pages (id, title, slug) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Home', 'home')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blocks (page_id, type, sort_order, content) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'hero', 0, '{"title": "Where Nature Meets Luxury.", "subtitle": "Discover exquisitely designed, sustainable homes that offer an unparalleled standard of living. Invest in a future that values both elegance and the environment.", "image": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000", "buttonText": "Explore Projects", "buttonLink": "/projects"}'),
  ('a1000000-0000-0000-0000-000000000001', 'projects_grid', 1, '{"heading": "Featured Projects", "filterType": "all"}'),
  ('a1000000-0000-0000-0000-000000000001', 'text', 2, '{"heading": "Redefining Modern Living", "subheading": "About EcoVistaLife", "body": "We are committed to delivering exceptional real estate developments that perfectly balance luxurious amenities with sustainable practices. Every project is a testament to our dedication towards innovation and environmental consciousness."}'),
  ('a1000000-0000-0000-0000-000000000001', 'blogs_grid', 3, '{"heading": "Latest News"}'),
  ('a1000000-0000-0000-0000-000000000001', 'cta', 4, '{"heading": "Ready to step into luxury living?", "description": "Get in touch with our experts today and discover the perfect property that matches your lifestyle and aspirations.", "buttonText": "Contact Us Today", "buttonLink": "/contact"}');

-- About page
INSERT INTO pages (id, title, slug) VALUES
  ('a2000000-0000-0000-0000-000000000002', 'About Us', 'about')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blocks (page_id, type, sort_order, content) VALUES
  ('a2000000-0000-0000-0000-000000000002', 'hero', 0, '{"title": "About EcoVistaLife", "subtitle": "Pioneering sustainable luxury in real estate development since 2010.", "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"}'),
  ('a2000000-0000-0000-0000-000000000002', 'image_text', 1, '{"heading": "Building the Future, Naturally.", "body": "Founded on the principles of sustainability and uncompromising quality, EcoVistaLife emerged with a vision to redefine the real estate landscape. We believe that a home is more than just a structure; it''s a sanctuary that should harmonize with its natural surroundings.\n\nOver the years, our dedicated team of architects, designers, and environmental experts have collaborated to craft living spaces that not only offer premium luxury but also significantly reduce environmental impact.", "image": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800", "imagePosition": "left"}'),
  ('a2000000-0000-0000-0000-000000000002', 'text', 2, '{"heading": "Our Vision", "body": "To be the global leader in sustainable luxury real estate, creating intelligent communities that inspire a modern, eco-conscious way of living while preserving the planet for future generations."}'),
  ('a2000000-0000-0000-0000-000000000002', 'text', 3, '{"heading": "Our Mission", "body": "To design and build premium properties that seamlessly integrate cutting-edge green technologies, timeless aesthetics, and superior comfort without compromising on environmental integrity."}'),
  ('a2000000-0000-0000-0000-000000000002', 'projects_grid', 4, '{"heading": "Our Legacy", "filterType": "completed"}'),
  ('a2000000-0000-0000-0000-000000000002', 'cta', 5, '{"heading": "Join Us in Building the Future", "description": "Get in touch with us to explore partnership opportunities or view our ongoing projects.", "buttonText": "View Projects", "buttonLink": "/projects"}');

-- Projects showcase page
INSERT INTO pages (id, title, slug) VALUES
  ('a3000000-0000-0000-0000-000000000003', 'Our Projects', 'projects')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blocks (page_id, type, sort_order, content) VALUES
  ('a3000000-0000-0000-0000-000000000003', 'hero', 0, '{"title": "Our Projects", "subtitle": "Explore our diverse portfolio of sustainable luxury properties.", "image": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000"}'),
  ('a3000000-0000-0000-0000-000000000003', 'projects_grid', 1, '{"heading": "All Projects", "filterType": "all"}');

-- Blogs page
INSERT INTO pages (id, title, slug) VALUES
  ('a4000000-0000-0000-0000-000000000004', 'Insights & Blog', 'blogs')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blocks (page_id, type, sort_order, content) VALUES
  ('a4000000-0000-0000-0000-000000000004', 'hero', 0, '{"title": "Insights & News", "subtitle": "Latest trends in real estate, sustainable living, and home design.", "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000"}'),
  ('a4000000-0000-0000-0000-000000000004', 'blogs_grid', 1, '{"heading": "Latest Articles"}');

-- Contact page
INSERT INTO pages (id, title, slug) VALUES
  ('a5000000-0000-0000-0000-000000000005', 'Contact', 'contact')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blocks (page_id, type, sort_order, content) VALUES
  ('a5000000-0000-0000-0000-000000000005', 'hero', 0, '{"title": "Contact Us", "subtitle": "We are here to help you find your perfect home.", "image": ""}'),
  ('a5000000-0000-0000-0000-000000000005', 'contact_info', 1, '{"heading": "Get in Touch", "body": "Reach out to us for any inquiries. We''ll get back to you as soon as possible."}'),
  ('a5000000-0000-0000-0000-000000000005', 'form', 2, '{"heading": "Send us a Message", "formId": "f1000000-0000-0000-0000-000000000001", "buttonText": "Submit"}');

-- ============================================
-- Site footer (singleton) + library blocks
-- ============================================

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
  '{"brandName": "EcoVistaLife", "tagline": "Premium, sustainable, and luxurious real estate properties designed for the modern lifestyle.", "address": "123 Eco Blvd, Green Tech Park, Mumbai, Maharashtra 400001, India", "phone": "+91 98765 43210", "email": "info@ecovistalife.in", "socialLinks": {"facebook": "#", "instagram": "#", "linkedin": "#", "twitter": "#"}, "columns": [{"title": "Projects", "links": [{"name": "Ongoing Projects", "url": "/projects?type=ongoing"}, {"name": "Upcoming Projects", "url": "/projects?type=upcoming"}, {"name": "Completed Projects", "url": "/projects?type=completed"}]}]}'::jsonb,
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
      'composition',
      'hero', 'text', 'image', 'image_text', 'gallery', 'cta', 'faq', 'form',
      'projects_grid', 'blogs_grid', 'contact_info', 'slideshow'
    )
  )
);
