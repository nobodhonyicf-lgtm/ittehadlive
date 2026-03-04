
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Admin can read all
CREATE POLICY "Admin read subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (has_section_permission('email'::text, 'view'::text));

-- Admin can update
CREATE POLICY "Admin update subscribers" ON public.newsletter_subscribers
  FOR UPDATE USING (has_section_permission('email'::text, 'edit'::text));

-- Admin can delete
CREATE POLICY "Admin delete subscribers" ON public.newsletter_subscribers
  FOR DELETE USING (has_section_permission('email'::text, 'delete'::text));
