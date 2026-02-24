-- =============================================
-- PHASE 1: CONVERT TO UNIFIED BLOCK SYSTEM
-- This migration converts all pages to use page_sections
-- Run this AFTER complete-setup.sql
-- =============================================

-- =============================================
-- STEP 1: CREATE SYSTEM PAGES
-- =============================================

-- Create system pages if they don't exist
INSERT INTO public.pages (title, slug, is_published, is_system_page, seo_title, seo_description)
VALUES
  ('Home', 'home', true, true, 'Home - {site_name}', 'Welcome to {site_name}'),
  ('About', 'about', true, true, 'About Us - {site_name}', 'Learn more about our team and values'),
  ('Services', 'services', true, true, 'Our Services - {site_name}', 'Discover our comprehensive software development services'),
  ('Portfolio', 'portfolio', true, true, 'Our Work - {site_name}', 'View our portfolio of successful projects'),
  ('Team', 'team', true, true, 'Our Team - {site_name}', 'Meet the talented people behind {site_name}'),
  ('Contact', 'contact', true, true, 'Contact Us - {site_name}', 'Get in touch with us today'),
  ('Blog', 'blog', true, true, 'Blog - {site_name}', 'Read our latest insights and articles')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- STEP 2: MIGRATE HOME PAGE DATA
-- =============================================

DO $$
DECLARE
  v_home_page_id UUID;
  v_hero_section JSONB;
  v_stats_intro JSONB;
  v_services_intro JSONB;
  v_portfolio_intro JSONB;
  v_cta_section JSONB;
  v_stats_array JSONB;
BEGIN
  -- Get home page ID
  SELECT id INTO v_home_page_id FROM public.pages WHERE slug = 'home';

  -- Get existing home sections content
  SELECT content INTO v_hero_section FROM public.home_sections WHERE section_type = 'hero';
  SELECT content INTO v_stats_intro FROM public.home_sections WHERE section_type = 'stats_intro';
  SELECT content INTO v_services_intro FROM public.home_sections WHERE section_type = 'services_intro';
  SELECT content INTO v_portfolio_intro FROM public.home_sections WHERE section_type = 'portfolio_intro';
  SELECT content INTO v_cta_section FROM public.home_sections WHERE section_type = 'cta';

  -- Build stats array from home_stats table
  SELECT jsonb_agg(
    jsonb_build_object(
      'value', value,
      'label', label,
      'suffix', ''
    ) ORDER BY sort_order
  ) INTO v_stats_array
  FROM public.home_stats;

  -- 1. Hero Block (sort_order = 0)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'hero',
    v_hero_section,
    0,
    true
  );

  -- 2. Stats Block (sort_order = 10)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'stats',
    jsonb_build_object(
      'title', 'Our Impact',
      'items', v_stats_array
    ),
    10,
    true
  );

  -- 3. Services Intro Rich Text (sort_order = 20)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'rich_text',
    jsonb_build_object(
      'content', '## ' || COALESCE(v_services_intro->>'title', 'Our Services') || E'\n\n' ||
                  COALESCE(v_services_intro->>'description', 'We offer comprehensive software development services.')
    ),
    20,
    true
  );

  -- 4. Services Block (sort_order = 30)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'services',
    jsonb_build_object(
      'title', '',
      'subtitle', '',
      'limit', 6,
      'featuredOnly', true
    ),
    30,
    true
  );

  -- 5. Portfolio Intro Rich Text (sort_order = 40)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'rich_text',
    jsonb_build_object(
      'content', '## ' || COALESCE(v_portfolio_intro->>'title', 'Featured Projects') || E'\n\n' ||
                  COALESCE(v_portfolio_intro->>'description', 'Discover our portfolio.')
    ),
    40,
    true
  );

  -- 6. Portfolio Block (sort_order = 50)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'portfolio',
    jsonb_build_object(
      'title', '',
      'subtitle', '',
      'limit', 6,
      'featuredOnly', true
    ),
    50,
    true
  );

  -- 7. Testimonials Block (sort_order = 60)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'testimonials',
    jsonb_build_object(
      'title', 'What Our Clients Say',
      'subtitle', 'Don''t just take our word for it',
      'limit', 3,
      'featuredOnly', true
    ),
    60,
    true
  );

  -- 8. Clients Block (sort_order = 70)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'clients',
    jsonb_build_object(
      'title', 'Trusted By Leading Companies'
    ),
    70,
    true
  );

  -- 9. CTA Block (sort_order = 80)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_home_page_id,
    'cta',
    jsonb_build_object(
      'title', COALESCE(v_cta_section->>'title', 'Ready to Get Started?'),
      'subtitle', COALESCE(v_cta_section->>'description', 'Let''s build something amazing together'),
      'buttonText', COALESCE(v_cta_section->>'buttonText', 'Contact Us'),
      'buttonUrl', COALESCE(v_cta_section->>'buttonUrl', '/contact'),
      'backgroundStyle', 'gradient'
    ),
    80,
    true
  );

END $$;

-- =============================================
-- STEP 3: MIGRATE ABOUT PAGE DATA
-- =============================================

DO $$
DECLARE
  v_about_page_id UUID;
  v_hero_section JSONB;
  v_story_section JSONB;
  v_values_intro JSONB;
  v_timeline_intro JSONB;
  v_why_choose JSONB;
  v_values_array JSONB;
  v_timeline_array JSONB;
BEGIN
  -- Get about page ID
  SELECT id INTO v_about_page_id FROM public.pages WHERE slug = 'about';

  -- Get existing about sections content
  SELECT content INTO v_hero_section FROM public.about_sections WHERE section_type = 'hero';
  SELECT content INTO v_story_section FROM public.about_sections WHERE section_type = 'story';
  SELECT content INTO v_values_intro FROM public.about_sections WHERE section_type = 'values_intro';
  SELECT content INTO v_timeline_intro FROM public.about_sections WHERE section_type = 'timeline_intro';
  SELECT content INTO v_why_choose FROM public.about_sections WHERE section_type = 'why_choose';

  -- Build values array from about_values table
  SELECT jsonb_agg(
    jsonb_build_object(
      'icon', icon,
      'title', title,
      'description', description
    ) ORDER BY sort_order
  ) INTO v_values_array
  FROM public.about_values;

  -- Build timeline array from about_timeline table
  SELECT jsonb_agg(
    jsonb_build_object(
      'year', year,
      'title', title,
      'description', description
    ) ORDER BY sort_order
  ) INTO v_timeline_array
  FROM public.about_timeline;

  -- 1. Hero Block (sort_order = 0)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_about_page_id,
    'hero',
    jsonb_build_object(
      'headline', COALESCE(v_hero_section->>'title', 'About Us'),
      'subheadline', COALESCE(v_hero_section->>'description', 'Learn more about our story'),
      'alignment', 'center'
    ),
    0,
    true
  );

  -- 2. Story Block (sort_order = 10)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_about_page_id,
    'story',
    jsonb_build_object(
      'title', COALESCE(v_story_section->>'title', 'Our Story'),
      'paragraphs', jsonb_build_array(
        COALESCE(v_story_section->>'paragraph1', ''),
        COALESCE(v_story_section->>'paragraph2', ''),
        COALESCE(v_story_section->>'paragraph3', '')
      ),
      'stats', jsonb_build_object(
        'yearsExperience', COALESCE(v_story_section->>'yearsExperience', '10+'),
        'projectsCompleted', COALESCE(v_story_section->>'projectsCompleted', '150+')
      )
    ),
    10,
    true
  );

  -- 3. Values Block (sort_order = 20)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_about_page_id,
    'values',
    jsonb_build_object(
      'title', COALESCE(v_values_intro->>'title', 'Our Values'),
      'subtitle', COALESCE(v_values_intro->>'description', 'What we believe in'),
      'items', v_values_array,
      'columns', 4
    ),
    20,
    true
  );

  -- 4. Timeline Block (sort_order = 30)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_about_page_id,
    'timeline',
    jsonb_build_object(
      'title', COALESCE(v_timeline_intro->>'title', 'Our Journey'),
      'subtitle', COALESCE(v_timeline_intro->>'description', 'Key milestones'),
      'items', v_timeline_array
    ),
    30,
    true
  );

  -- 5. Team Block (sort_order = 40)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_about_page_id,
    'team',
    jsonb_build_object(
      'title', 'Meet Our Team',
      'subtitle', 'The talented people behind our success',
      'limit', 4,
      'columns', 4
    ),
    40,
    true
  );

  -- 6. Why Choose Us Block (sort_order = 50)
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_about_page_id,
    'why_choose',
    v_why_choose,
    50,
    true
  );

END $$;

-- =============================================
-- STEP 4: SEED SERVICES PAGE
-- =============================================

DO $$
DECLARE
  v_services_page_id UUID;
BEGIN
  SELECT id INTO v_services_page_id FROM public.pages WHERE slug = 'services';

  -- 1. Hero Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_services_page_id,
    'hero',
    jsonb_build_object(
      'headline', 'Our Services',
      'subheadline', 'Comprehensive software development solutions tailored to your business needs',
      'alignment', 'center'
    ),
    0,
    true
  );

  -- 2. Services Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_services_page_id,
    'services',
    jsonb_build_object(
      'title', '',
      'subtitle', '',
      'featuredOnly', false
    ),
    10,
    true
  );

  -- 3. CTA Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_services_page_id,
    'cta',
    jsonb_build_object(
      'title', 'Need a Custom Solution?',
      'subtitle', 'Let''s discuss your specific requirements and create a tailored solution for your business',
      'buttonText', 'Get In Touch',
      'buttonUrl', '/contact',
      'backgroundStyle', 'gradient'
    ),
    20,
    true
  );

END $$;

-- =============================================
-- STEP 5: SEED TEAM PAGE
-- =============================================

DO $$
DECLARE
  v_team_page_id UUID;
BEGIN
  SELECT id INTO v_team_page_id FROM public.pages WHERE slug = 'team';

  -- 1. Hero Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_team_page_id,
    'hero',
    jsonb_build_object(
      'headline', 'Our Team',
      'subheadline', 'Meet the talented people who make everything possible',
      'alignment', 'center'
    ),
    0,
    true
  );

  -- 2. Team Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_team_page_id,
    'team',
    jsonb_build_object(
      'title', '',
      'subtitle', '',
      'columns', 4
    ),
    10,
    true
  );

END $$;

-- =============================================
-- STEP 6: SEED CONTACT PAGE
-- =============================================

DO $$
DECLARE
  v_contact_page_id UUID;
BEGIN
  SELECT id INTO v_contact_page_id FROM public.pages WHERE slug = 'contact';

  -- 1. Hero Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_contact_page_id,
    'hero',
    jsonb_build_object(
      'headline', 'Get In Touch',
      'subheadline', 'Have a project in mind? We''d love to hear from you. Send us a message and we''ll respond as soon as possible.',
      'alignment', 'center'
    ),
    0,
    true
  );

  -- 2. Contact Info Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_contact_page_id,
    'contact_info',
    jsonb_build_object(
      'title', 'Contact Information',
      'showFromSettings', true
    ),
    10,
    true
  );

  -- 3. Contact Form Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_contact_page_id,
    'contact_form',
    jsonb_build_object(
      'title', 'Send Us a Message'
    ),
    20,
    true
  );

END $$;

-- =============================================
-- STEP 7: SEED BLOG PAGE
-- =============================================

DO $$
DECLARE
  v_blog_page_id UUID;
BEGIN
  SELECT id INTO v_blog_page_id FROM public.pages WHERE slug = 'blog';

  -- 1. Hero Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_blog_page_id,
    'hero',
    jsonb_build_object(
      'headline', 'Our Blog',
      'subheadline', 'Insights, tutorials, and industry news from our team',
      'alignment', 'center'
    ),
    0,
    true
  );

  -- 2. Category Filter Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_blog_page_id,
    'category_filter',
    jsonb_build_object(
      'style', 'pills',
      'showAll', true
    ),
    10,
    true
  );

  -- 3. Blog Grid Block
  INSERT INTO public.page_sections (page_id, block_type, content, sort_order, is_visible)
  VALUES (
    v_blog_page_id,
    'blog_grid',
    jsonb_build_object(
      'layout', 'grid',
      'postsPerPage', 9
    ),
    20,
    true
  );

END $$;

-- =============================================
-- VERIFICATION
-- =============================================

-- Count page_sections created
SELECT
  p.title,
  COUNT(ps.id) as sections_count
FROM public.pages p
LEFT JOIN public.page_sections ps ON ps.page_id = p.id
WHERE p.is_system_page = true
GROUP BY p.title
ORDER BY p.title;

-- =============================================
-- ROLLBACK SCRIPT (if needed)
-- =============================================
-- To rollback this migration:
-- DELETE FROM public.page_sections WHERE page_id IN (SELECT id FROM public.pages WHERE is_system_page = true);
-- DELETE FROM public.pages WHERE is_system_page = true;
