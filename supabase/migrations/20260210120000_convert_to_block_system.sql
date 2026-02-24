-- Migration: Convert to Unified Block System
-- This migration converts all pages to use the unified page_sections block system
-- Date: 2026-02-10
--
-- What this does:
-- 1. Adds is_system_page column to pages table
-- 2. Creates system pages (home, about, services, team, contact, blog)
-- 3. Migrates home_sections and about_sections to page_sections
-- 4. Seeds new system pages with default blocks
--
-- This migration is idempotent - safe to run multiple times

-- ============================================================================
-- Step 1: Add is_system_page column to pages table
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'is_system_page'
  ) THEN
    ALTER TABLE pages ADD COLUMN is_system_page BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- Step 2: Create system pages if they don't exist
-- ============================================================================

-- Function to create system page if it doesn't exist
CREATE OR REPLACE FUNCTION create_system_page_if_not_exists(
  p_title TEXT,
  p_slug TEXT
) RETURNS UUID AS $$
DECLARE
  v_page_id UUID;
BEGIN
  -- Check if page already exists
  SELECT id INTO v_page_id FROM pages WHERE slug = p_slug;

  IF v_page_id IS NULL THEN
    -- Create new page
    INSERT INTO pages (title, slug, is_published, is_system_page, created_at, updated_at)
    VALUES (p_title, p_slug, TRUE, TRUE, NOW(), NOW())
    RETURNING id INTO v_page_id;
  ELSE
    -- Update existing page to mark as system page
    UPDATE pages SET is_system_page = TRUE WHERE id = v_page_id;
  END IF;

  RETURN v_page_id;
END;
$$ LANGUAGE plpgsql;

-- Create all system pages
DO $$
DECLARE
  v_home_id UUID;
  v_about_id UUID;
  v_services_id UUID;
  v_team_id UUID;
  v_contact_id UUID;
  v_blog_id UUID;
BEGIN
  v_home_id := create_system_page_if_not_exists('Home', 'home');
  v_about_id := create_system_page_if_not_exists('About', 'about');
  v_services_id := create_system_page_if_not_exists('Services', 'services');
  v_team_id := create_system_page_if_not_exists('Team', 'team');
  v_contact_id := create_system_page_if_not_exists('Contact', 'contact');
  v_blog_id := create_system_page_if_not_exists('Blog', 'blog');
END $$;

-- ============================================================================
-- Step 3: Migrate Home Page Data
-- ============================================================================

DO $$
DECLARE
  v_home_id UUID;
  v_home_sections RECORD;
  v_next_order INT := 0;
BEGIN
  -- Get home page ID
  SELECT id INTO v_home_id FROM pages WHERE slug = 'home';

  -- Check if we've already migrated (if page_sections exist for home page, skip)
  IF EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_home_id) THEN
    RAISE NOTICE 'Home page already migrated, skipping...';
  ELSIF EXISTS (SELECT 1 FROM home_sections LIMIT 1) THEN
    -- Get home sections data
    SELECT * INTO v_home_sections FROM home_sections LIMIT 1;

    -- 1. Hero Block
    IF v_home_sections.hero IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_home_id, 'hero', v_home_sections.hero, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    -- 2. Stats Block (combine stats_intro + home_stats)
    IF v_home_sections.stats_intro IS NOT NULL THEN
      DECLARE
        v_stats_content JSONB;
        v_stats_items JSONB;
      BEGIN
        -- Get stats from home_stats table
        SELECT jsonb_agg(
          jsonb_build_object(
            'value', value::TEXT,
            'label', label,
            'suffix', suffix
          ) ORDER BY sort_order
        ) INTO v_stats_items
        FROM home_stats;

        -- Combine with stats_intro
        v_stats_content := v_home_sections.stats_intro || jsonb_build_object('items', COALESCE(v_stats_items, '[]'::JSONB));

        INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
        VALUES (v_home_id, 'stats', v_stats_content, v_next_order, TRUE);
        v_next_order := v_next_order + 1;
      END;
    END IF;

    -- 3. Services Intro (rich_text)
    IF v_home_sections.services_intro IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_home_id, 'rich_text', v_home_sections.services_intro, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    -- 4. Services Block
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_home_id, 'services', '{"title": "Our Services", "featuredOnly": true, "limit": 6}'::JSONB, v_next_order, TRUE);
    v_next_order := v_next_order + 1;

    -- 5. Portfolio Intro (rich_text)
    IF v_home_sections.portfolio_intro IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_home_id, 'rich_text', v_home_sections.portfolio_intro, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    -- 6. Portfolio Block
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_home_id, 'portfolio', '{"title": "Our Work", "featuredOnly": true, "limit": 6}'::JSONB, v_next_order, TRUE);
    v_next_order := v_next_order + 1;

    -- 7. Testimonials Block
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_home_id, 'testimonials', '{"title": "What Our Clients Say", "featuredOnly": true, "limit": 3}'::JSONB, v_next_order, TRUE);
    v_next_order := v_next_order + 1;

    -- 8. Clients Block
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_home_id, 'clients', '{"title": "Trusted By", "displayStyle": "carousel"}'::JSONB, v_next_order, TRUE);
    v_next_order := v_next_order + 1;

    -- 9. CTA Block
    IF v_home_sections.cta IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_home_id, 'cta', v_home_sections.cta, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    RAISE NOTICE 'Home page migrated successfully with % blocks', v_next_order;
  END IF;
END $$;

-- ============================================================================
-- Step 4: Migrate About Page Data
-- ============================================================================

DO $$
DECLARE
  v_about_id UUID;
  v_about_sections RECORD;
  v_next_order INT := 0;
BEGIN
  -- Get about page ID
  SELECT id INTO v_about_id FROM pages WHERE slug = 'about';

  -- Check if we've already migrated
  IF EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_about_id) THEN
    RAISE NOTICE 'About page already migrated, skipping...';
  ELSIF EXISTS (SELECT 1 FROM about_sections LIMIT 1) THEN
    -- Get about sections data
    SELECT * INTO v_about_sections FROM about_sections LIMIT 1;

    -- 1. Hero Block
    IF v_about_sections.hero IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_about_id, 'hero', v_about_sections.hero, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    -- 2. Story Block (combine story + stats)
    IF v_about_sections.story IS NOT NULL THEN
      DECLARE
        v_story_content JSONB;
      BEGIN
        -- Story block with stats
        v_story_content := v_about_sections.story;

        INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
        VALUES (v_about_id, 'story', v_story_content, v_next_order, TRUE);
        v_next_order := v_next_order + 1;
      END;
    END IF;

    -- 3. Values Intro (rich_text)
    IF v_about_sections.values_intro IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_about_id, 'rich_text', v_about_sections.values_intro, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    -- 4. Values Block
    DECLARE
      v_values_items JSONB;
      v_values_content JSONB;
    BEGIN
      -- Get values from about_values table
      SELECT jsonb_agg(
        jsonb_build_object(
          'icon', icon,
          'title', title,
          'description', description
        ) ORDER BY sort_order
      ) INTO v_values_items
      FROM about_values;

      v_values_content := jsonb_build_object(
        'title', v_about_sections.values_intro->>'title',
        'subtitle', v_about_sections.values_intro->>'subtitle',
        'columns', 3,
        'items', COALESCE(v_values_items, '[]'::JSONB)
      );

      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_about_id, 'values', v_values_content, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END;

    -- 5. Timeline Intro (rich_text)
    IF v_about_sections.timeline_intro IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_about_id, 'rich_text', v_about_sections.timeline_intro, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    -- 6. Timeline Block
    DECLARE
      v_timeline_items JSONB;
      v_timeline_content JSONB;
    BEGIN
      -- Get timeline from about_timeline table
      SELECT jsonb_agg(
        jsonb_build_object(
          'year', year,
          'title', title,
          'description', description
        ) ORDER BY year
      ) INTO v_timeline_items
      FROM about_timeline;

      v_timeline_content := jsonb_build_object(
        'title', v_about_sections.timeline_intro->>'title',
        'subtitle', v_about_sections.timeline_intro->>'subtitle',
        'items', COALESCE(v_timeline_items, '[]'::JSONB)
      );

      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_about_id, 'timeline', v_timeline_content, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END;

    -- 7. Team Preview Block
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_about_id, 'team', '{"title": "Meet Our Team", "limit": 4, "columns": 4}'::JSONB, v_next_order, TRUE);
    v_next_order := v_next_order + 1;

    -- 8. Why Choose Block
    IF v_about_sections.why_choose IS NOT NULL THEN
      INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
      VALUES (v_about_id, 'why_choose', v_about_sections.why_choose, v_next_order, TRUE);
      v_next_order := v_next_order + 1;
    END IF;

    RAISE NOTICE 'About page migrated successfully with % blocks', v_next_order;
  END IF;
END $$;

-- ============================================================================
-- Step 5: Seed Services Page
-- ============================================================================

DO $$
DECLARE
  v_services_id UUID;
BEGIN
  SELECT id INTO v_services_id FROM pages WHERE slug = 'services';

  -- Check if already seeded
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_services_id) THEN
    -- Hero
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_services_id, 'hero', '{
      "headline": "Our Services",
      "subheadline": "Comprehensive solutions tailored to your needs",
      "alignment": "center"
    }'::JSONB, 0, TRUE);

    -- Services Block
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_services_id, 'services', '{
      "title": "What We Offer",
      "featuredOnly": false,
      "limit": 0
    }'::JSONB, 1, TRUE);

    -- CTA
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_services_id, 'cta', '{
      "title": "Ready to Get Started?",
      "subtitle": "Contact us today to discuss your project",
      "buttonText": "Contact Us",
      "buttonUrl": "/contact",
      "backgroundStyle": "gradient"
    }'::JSONB, 2, TRUE);

    RAISE NOTICE 'Services page seeded successfully';
  END IF;
END $$;

-- ============================================================================
-- Step 6: Seed Team Page
-- ============================================================================

DO $$
DECLARE
  v_team_id UUID;
BEGIN
  SELECT id INTO v_team_id FROM pages WHERE slug = 'team';

  -- Check if already seeded
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_team_id) THEN
    -- Hero
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_team_id, 'hero', '{
      "headline": "Our Team",
      "subheadline": "Meet the talented people behind our success",
      "alignment": "center"
    }'::JSONB, 0, TRUE);

    -- Team Block
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_team_id, 'team', '{
      "title": "Meet Our Team",
      "limit": 0,
      "columns": 4
    }'::JSONB, 1, TRUE);

    RAISE NOTICE 'Team page seeded successfully';
  END IF;
END $$;

-- ============================================================================
-- Step 7: Seed Contact Page
-- ============================================================================

DO $$
DECLARE
  v_contact_id UUID;
BEGIN
  SELECT id INTO v_contact_id FROM pages WHERE slug = 'contact';

  -- Check if already seeded
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_contact_id) THEN
    -- Hero
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_contact_id, 'hero', '{
      "headline": "Get In Touch",
      "subheadline": "We would love to hear from you",
      "alignment": "center"
    }'::JSONB, 0, TRUE);

    -- Contact Info
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_contact_id, 'contact_info', '{
      "title": "Contact Information",
      "useSettings": true
    }'::JSONB, 1, TRUE);

    -- Contact Form
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_contact_id, 'contact_form', '{
      "title": "Send Us a Message",
      "subtitle": "Fill out the form below and we will get back to you as soon as possible"
    }'::JSONB, 2, TRUE);

    RAISE NOTICE 'Contact page seeded successfully';
  END IF;
END $$;

-- ============================================================================
-- Step 8: Seed Blog Page
-- ============================================================================

DO $$
DECLARE
  v_blog_id UUID;
BEGIN
  SELECT id INTO v_blog_id FROM pages WHERE slug = 'blog';

  -- Check if already seeded
  IF NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = v_blog_id) THEN
    -- Hero
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_blog_id, 'hero', '{
      "headline": "Our Blog",
      "subheadline": "Insights, news, and updates from our team",
      "alignment": "center"
    }'::JSONB, 0, TRUE);

    -- Category Filter
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_blog_id, 'category_filter', '{
      "style": "pills",
      "showAll": true
    }'::JSONB, 1, TRUE);

    -- Blog Grid
    INSERT INTO page_sections (page_id, block_type, content, sort_order, is_visible)
    VALUES (v_blog_id, 'blog_grid', '{
      "title": "Latest Posts",
      "layout": "grid",
      "postsPerPage": 9
    }'::JSONB, 2, TRUE);

    RAISE NOTICE 'Blog page seeded successfully';
  END IF;
END $$;

-- ============================================================================
-- Cleanup: Drop helper function
-- ============================================================================

DROP FUNCTION IF EXISTS create_system_page_if_not_exists(TEXT, TEXT);

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Note: Old tables (home_sections, about_sections, home_stats, about_values, about_timeline)
-- are NOT dropped automatically. They are kept as backup.
-- To drop them manually after verifying migration, run:
--   DROP TABLE IF EXISTS home_sections CASCADE;
--   DROP TABLE IF EXISTS home_stats CASCADE;
--   DROP TABLE IF EXISTS about_sections CASCADE;
--   DROP TABLE IF EXISTS about_values CASCADE;
--   DROP TABLE IF EXISTS about_timeline CASCADE;
