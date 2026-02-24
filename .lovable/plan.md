

# 🚀 Software House Website with Full CMS

A complete, production-ready business profile website with a powerful built-in content management system, enabling non-technical users to manage all content and create new pages without code.

---

## 🎨 Design Direction

**Bold & Dynamic Style:**
- Vibrant accent colors (electric blue, energetic gradients)
- Engaging micro-interactions and scroll animations
- Strong typography with dramatic headings
- Full-width hero sections with video/animated backgrounds
- Card-based layouts with hover effects
- Dark mode support

---

## 🌐 Part 1: Public Website

### Pages & Features

**Home Page**
- Animated hero with headline, subtext, and CTA buttons
- Quick stats counter (projects, clients, years)
- Featured services grid
- Portfolio showcase (latest 3 projects)
- Client logos carousel
- Testimonials slider
- Call-to-action section

**About Page**
- Company story with timeline
- Mission & values section
- Team highlights
- Why choose us features

**Services Page**
- Grid of all services with icons
- Click through to individual service detail pages
- Each service: description, benefits, process, related projects

**Portfolio Page**
- Filterable project gallery (by industry, tech stack)
- Project cards with hover previews
- Detail pages with:
  - Full project description
  - Client info & industry
  - Technologies used
  - Image gallery/screenshots
  - Key highlights & results

**Team Page**
- Team member cards with photos
- Social links
- Bio on click/expand

**Blog**
- Post listing with featured image, excerpt, date
- Category and tag filtering
- Full post pages with author info
- Related posts

**Contact Page**
- Contact form (saves to database)
- Company info (address, email, phone)
- Embedded map
- Social links

**Legal Pages**
- Privacy Policy
- Terms of Service

### SEO & Performance

- Dynamic meta tags, OpenGraph, Twitter cards per page
- Slug-based clean URLs
- Auto-generated sitemap
- robots.txt configuration
- Optimized images with lazy loading
- Smooth page transitions

---

## 🔐 Part 2: Admin CMS

### Authentication

- Supabase Auth (email/password)
- Role-based access:
  - **Admin**: Full access to all features
  - **Editor**: Can manage content, cannot manage users

### Dashboard

- Overview stats (pages, posts, submissions)
- Recent activity
- Quick actions

### Page Builder

- **Create new pages** with title, slug, SEO settings
- **Block-based content system** — drag-and-drop reorderable sections:
  - Hero block
  - Rich text block (Markdown/WYSIWYG)
  - Image + text block
  - Gallery block
  - Testimonials block
  - FAQ accordion block
  - Stats counter block
  - Pricing table block
  - CTA block
  - Embed block (videos, maps)
- Each block has configurable fields
- Publish/unpublish toggle
- Pages automatically render on public site

### Menu Manager

- Create and edit navigation menus
- Drag to reorder items
- Link to dynamic pages or external URLs
- Enable/disable menu items
- Header and footer menu support

### Portfolio Manager

- CRUD for portfolio projects
- Fields: title, slug, client, industry, tech stack (tags), images, highlights, full content
- Publish/draft toggle
- Featured project option

### Services Manager

- CRUD for services
- Icon picker
- Short description + detailed content (Markdown)
- Featured service toggle
- Order control

### Blog Manager

- CRUD for blog posts
- Title, slug, featured image
- Rich content editor (Markdown with preview)
- Categories and tags
- Author assignment
- Publish date scheduling
- Draft/published status

### Media Library

- Upload images (file type + size restrictions)
- Browse uploaded media
- Insert media into content blocks
- Delete unused assets
- Storage via Supabase Storage

### Contact Submissions

- View all form submissions
- Mark as read/unread
- Export capability
- Optional email notification setup

### Settings

- Site settings (name, logo, tagline)
- Social links
- SEO defaults
- Contact information

---

## 🗄️ Database Schema (Supabase)

**Core Tables:**
- `users` — via Supabase Auth
- `profiles` — user display info
- `user_roles` — admin/editor roles (separate table for security)

**Content Tables:**
- `pages` — title, slug, seo_title, seo_description, is_published
- `page_sections` — page_id, block_type, content (JSON), order
- `menu_items` — label, url, page_id, parent_id, order, enabled, menu_location
- `portfolio_items` — title, slug, client, industry, tech_stack, content, is_published, is_featured
- `portfolio_images` — portfolio_id, image_url, caption, order
- `services` — title, slug, icon, short_description, content, is_featured, order
- `blog_posts` — title, slug, featured_image, content, category_id, author_id, publish_date, status
- `categories` — name, slug
- `tags` — name, slug
- `post_tags` — post_id, tag_id
- `media_assets` — filename, url, type, size, uploaded_by
- `contact_submissions` — name, email, message, is_read, created_at

**Relationships & RLS:**
- Proper foreign keys and cascading deletes
- Row-Level Security policies for admin/editor roles
- Public read access for published content only

---

## 🎯 Demo Content (Seed Data)

**Demo Company: "NexaTech Solutions"**
- IT consulting & software development company
- Modern tech stack focus

**Seed Data Includes:**
- 5 services (Web Development, Mobile Apps, Cloud Solutions, DevOps, AI Integration)
- 6 portfolio projects with images
- 4 team members
- 5 testimonials
- 3 sample blog posts
- Sample pages (Home, About, Contact)
- Navigation menu configured

---

## 📦 Deliverables

1. ✅ Complete React application with routing
2. ✅ Supabase database with all tables and RLS
3. ✅ Admin CMS with all management features
4. ✅ Public website with dynamic content rendering
5. ✅ Media upload and management
6. ✅ Authentication with role-based access
7. ✅ Seed data for demo IT company
8. ✅ Responsive, accessible, bold design
9. ✅ Documentation in README

---

## ⏱️ Implementation Approach

This is a large system, so I'll build it in logical phases:

1. **Database & Auth Foundation** — Schema, roles, authentication
2. **Admin CMS Core** — Dashboard, page builder, content editors
3. **Public Site** — All public pages pulling from CMS
4. **Portfolio & Blog** — List + detail pages with filtering
5. **Media Library** — Upload and management
6. **Menu System** — Dynamic navigation
7. **Polish** — Animations, SEO, seed data, documentation

