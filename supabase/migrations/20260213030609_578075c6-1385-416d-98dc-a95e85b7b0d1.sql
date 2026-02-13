
-- Drop the insecure security definer view
DROP VIEW IF EXISTS public.students_public;

-- Recreate with security_invoker
CREATE VIEW public.students_public
WITH (security_invoker=on) AS
SELECT id, name, class_name, roll_number, registration_number, branch_id, photo_url, is_active
FROM public.students;

-- Restrict base students table: no public direct access, admin only
DROP POLICY IF EXISTS "Public read students basic" ON public.students;
CREATE POLICY "Admin read students" ON public.students
FOR SELECT USING (is_admin());

-- Create secure branches view (exclude sensitive fields)
CREATE VIEW public.branches_public
WITH (security_invoker=on) AS
SELECT id, name, code, address, image_url, sort_order, is_active, created_at
FROM public.branches;

-- Restrict base branches table: admin only for full data
DROP POLICY IF EXISTS "Public read branches" ON public.branches;
CREATE POLICY "Admin read branches" ON public.branches
FOR SELECT USING (is_admin());
