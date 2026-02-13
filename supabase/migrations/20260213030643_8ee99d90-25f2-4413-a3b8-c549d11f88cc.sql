
-- Drop security_invoker views (they won't work with admin-only base table)
DROP VIEW IF EXISTS public.students_public;
DROP VIEW IF EXISTS public.branches_public;

-- Create security definer functions for safe public access

-- Safe student lookup (no PII)
CREATE OR REPLACE FUNCTION public.get_students_public()
RETURNS TABLE(
  id uuid,
  name text,
  class_name text,
  roll_number text,
  registration_number text,
  branch_id uuid,
  photo_url text,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, class_name, roll_number, registration_number, branch_id, photo_url, is_active
  FROM public.students
  WHERE is_active = true;
$$;

-- Safe branch lookup (no email/phone/head_name)
CREATE OR REPLACE FUNCTION public.get_branches_public()
RETURNS TABLE(
  id uuid,
  name text,
  code text,
  address text,
  image_url text,
  sort_order integer,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, code, address, image_url, sort_order, is_active, created_at
  FROM public.branches
  WHERE is_active = true;
$$;

-- Student lookup by roll for result checking
CREATE OR REPLACE FUNCTION public.find_student_for_result(p_roll text, p_class text)
RETURNS TABLE(
  id uuid,
  name text,
  class_name text,
  roll_number text,
  registration_number text,
  branch_id uuid,
  photo_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, class_name, roll_number, registration_number, branch_id, photo_url
  FROM public.students
  WHERE roll_number = p_roll AND class_name = p_class AND is_active = true
  LIMIT 1;
$$;
