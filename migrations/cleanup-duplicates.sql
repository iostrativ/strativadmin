-- =============================================
-- CLEANUP DUPLICATE PAGE SECTIONS
-- Run this if the migration was executed multiple times
-- =============================================

-- This will remove all page_sections for system pages
-- and allow you to re-run the migration cleanly

DELETE FROM public.page_sections
WHERE page_id IN (
  SELECT id FROM public.pages WHERE is_system_page = true
);

-- Optionally, if you want to completely reset and re-run:
-- Uncomment the line below to also delete the system pages
-- DELETE FROM public.pages WHERE is_system_page = true;

-- Verify cleanup
SELECT
  p.title,
  COUNT(ps.id) as sections_count
FROM public.pages p
LEFT JOIN public.page_sections ps ON ps.page_id = p.id
WHERE p.is_system_page = true
GROUP BY p.title
ORDER BY p.title;

-- You should see 0 sections for all pages
-- Now you can re-run convert-to-block-system.sql
