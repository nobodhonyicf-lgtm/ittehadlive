
-- Gallery table for photo gallery management
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Admin manage gallery" ON public.gallery FOR ALL USING (is_admin());

-- Add site setting for photo card ad toggle
INSERT INTO public.site_settings (key, value) VALUES ('photocard_ad_enabled', 'false') ON CONFLICT DO NOTHING;
INSERT INTO public.site_settings (key, value) VALUES ('photocard_ad_image', '') ON CONFLICT DO NOTHING;
