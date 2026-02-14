
-- 1. Add author_name to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_name text;

-- 2. Add parent_id to categories for subcategories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. Add extra fields to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS mother_name text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS nid text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS blood_group text;

-- 4. Add logo_url and favicon_url to site_settings if not exists
INSERT INTO public.site_settings (key, value) VALUES ('logo_url', '') ON CONFLICT DO NOTHING;
INSERT INTO public.site_settings (key, value) VALUES ('favicon_url', '') ON CONFLICT DO NOTHING;
INSERT INTO public.site_settings (key, value) VALUES ('primary_color', '#1a7a3a') ON CONFLICT DO NOTHING;

-- 5. Create page_views table for analytics
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  visitor_id text,
  referrer text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views
CREATE POLICY "Anyone can log page views" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Admin can read page views
CREATE POLICY "Admin read page views" ON public.page_views
  FOR SELECT USING (is_admin());

-- Admin can manage page views
CREATE POLICY "Admin manage page views" ON public.page_views
  FOR ALL USING (is_admin());
