
-- Certificates table for student certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  certificate_number text NOT NULL UNIQUE,
  verification_code text NOT NULL UNIQUE,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add verification_code columns to branches and teachers
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS verification_code text UNIQUE;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS verification_code text UNIQUE;

-- Add verification_code to results  
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS verification_code text UNIQUE;

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Public can read certificates (for verification)
CREATE POLICY "Public read certificates" ON public.certificates FOR SELECT USING (true);

-- Admin can manage certificates
CREATE POLICY "Role edit certificates" ON public.certificates FOR INSERT WITH CHECK (has_section_permission('results', 'edit'));
CREATE POLICY "Role update certificates" ON public.certificates FOR UPDATE USING (has_section_permission('results', 'edit'));
CREATE POLICY "Role delete certificates" ON public.certificates FOR DELETE USING (has_section_permission('results', 'delete'));

-- Function to auto-generate verification codes for branches
CREATE OR REPLACE FUNCTION public.generate_branch_verification_code()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := 'BR-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_branch_verification_code
  BEFORE INSERT ON public.branches
  FOR EACH ROW EXECUTE FUNCTION generate_branch_verification_code();

-- Function to auto-generate verification codes for teachers
CREATE OR REPLACE FUNCTION public.generate_teacher_verification_code()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := 'TC-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_teacher_verification_code
  BEFORE INSERT ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION generate_teacher_verification_code();

-- Function to auto-generate verification codes for results
CREATE OR REPLACE FUNCTION public.generate_result_verification_code()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := 'RS-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 6));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_result_verification_code
  BEFORE INSERT ON public.results
  FOR EACH ROW EXECUTE FUNCTION generate_result_verification_code();

-- Function to auto-generate certificate numbers
CREATE OR REPLACE FUNCTION public.generate_certificate_code()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.certificate_number IS NULL THEN
    NEW.certificate_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  END IF;
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := 'CV-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_certificate_code
  BEFORE INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION generate_certificate_code();

-- Backfill existing branches with verification codes
UPDATE public.branches SET verification_code = 'BR-' || TO_CHAR(created_at, 'YYMM') || '-' || UPPER(SUBSTRING(id::text FROM 1 FOR 6)) WHERE verification_code IS NULL;

-- Backfill existing teachers with verification codes
UPDATE public.teachers SET verification_code = 'TC-' || TO_CHAR(created_at, 'YYMM') || '-' || UPPER(SUBSTRING(id::text FROM 1 FOR 6)) WHERE verification_code IS NULL;

-- Backfill existing results with verification codes
UPDATE public.results SET verification_code = 'RS-' || TO_CHAR(created_at, 'YYMM') || '-' || UPPER(SUBSTRING(id::text FROM 1 FOR 6)) WHERE verification_code IS NULL;
