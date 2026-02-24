-- =============================================
-- COMPLETE CMS DATABASE SETUP
-- Run this on a fresh Supabase project
-- =============================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- Create blog post status enum
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'scheduled');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- USER ROLES TABLE (CRITICAL FOR SECURITY)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'NexaTech Solutions',
  tagline TEXT,
  logo_url TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  github_url TEXT,
  default_seo_title TEXT,
  default_seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PAGES TABLE
-- =============================================
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_system_page BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PAGE SECTIONS TABLE
-- =============================================
CREATE TABLE public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MENU ITEMS TABLE
-- =============================================
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT,
  page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  menu_location TEXT NOT NULL DEFAULT 'header',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SERVICES TABLE
-- =============================================
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  short_description TEXT,
  content TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PORTFOLIO ITEMS TABLE
-- =============================================
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  client TEXT,
  industry TEXT,
  tech_stack TEXT[],
  short_description TEXT,
  content TEXT,
  featured_image TEXT,
  highlights TEXT[],
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  completed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PORTFOLIO IMAGES TABLE
-- =============================================
CREATE TABLE public.portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- TEAM MEMBERS TABLE
-- =============================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- TAGS TABLE
-- =============================================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status post_status NOT NULL DEFAULT 'draft',
  publish_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- POST TAGS JUNCTION TABLE
-- =============================================
CREATE TABLE public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

-- =============================================
-- TESTIMONIALS TABLE
-- =============================================
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CLIENT LOGOS TABLE
-- =============================================
CREATE TABLE public.client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MEDIA ASSETS TABLE
-- =============================================
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CONTACT SUBMISSIONS TABLE
-- =============================================
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CONTACT FORM FIELDS TABLE
-- =============================================
CREATE TABLE public.contact_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_type TEXT NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- HOME SECTIONS TABLE
-- =============================================
CREATE TABLE public.home_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL UNIQUE CHECK (section_type IN ('hero', 'stats_intro', 'services_intro', 'portfolio_intro', 'cta')),
  content JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- HOME STATS TABLE
-- =============================================
CREATE TABLE public.home_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ABOUT SECTIONS TABLE
-- =============================================
CREATE TABLE public.about_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL UNIQUE CHECK (section_type IN ('hero', 'story', 'values_intro', 'timeline_intro', 'why_choose')),
  content JSONB NOT NULL DEFAULT '{}',
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ABOUT VALUES TABLE
-- =============================================
CREATE TABLE public.about_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ABOUT TIMELINE TABLE
-- =============================================
CREATE TABLE public.about_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_published ON public.pages(is_published);
CREATE INDEX idx_services_slug ON public.services(slug);
CREATE INDEX idx_services_published ON public.services(is_published);
CREATE INDEX idx_portfolio_slug ON public.portfolio_items(slug);
CREATE INDEX idx_portfolio_published ON public.portfolio_items(is_published);
CREATE INDEX idx_blog_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_status ON public.blog_posts(status);
CREATE INDEX idx_blog_publish_date ON public.blog_posts(publish_date);
CREATE INDEX idx_page_sections_page ON public.page_sections(page_id);
CREATE INDEX idx_menu_items_location ON public.menu_items(menu_location);
CREATE INDEX idx_home_stats_sort_order ON public.home_stats(sort_order);
CREATE INDEX idx_about_values_sort_order ON public.about_values(sort_order);
CREATE INDEX idx_about_timeline_sort_order ON public.about_timeline(sort_order);

-- =============================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECK
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is admin or editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$$;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - PROFILES
-- =============================================
CREATE POLICY "Profiles viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- RLS POLICIES - USER ROLES
-- =============================================
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - SITE SETTINGS
-- =============================================
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - PAGES
-- =============================================
CREATE POLICY "Published pages viewable by everyone" ON public.pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins/editors can view all pages" ON public.pages
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage pages" ON public.pages
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - PAGE SECTIONS
-- =============================================
CREATE POLICY "Sections of published pages viewable" ON public.page_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_sections.page_id
      AND pages.is_published = true
    )
  );

CREATE POLICY "Admins/editors can view all sections" ON public.page_sections
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage sections" ON public.page_sections
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - MENU ITEMS
-- =============================================
CREATE POLICY "Enabled menu items viewable by everyone" ON public.menu_items
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins/editors can view all menu items" ON public.menu_items
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage menu items" ON public.menu_items
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - SERVICES
-- =============================================
CREATE POLICY "Published services viewable by everyone" ON public.services
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins/editors can view all services" ON public.services
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage services" ON public.services
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - PORTFOLIO
-- =============================================
CREATE POLICY "Published portfolio viewable by everyone" ON public.portfolio_items
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins/editors can view all portfolio" ON public.portfolio_items
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage portfolio" ON public.portfolio_items
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- Portfolio images follow parent item visibility
CREATE POLICY "Portfolio images viewable when parent published" ON public.portfolio_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_items
      WHERE portfolio_items.id = portfolio_images.portfolio_id
      AND portfolio_items.is_published = true
    )
  );

CREATE POLICY "Admins/editors can view all portfolio images" ON public.portfolio_images
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage portfolio images" ON public.portfolio_images
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - TEAM MEMBERS
-- =============================================
CREATE POLICY "Published team members viewable" ON public.team_members
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins/editors can view all team members" ON public.team_members
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage team members" ON public.team_members
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - CATEGORIES & TAGS
-- =============================================
CREATE POLICY "Categories viewable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors can manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Tags viewable by everyone" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors can manage tags" ON public.tags
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - BLOG POSTS
-- =============================================
CREATE POLICY "Published posts viewable" ON public.blog_posts
  FOR SELECT USING (status = 'published' AND publish_date <= now());

CREATE POLICY "Admins/editors can view all posts" ON public.blog_posts
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Post tags viewable" ON public.post_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins/editors can manage post tags" ON public.post_tags
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - TESTIMONIALS
-- =============================================
CREATE POLICY "Published testimonials viewable" ON public.testimonials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins/editors can view all testimonials" ON public.testimonials
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - CLIENT LOGOS
-- =============================================
CREATE POLICY "Published client logos viewable" ON public.client_logos
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins/editors can view all logos" ON public.client_logos
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage logos" ON public.client_logos
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - MEDIA ASSETS
-- =============================================
CREATE POLICY "Media viewable by authenticated" ON public.media_assets
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins/editors can manage media" ON public.media_assets
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - CONTACT SUBMISSIONS
-- =============================================
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins/editors can view submissions" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins/editors can manage submissions" ON public.contact_submissions
  FOR ALL TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- RLS POLICIES - CONTACT FORM FIELDS
-- =============================================
CREATE POLICY "Form fields viewable by everyone" ON public.contact_form_fields
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage form fields" ON public.contact_form_fields
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS POLICIES - HOME SECTIONS
-- =============================================
CREATE POLICY "Allow public read access on home_sections"
  ON public.home_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on home_sections"
  ON public.home_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES - HOME STATS
-- =============================================
CREATE POLICY "Allow public read access on home_stats"
  ON public.home_stats FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on home_stats"
  ON public.home_stats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES - ABOUT SECTIONS
-- =============================================
CREATE POLICY "Allow public read access on about_sections"
  ON public.about_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on about_sections"
  ON public.about_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES - ABOUT VALUES
-- =============================================
CREATE POLICY "Allow public read access on about_values"
  ON public.about_values FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on about_values"
  ON public.about_values FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- =============================================
-- RLS POLICIES - ABOUT TIMELINE
-- =============================================
CREATE POLICY "Allow public read access on about_timeline"
  ON public.about_timeline FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on about_timeline"
  ON public.about_timeline FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contact_form_fields
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.home_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.home_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.about_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.about_values
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.about_timeline
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- AUTO-ASSIGN ADMIN ROLE TO FIRST USER
-- =============================================
CREATE OR REPLACE FUNCTION public.auto_assign_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If no admin exists yet, make this user an admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_assign_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_first_admin();

-- =============================================
-- STORAGE BUCKET FOR MEDIA
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Media files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Admins/editors can delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

-- =============================================
-- SEED DATA - HOME & ABOUT CONTENT
-- =============================================

-- Home Hero Section
INSERT INTO public.home_sections (section_type, content, is_visible) VALUES
('hero', '{
  "headline": "Transforming Ideas into Digital Reality",
  "subheadline": "We build cutting-edge software solutions that drive business growth. From web applications to AI integration, we turn your vision into reality.",
  "primaryButtonText": "Start Your Project",
  "primaryButtonUrl": "/contact",
  "secondaryButtonText": "View Our Work",
  "secondaryButtonUrl": "/portfolio"
}', true);

-- Home Stats Intro
INSERT INTO public.home_sections (section_type, content, is_visible) VALUES
('stats_intro', '{}', true);

-- Home Services Intro
INSERT INTO public.home_sections (section_type, content, is_visible) VALUES
('services_intro', '{
  "title": "Our Services",
  "description": "We offer comprehensive software development services tailored to your business needs."
}', true);

-- Home Portfolio Intro
INSERT INTO public.home_sections (section_type, content, is_visible) VALUES
('portfolio_intro', '{
  "title": "Featured Projects",
  "description": "Discover how we'\''ve helped businesses transform their digital presence."
}', true);

-- Home CTA Section
INSERT INTO public.home_sections (section_type, content, is_visible) VALUES
('cta', '{
  "title": "Ready to Build Something Amazing?",
  "description": "Let'\''s discuss your project and see how we can help you achieve your goals. Get a free consultation today.",
  "buttonText": "Get In Touch",
  "buttonUrl": "/contact"
}', true);

-- Home Stats
INSERT INTO public.home_stats (value, label, sort_order) VALUES
('150+', 'Projects Delivered', 0),
('50+', 'Happy Clients', 1),
('10+', 'Years Experience', 2),
('25+', 'Team Members', 3);

-- About Hero Section
INSERT INTO public.about_sections (section_type, content, is_visible) VALUES
('hero', '{
  "title": "About {site_name}",
  "description": "We'\''re a team of passionate developers, designers, and strategists dedicated to crafting exceptional digital experiences."
}', true);

-- About Story Section
INSERT INTO public.about_sections (section_type, content, is_visible) VALUES
('story', '{
  "title": "Our Story",
  "paragraph1": "Founded in 2014, {site_name} began with a simple mission: to help businesses harness the power of technology to achieve their goals.",
  "paragraph2": "What started as a small team of passionate developers has grown into a full-service software development company, serving clients across the globe. We'\''ve had the privilege of working with startups, SMEs, and enterprise organizations, delivering solutions that drive real business value.",
  "paragraph3": "Today, we continue to push boundaries, embracing new technologies like AI, cloud computing, and modern frameworks to deliver cutting-edge solutions for our clients.",
  "yearsExperience": "10+",
  "projectsCompleted": "150+"
}', true);

-- About Values Intro
INSERT INTO public.about_sections (section_type, content, is_visible) VALUES
('values_intro', '{
  "title": "Our Values",
  "description": "The principles that guide everything we do."
}', true);

-- About Timeline Intro
INSERT INTO public.about_sections (section_type, content, is_visible) VALUES
('timeline_intro', '{
  "title": "Our Journey",
  "description": "Key milestones that have shaped who we are today."
}', true);

-- About Why Choose Us
INSERT INTO public.about_sections (section_type, content, is_visible) VALUES
('why_choose', '{
  "title": "Why Choose Us",
  "reasons": [
    "Expert team with 10+ years of combined experience",
    "Transparent communication throughout the project",
    "Agile methodology for faster delivery",
    "Post-launch support and maintenance",
    "Competitive pricing without compromising quality",
    "Proven track record of 150+ successful projects"
  ],
  "stats": {
    "clientSatisfaction": "98%",
    "projectsCompleted": "150+",
    "happyClients": "50+",
    "supportAvailable": "24/7"
  }
}', true);

-- About Values
INSERT INTO public.about_values (icon, title, description, sort_order) VALUES
('target', 'Innovation First', 'We embrace cutting-edge technologies to deliver forward-thinking solutions.', 0),
('heart', 'Client-Centric', 'Your success is our priority. We work closely with you to understand and exceed expectations.', 1),
('users', 'Collaborative Spirit', 'We believe in the power of teamwork, both within our team and with our clients.', 2),
('award', 'Quality Excellence', 'We maintain the highest standards in code quality, security, and performance.', 3);

-- About Timeline
INSERT INTO public.about_timeline (year, title, description, sort_order) VALUES
('2014', 'Company Founded', 'Started with a vision to transform how businesses leverage technology.', 0),
('2016', 'First Major Client', 'Secured our first enterprise client, marking a significant milestone.', 1),
('2018', 'Team Expansion', 'Grew to 15+ talented developers and designers.', 2),
('2020', 'Global Reach', 'Started serving clients across North America, Europe, and Asia.', 3),
('2022', '100+ Projects', 'Celebrated our 100th successful project delivery.', 4),
('2024', 'AI Integration', 'Launched dedicated AI and machine learning service offerings.', 5);

-- Contact Form Fields (Default)
INSERT INTO public.contact_form_fields (field_type, label, placeholder, is_required, sort_order) VALUES
('text', 'Name', 'John Doe', true, 0),
('email', 'Email', 'john@example.com', true, 1),
('tel', 'Phone', '+1 (555) 123-4567', false, 2),
('text', 'Company', 'Your Company', false, 3),
('text', 'Subject', 'How can we help?', false, 4),
('textarea', 'Message', 'Tell us about your project...', true, 5);
