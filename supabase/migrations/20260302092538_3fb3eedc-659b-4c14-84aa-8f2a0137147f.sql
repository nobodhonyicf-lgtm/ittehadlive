
-- Fix teachers table: drop RESTRICTIVE policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public read active teachers" ON public.teachers;
DROP POLICY IF EXISTS "Role delete teachers" ON public.teachers;
DROP POLICY IF EXISTS "Role edit teachers" ON public.teachers;
DROP POLICY IF EXISTS "Role update teachers" ON public.teachers;

CREATE POLICY "Public read active teachers" ON public.teachers FOR SELECT USING (is_active = true);
CREATE POLICY "Role delete teachers" ON public.teachers FOR DELETE USING (has_section_permission('teachers', 'delete'));
CREATE POLICY "Role edit teachers" ON public.teachers FOR INSERT WITH CHECK (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role update teachers" ON public.teachers FOR UPDATE USING (has_section_permission('teachers', 'edit'));

-- Also fix job_postings table
DROP POLICY IF EXISTS "Public read active job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Role delete job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Role edit job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Role update job postings" ON public.job_postings;

CREATE POLICY "Public read active job postings" ON public.job_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Role delete job postings" ON public.job_postings FOR DELETE USING (has_section_permission('teachers', 'delete'));
CREATE POLICY "Role edit job postings" ON public.job_postings FOR INSERT WITH CHECK (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role update job postings" ON public.job_postings FOR UPDATE USING (has_section_permission('teachers', 'edit'));

-- Fix teacher_applications table
DROP POLICY IF EXISTS "Anyone can apply" ON public.teacher_applications;
DROP POLICY IF EXISTS "Role delete applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Role update applications" ON public.teacher_applications;
DROP POLICY IF EXISTS "Role view applications" ON public.teacher_applications;

CREATE POLICY "Anyone can apply" ON public.teacher_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Role delete applications" ON public.teacher_applications FOR DELETE USING (has_section_permission('teachers', 'delete'));
CREATE POLICY "Role update applications" ON public.teacher_applications FOR UPDATE USING (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role view applications" ON public.teacher_applications FOR SELECT USING (has_section_permission('teachers', 'view'));

-- Add teachers section to admin_permissions for admin role
INSERT INTO public.admin_permissions (role_name, section_key, can_view, can_edit, can_delete)
VALUES ('admin', 'teachers', true, true, true)
ON CONFLICT DO NOTHING;
