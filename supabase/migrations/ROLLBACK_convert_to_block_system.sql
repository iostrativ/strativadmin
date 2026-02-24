-- Rollback Script for Block System Migration
-- This script reverts the changes made by 20260210120000_convert_to_block_system.sql
-- Date: 2026-02-10
--
-- WARNING: Only run this if you need to revert to the old system
-- This will DELETE all page_sections for system pages

-- ============================================================================
-- Step 1: Delete page_sections for all system pages
-- ============================================================================

DO $$
DECLARE
  v_home_id UUID;
  v_about_id UUID;
  v_services_id UUID;
  v_team_id UUID;
  v_contact_id UUID;
  v_blog_id UUID;
BEGIN
  -- Get system page IDs
  SELECT id INTO v_home_id FROM pages WHERE slug = 'home';
  SELECT id INTO v_about_id FROM pages WHERE slug = 'about';
  SELECT id INTO v_services_id FROM pages WHERE slug = 'services';
  SELECT id INTO v_team_id FROM pages WHERE slug = 'team';
  SELECT id INTO v_contact_id FROM pages WHERE slug = 'contact';
  SELECT id INTO v_blog_id FROM pages WHERE slug = 'blog';

  -- Delete all page_sections for these pages
  DELETE FROM page_sections WHERE page_id IN (
    v_home_id, v_about_id, v_services_id, v_team_id, v_contact_id, v_blog_id
  );

  RAISE NOTICE 'Deleted all page_sections for system pages';
END $$;

-- ============================================================================
-- Step 2: Delete system pages (services, team, contact, blog)
-- ============================================================================

-- Note: We keep home and about pages as they existed before
DELETE FROM pages WHERE slug IN ('services', 'team', 'contact', 'blog') AND is_system_page = TRUE;

RAISE NOTICE 'Deleted new system pages (services, team, contact, blog)';

-- ============================================================================
-- Step 3: Remove is_system_page column
-- ============================================================================

ALTER TABLE pages DROP COLUMN IF EXISTS is_system_page;

RAISE NOTICE 'Removed is_system_page column';

-- ============================================================================
-- Rollback Complete
-- ============================================================================

RAISE NOTICE 'Rollback complete. Old tables (home_sections, about_sections, etc.) are still intact.';
RAISE NOTICE 'You may need to restore the old HomePage and AboutPage React components.';
