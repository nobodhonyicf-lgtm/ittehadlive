
-- 1. Page SEO metadata table
CREATE TABLE public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL UNIQUE,
  page_name text NOT NULL,
  meta_title text,
  meta_description text,
  og_image_url text,
  og_title text,
  og_description text,
  keywords text,
  canonical_url text,
  structured_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read page_seo" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "Admin edit page_seo" ON public.page_seo FOR INSERT WITH CHECK (has_section_permission('settings', 'edit'));
CREATE POLICY "Admin update page_seo" ON public.page_seo FOR UPDATE USING (has_section_permission('settings', 'edit'));
CREATE POLICY "Admin delete page_seo" ON public.page_seo FOR DELETE USING (has_section_permission('settings', 'delete'));

-- 2. User activity tracking table
CREATE TABLE public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text,
  device_id text,
  activity_type text NOT NULL,
  activity_data jsonb DEFAULT '{}'::jsonb,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert activity" ON public.user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read activities" ON public.user_activities FOR SELECT USING (has_section_permission('analytics', 'view'));

-- 3. Add institution_id to teachers for affiliation
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.branches(id);
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS institution_logo_url text;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_email ON public.user_activities(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activities_device ON public.user_activities(device_id);
CREATE INDEX IF NOT EXISTS idx_teachers_institution ON public.teachers(institution_id);
