
-- Create prayer_times table
CREATE TABLE public.prayer_times (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  time_text text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read prayer times" ON public.prayer_times FOR SELECT USING (true);
CREATE POLICY "Admin manage prayer times" ON public.prayer_times FOR ALL USING (is_admin());

-- Insert default prayer times
INSERT INTO public.prayer_times (name, time_text, sort_order) VALUES
  ('ফজর', '৫:১৫', 0),
  ('যোহর', '১২:৩০', 1),
  ('আসর', '৪:১৫', 2),
  ('মাগরিব', '৫:৪৫', 3),
  ('এশা', '৭:১৫', 4);
