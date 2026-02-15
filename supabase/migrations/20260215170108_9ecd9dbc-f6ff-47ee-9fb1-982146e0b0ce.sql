
-- Add custom_role_name column to user_roles for custom role assignment
ALTER TABLE public.user_roles ADD COLUMN custom_role_name text;

-- Create index for faster lookups
CREATE INDEX idx_user_roles_custom_role ON public.user_roles(custom_role_name) WHERE custom_role_name IS NOT NULL;
