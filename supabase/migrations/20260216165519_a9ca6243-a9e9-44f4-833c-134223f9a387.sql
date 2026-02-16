-- Allow authenticated users with any role to read permissions for their own role
CREATE POLICY "Users read own role permissions"
ON public.admin_permissions
FOR SELECT
TO authenticated
USING (
  role_name IN (
    SELECT COALESCE(custom_role_name, role::text)
    FROM public.user_roles
    WHERE user_id = auth.uid()
  )
);