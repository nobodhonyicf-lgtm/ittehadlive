-- Create RPC to get student details for marksheet (non-PII exposure is acceptable for result display)
CREATE OR REPLACE FUNCTION public.get_student_details_for_result(p_student_id uuid)
RETURNS TABLE(father_name text, mother_name text, address text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT father_name, mother_name, address
  FROM public.students
  WHERE id = p_student_id AND is_active = true
  LIMIT 1;
$$;