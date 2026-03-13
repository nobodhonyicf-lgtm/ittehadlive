CREATE OR REPLACE FUNCTION public.find_student_by_roll_reg(p_roll text, p_reg text)
RETURNS TABLE(id uuid, name text, class_name text, roll_number text, registration_number text, branch_id uuid, photo_url text, father_name text, mother_name text, address text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, name, class_name, roll_number, registration_number, branch_id, photo_url, father_name, mother_name, address
  FROM public.students
  WHERE TRIM(roll_number) = TRIM(p_roll)
    AND TRIM(COALESCE(registration_number, '')) = TRIM(p_reg)
    AND is_active = true
  LIMIT 1;
$$;