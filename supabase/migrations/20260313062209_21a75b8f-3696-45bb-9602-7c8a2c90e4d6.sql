-- Make certificate code generation robust for empty strings as well
CREATE OR REPLACE FUNCTION public.generate_certificate_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.certificate_number IS NULL OR btrim(NEW.certificate_number) = '' THEN
    NEW.certificate_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  END IF;

  IF NEW.verification_code IS NULL OR btrim(NEW.verification_code) = '' THEN
    NEW.verification_code := 'CV-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on certificates table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'certificates'
      AND t.tgname = 'trg_certificate_code'
      AND NOT t.tgisinternal
  ) THEN
    CREATE TRIGGER trg_certificate_code
    BEFORE INSERT ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_certificate_code();
  END IF;
END $$;

-- Public lookup + auto-generate certificate by roll/reg for latest published exam with results
CREATE OR REPLACE FUNCTION public.get_or_create_certificate_by_roll_reg(p_roll text, p_reg text)
RETURNS TABLE(
  student_name text,
  father_name text,
  roll_number text,
  registration_number text,
  class_name text,
  exam_name text,
  exam_year integer,
  gpa numeric,
  grade text,
  branch_name text,
  certificate_number text,
  issue_date date,
  verification_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_student public.students%ROWTYPE;
  v_exam_id uuid;
  v_cert public.certificates%ROWTYPE;
  v_avg_gpa numeric := 0;
BEGIN
  SELECT *
  INTO v_student
  FROM public.students s
  WHERE trim(translate(s.roll_number, '০১২৩৪৫৬৭৮৯', '0123456789')) = trim(translate(p_roll, '০১২৩৪৫৬৭৮৯', '0123456789'))
    AND trim(translate(COALESCE(s.registration_number, ''), '০১২৩৪৫৬৭৮৯', '0123456789')) = trim(translate(COALESCE(p_reg, ''), '০১২৩৪৫৬৭৮৯', '0123456789'))
    AND s.is_active = true
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_student.id IS NULL THEN
    RETURN;
  END IF;

  SELECT r.exam_id
  INTO v_exam_id
  FROM public.results r
  JOIN public.exams e ON e.id = r.exam_id
  WHERE r.student_id = v_student.id
    AND e.is_published = true
  GROUP BY r.exam_id, e.year, e.created_at
  ORDER BY e.year DESC, e.created_at DESC
  LIMIT 1;

  IF v_exam_id IS NULL THEN
    RETURN;
  END IF;

  SELECT *
  INTO v_cert
  FROM public.certificates c
  WHERE c.student_id = v_student.id
    AND c.exam_id = v_exam_id
    AND c.status = 'active'
  ORDER BY c.created_at DESC
  LIMIT 1;

  IF v_cert.id IS NULL THEN
    INSERT INTO public.certificates (student_id, exam_id, status, issue_date)
    VALUES (v_student.id, v_exam_id, 'active', CURRENT_DATE)
    RETURNING * INTO v_cert;
  END IF;

  SELECT COALESCE(ROUND(AVG(COALESCE(r.gpa, 0))::numeric, 2), 0)
  INTO v_avg_gpa
  FROM public.results r
  WHERE r.student_id = v_student.id
    AND r.exam_id = v_exam_id;

  RETURN QUERY
  SELECT
    v_student.name,
    COALESCE(v_student.father_name, '—'),
    v_student.roll_number,
    COALESCE(v_student.registration_number, '—'),
    v_student.class_name,
    COALESCE(e.name, '—'),
    COALESCE(e.year, 0),
    COALESCE(v_avg_gpa, 0),
    CASE
      WHEN v_avg_gpa >= 5 THEN 'A+'
      WHEN v_avg_gpa >= 4 THEN 'A'
      WHEN v_avg_gpa >= 3.5 THEN 'A-'
      WHEN v_avg_gpa >= 3 THEN 'B'
      WHEN v_avg_gpa >= 2 THEN 'C'
      WHEN v_avg_gpa >= 1 THEN 'D'
      ELSE 'F'
    END,
    COALESCE(b.name, '—'),
    v_cert.certificate_number,
    v_cert.issue_date,
    v_cert.verification_code
  FROM public.exams e
  LEFT JOIN public.branches b ON b.id = v_student.branch_id
  WHERE e.id = v_exam_id
  LIMIT 1;
END;
$function$;

-- Admin utility: generate missing certificates for published exam results
CREATE OR REPLACE FUNCTION public.generate_missing_certificates()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_inserted integer := 0;
BEGIN
  IF NOT public.has_section_permission('results', 'edit') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  INSERT INTO public.certificates (student_id, exam_id, status, issue_date)
  SELECT sr.student_id, sr.exam_id, 'active', CURRENT_DATE
  FROM (
    SELECT DISTINCT r.student_id, r.exam_id
    FROM public.results r
    JOIN public.students s ON s.id = r.student_id
    JOIN public.exams e ON e.id = r.exam_id
    WHERE s.is_active = true
      AND e.is_published = true
  ) sr
  LEFT JOIN public.certificates c
    ON c.student_id = sr.student_id
   AND c.exam_id = sr.exam_id
   AND c.status = 'active'
  WHERE c.id IS NULL;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  RETURN v_inserted;
END;
$function$;