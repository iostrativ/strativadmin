# Database Migrations

This folder contains database migration scripts for Strativ Admin.

## How to Run Migrations

### Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Copy the contents of the migration file you want to run
5. Paste into the SQL Editor
6. Click **"Run"** (or press `Ctrl+Enter`)
7. Wait for completion - you should see a success message

### Order of Migrations

Run migrations in this order:

1. **complete-setup.sql** (if setting up fresh database)
   - Creates all database tables, RLS policies, and seed data
   - Only run this ONCE on a fresh Supabase project

2. **convert-to-block-system.sql** (Phase 1 of block builder integration)
   - Converts home/about pages to use unified page_sections table
   - Creates system pages (Services, Team, Contact, Blog)
   - Migrates existing data from home_sections/about_sections
   - Run this AFTER complete-setup.sql

## Migration Details

### convert-to-block-system.sql

**Purpose:** Implements Phase 1 of the full block builder integration plan.

**What it does:**
- Creates 7 system pages (Home, About, Services, Portfolio, Team, Contact, Blog)
- Migrates Home page data:
  - Converts hero section to page_sections
  - Converts stats section (combines home_stats table data)
  - Adds services, portfolio, testimonials, clients blocks
  - Converts CTA section
- Migrates About page data:
  - Converts hero, story sections
  - Converts values section (combines about_values table data)
  - Converts timeline section (combines about_timeline table data)
  - Adds team preview block
  - Converts "Why Choose Us" section
- Seeds Services page with hero, services list, and CTA
- Seeds Team page with hero and team grid
- Seeds Contact page with hero, contact info, and contact form
- Seeds Blog page with hero, category filter, and blog grid

**Prerequisites:**
- Database must already have the schema from complete-setup.sql
- Data in home_sections, about_sections tables will be preserved (not deleted)

**Verification:**
After running, check the output in the SQL Editor. You should see a table showing:
```
title     | sections_count
----------|---------------
About     | 6
Blog      | 3
Contact   | 3
Home      | 9
Portfolio | 0
Services  | 3
Team      | 2
```

**Rollback:**
If you need to rollback this migration, run:
```sql
DELETE FROM public.page_sections WHERE page_id IN (SELECT id FROM public.pages WHERE is_system_page = true);
DELETE FROM public.pages WHERE is_system_page = true;
```

## New Block Types Added

This migration introduces 8 new block types:

1. **timeline** - Vertical timeline with year badges
2. **values** - Icon + title + description grid
3. **story** - Two-column text with stats overlay
4. **why_choose** - Reasons list + stats grid
5. **contact_form** - Contact form renderer
6. **contact_info** - Contact details display
7. **blog_grid** - Blog posts grid with pagination
8. **category_filter** - Category filter buttons

## TypeScript Types

The TypeScript types have been updated in `src/types/database.ts` to include:
- New block types in the `BlockType` union
- New content interfaces for each block type
- Enhanced existing block content types with new configuration options

## Next Steps After Migration

After successfully running the migration:

1. **Restart your development server** to pick up the new types
2. **Phase 2** will involve creating the React components for the new block types
3. **Phase 3** will enhance existing block renderers with configuration options
4. **Phase 4** will add admin editors for all block types
5. **Phase 5** will convert system pages to use DynamicPage component
6. **Phase 6** will update the admin panel routes
7. **Phase 7** will be final testing and verification

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run complete-setup.sql first
- Check that the table names match your database schema

### Error: "duplicate key value violates unique constraint"
- The migration may have already been run
- Check if system pages already exist: `SELECT * FROM pages WHERE is_system_page = true`
- If they exist, you may need to delete them first or skip this migration

### No data in page_sections after migration
- Check that home_sections and about_sections tables have data
- Verify the migration completed without errors
- Look for error messages in the SQL Editor output

### Migration runs but verification shows 0 sections
- Check the SQL Editor output for errors during the DO blocks
- Verify that the page IDs were found correctly
- Try running the verification query manually:
  ```sql
  SELECT p.title, COUNT(ps.id) as sections_count
  FROM public.pages p
  LEFT JOIN public.page_sections ps ON ps.page_id = p.id
  WHERE p.is_system_page = true
  GROUP BY p.title
  ORDER BY p.title;
  ```
