
-- Drop the old RLS policy that depends on custom_role_name FIRST
DROP POLICY IF EXISTS "Users read own role permissions" ON public.admin_permissions;

-- Now drop custom_role_name column
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS custom_role_name;

-- Drop the custom_roles table
DROP TABLE IF EXISTS public.custom_roles;

-- Update has_any_role function
CREATE OR REPLACE FUNCTION public.has_any_role()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'moderator', 'editor')
  )
$$;

-- Create new RLS policy using standard role column
CREATE POLICY "Users read own role permissions"
ON public.admin_permissions
FOR SELECT
TO authenticated
USING (
  role_name IN (
    SELECT role::text
    FROM public.user_roles
    WHERE user_id = auth.uid()
  )
);
