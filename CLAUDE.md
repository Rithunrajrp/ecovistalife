# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js Version Warning

This project uses **Next.js 16.2.3** with breaking changes from earlier versions. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Heed deprecation notices. APIs, conventions, and file structure may differ from training data.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run seed     # Seed database with initial pages/blocks (via tsx)
```

## Environment Setup

Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

For local Supabase development:
- API: port 54321
- Database: port 54322
- Studio UI: port 54323

## Architecture

### CMS Block System

This is a headless CMS-powered site with a visual page builder. The core data flow:

```
Database (pages table) → Blocks (JSONB in blocks table) → BlockRenderer → Typed Components
```

**Block types:** hero, text, image, image_text, gallery, cta, faq, form, projects_grid, blogs_grid, contact_info, slideshow

Block content and animation config are stored as JSONB, allowing flexible schema-less content per block type.

### Key Directories

- `src/app/` - Next.js App Router pages (all async server components by default)
- `src/app/admin/` - Admin dashboard for CMS management
- `src/components/blocks/` - Block renderer components (BlockRenderer.tsx is the factory)
- `src/components/ui/` - Reusable UI primitives (Button, Input, Card)
- `src/lib/` - Utilities: supabase.ts (client), cms.ts (CRUD), storage.ts (uploads), animations.ts (GSAP)
- `supabase/init.sql` - Database schema definition

### Subdomain Routing

Middleware (`src/middleware.ts`) intercepts `admin.*` subdomain requests and rewrites to `/admin` routes internally. Single codebase serves both public and admin interfaces.

### Database Schema (Supabase PostgreSQL)

Core tables:
- **pages** - CMS pages with slug for routing
- **blocks** - Content blocks linked to pages, ordered by sort_order
- **forms** / **form_submissions** - Custom form builder system
- **projects** - Real estate projects (ongoing/upcoming/completed types)
- **blogs** - Blog posts
- **faqs** - FAQ entries
- **enquiries** - Contact form submissions
- **settings** - Global key-value configuration

### Animation System

Uses GSAP with ScrollTrigger. `AnimatedBlock` component wraps content blocks with configurable animations (fade, slideUp, slideDown, slideLeft, slideRight, scale). Animation config stored in block's `animation_config` JSONB field.

### Dynamic Routing

- Pages with slugs become routes automatically: `/about`, `/projects`, `/contact`
- Home page is special-cased: slug "home" maps to "/"
- `src/app/[slug]/page.tsx` handles all CMS page routes

## Key Technologies

- **Next.js 16** / **React 19** - App Router with async server components
- **Supabase** - PostgreSQL backend, auth, storage
- **Tailwind CSS 4** - PostCSS plugin integration (different from v3)
- **GSAP + Framer Motion** - Animations
- **@hello-pangea/dnd** - Drag-and-drop block reordering in admin

## Styling

Theme colors defined in `globals.css`:
- Primary: `#0F3D3E` (teal green)
- Accent: `#D4AF37` (gold)
- Fonts: Montserrat (headings), Poppins (body)

Use the `cn()` utility from `src/lib/utils.ts` for conditional classname merging.
