
-- Create a function to check if user has any admin-level role (admin or custom role)
CREATE OR REPLACE FUNCTION public.has_any_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
  )
$$;
