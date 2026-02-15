
-- Create custom_roles table for managing role names
CREATE TABLE public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manage custom_roles" ON public.custom_roles
FOR ALL USING (is_admin());

CREATE POLICY "Admin read custom_roles" ON public.custom_roles
FOR SELECT USING (is_admin());

-- Insert default system roles
INSERT INTO public.custom_roles (role_name, display_name, description, is_system) VALUES
('admin', 'এডমিন', 'সকল অনুমতি সহ পূর্ণ এক্সেস', true),
('user', 'ইউজার', 'সাধারণ ইউজার, সীমিত এক্সেস', true);
