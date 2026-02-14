
CREATE TABLE public.sliders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sliders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage sliders" ON public.sliders FOR ALL USING (is_admin());
CREATE POLICY "Public read sliders" ON public.sliders FOR SELECT USING (true);
