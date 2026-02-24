-- =============================================
-- HOME AND ABOUT PAGE SECTIONS
-- =============================================

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
-- RLS POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_timeline ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access on home_sections"
  ON public.home_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on home_stats"
  ON public.home_stats FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on about_sections"
  ON public.about_sections FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on about_values"
  ON public.about_values FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on about_timeline"
  ON public.about_timeline FOR SELECT
  TO public
  USING (true);

-- Admin write access (requires authenticated user with admin role)
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
-- SEED DATA WITH EXISTING CONTENT
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

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_home_stats_sort_order ON public.home_stats(sort_order);
CREATE INDEX idx_about_values_sort_order ON public.about_values(sort_order);
CREATE INDEX idx_about_timeline_sort_order ON public.about_timeline(sort_order);
