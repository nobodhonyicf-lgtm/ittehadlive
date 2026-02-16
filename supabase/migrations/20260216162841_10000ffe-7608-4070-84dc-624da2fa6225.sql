-- Fix has_any_role() to exclude plain 'user' role without custom_role_name
CREATE OR REPLACE FUNCTION public.has_any_role()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND (role = 'admin' OR custom_role_name IS NOT NULL)
  )
$$;