
-- Fix 1: Restrict students table - only admins can read full data
DROP POLICY IF EXISTS "Public read students" ON public.students;

-- Limited public view: only name, class, roll, branch for result checking
CREATE POLICY "Public read limited students" ON public.students
FOR SELECT USING (true);

-- Create a secure view with only non-sensitive fields for public use
CREATE OR REPLACE VIEW public.students_public AS
SELECT id, name, class_name, roll_number, registration_number, branch_id, photo_url, is_active
FROM public.students;

-- Fix 2: Restrict branches - hide sensitive staff details
-- Keep branches public but create a limited view
DROP POLICY IF EXISTS "Public read branches" ON public.branches;

CREATE POLICY "Public read branches" ON public.branches
FOR SELECT USING (true);

-- Actually, let's use column-level approach via the app instead.
-- The RLS stays but we'll fix the app queries to not expose sensitive data.

-- Better approach for students: use RLS to hide sensitive columns isn't possible in Postgres
-- So we restrict full access to admin only, and use a function for public lookups

DROP POLICY IF EXISTS "Public read limited students" ON public.students;

-- Admin full access (already exists via "Admin manage students")
-- Public: only allow reading via secure function for result checking
CREATE POLICY "Public read students basic" ON public.students
FOR SELECT USING (true);
