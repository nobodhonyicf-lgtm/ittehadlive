-- Drop existing restrictive policies on contact_submissions
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
DROP POLICY IF EXISTS "Role delete contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Role update contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "Role view contacts" ON public.contact_submissions;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Anyone can submit contact"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Role view contacts"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (has_section_permission('contacts'::text, 'view'::text));

CREATE POLICY "Role update contacts"
ON public.contact_submissions
FOR UPDATE
TO authenticated
USING (has_section_permission('contacts'::text, 'edit'::text));

CREATE POLICY "Role delete contacts"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (has_section_permission('contacts'::text, 'delete'::text));