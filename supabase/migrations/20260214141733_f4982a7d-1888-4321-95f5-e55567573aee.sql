
-- Add SEO fields to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS summary text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_caption text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS og_image_url text;

-- Add SEO-related site settings
INSERT INTO public.site_settings (key, value) VALUES 
  ('default_og_image', ''),
  ('meta_keywords', ''),
  ('google_analytics_id', ''),
  ('facebook_page_url', ''),
  ('twitter_handle', '')
ON CONFLICT DO NOTHING;
