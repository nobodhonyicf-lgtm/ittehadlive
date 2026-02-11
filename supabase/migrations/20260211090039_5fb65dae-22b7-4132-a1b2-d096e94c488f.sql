
-- Notifications table for admin-sent notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  image_url TEXT,
  link TEXT,
  target TEXT NOT NULL DEFAULT 'all',
  target_value TEXT,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Device tokens for FCM
CREATE TABLE public.device_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android',
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- Notifications: public read, admin manage
CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (is_sent = true);
CREATE POLICY "Admin manage notifications" ON public.notifications FOR ALL USING (is_admin());

-- Device tokens: anyone can register, admin can read all
CREATE POLICY "Anyone can register token" ON public.device_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own token" ON public.device_tokens FOR UPDATE USING (true);
CREATE POLICY "Admin read tokens" ON public.device_tokens FOR SELECT USING (is_admin());
CREATE POLICY "Admin delete tokens" ON public.device_tokens FOR DELETE USING (is_admin());
