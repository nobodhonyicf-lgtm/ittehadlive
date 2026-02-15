
-- Create admin_permissions table for granular role-based access control
CREATE TABLE public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL,
  section_key text NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_edit boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(role_name, section_key)
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage permissions" ON public.admin_permissions
FOR ALL USING (is_admin());

CREATE POLICY "Admin read permissions" ON public.admin_permissions
FOR SELECT USING (is_admin());

-- Insert default admin permissions (full access)
INSERT INTO public.admin_permissions (role_name, section_key, can_view, can_edit, can_delete) VALUES
('admin', 'analytics', true, true, true),
('admin', 'posts', true, true, true),
('admin', 'photo-card', true, true, true),
('admin', 'pages', true, true, true),
('admin', 'notices', true, true, true),
('admin', 'branches', true, true, true),
('admin', 'students', true, true, true),
('admin', 'exams', true, true, true),
('admin', 'subjects', true, true, true),
('admin', 'results', true, true, true),
('admin', 'polls', true, true, true),
('admin', 'prayer-times', true, true, true),
('admin', 'books', true, true, true),
('admin', 'book-orders', true, true, true),
('admin', 'book-reviews', true, true, true),
('admin', 'ads', true, true, true),
('admin', 'videos', true, true, true),
('admin', 'leaders', true, true, true),
('admin', 'committee', true, true, true),
('admin', 'gallery', true, true, true),
('admin', 'sliders', true, true, true),
('admin', 'menu', true, true, true),
('admin', 'categories', true, true, true),
('admin', 'contacts', true, true, true),
('admin', 'users', true, true, true),
('admin', 'email', true, true, true),
('admin', 'sms', true, true, true),
('admin', 'settings', true, true, true);
