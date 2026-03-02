
-- Teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  district TEXT,
  subject TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  specialization TEXT,
  certification TEXT,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  preferred_area TEXT,
  expected_salary TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active teachers" ON public.teachers FOR SELECT USING (is_active = true);
CREATE POLICY "Role edit teachers" ON public.teachers FOR INSERT WITH CHECK (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role update teachers" ON public.teachers FOR UPDATE USING (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role delete teachers" ON public.teachers FOR DELETE USING (has_section_permission('teachers', 'delete'));

-- Teacher Applications table
CREATE TABLE public.teacher_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  district TEXT,
  subject TEXT NOT NULL,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  specialization TEXT,
  certification TEXT,
  bio TEXT,
  photo_url TEXT,
  cv_url TEXT,
  preferred_area TEXT,
  expected_salary TEXT,
  reference_name TEXT,
  reference_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teacher_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can apply" ON public.teacher_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Role view applications" ON public.teacher_applications FOR SELECT USING (has_section_permission('teachers', 'view'));
CREATE POLICY "Role update applications" ON public.teacher_applications FOR UPDATE USING (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role delete applications" ON public.teacher_applications FOR DELETE USING (has_section_permission('teachers', 'delete'));

-- Job Postings table
CREATE TABLE public.job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  qualification_required TEXT,
  experience_required TEXT,
  salary_range TEXT,
  location TEXT,
  branch_id UUID REFERENCES public.branches(id),
  deadline DATE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active job postings" ON public.job_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Role edit job postings" ON public.job_postings FOR INSERT WITH CHECK (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role update job postings" ON public.job_postings FOR UPDATE USING (has_section_permission('teachers', 'edit'));
CREATE POLICY "Role delete job postings" ON public.job_postings FOR DELETE USING (has_section_permission('teachers', 'delete'));
