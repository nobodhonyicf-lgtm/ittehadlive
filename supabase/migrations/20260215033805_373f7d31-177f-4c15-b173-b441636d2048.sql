
-- SMS Templates table
CREATE TABLE public.sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage sms_templates" ON public.sms_templates
FOR ALL USING (is_admin());

CREATE POLICY "Admin read sms_templates" ON public.sms_templates
FOR SELECT USING (is_admin());
