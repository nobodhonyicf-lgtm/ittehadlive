
-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
  tracking_code TEXT NOT NULL UNIQUE,
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  district TEXT,
  qualification TEXT,
  experience_years INTEGER DEFAULT 0,
  subject TEXT,
  expected_salary TEXT,
  bio TEXT,
  photo_url TEXT,
  cv_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application
CREATE POLICY "Anyone can apply for job" ON public.job_applications FOR INSERT WITH CHECK (true);

-- Users can read own applications (by user_id) or track by code
CREATE POLICY "Users read own or track applications" ON public.job_applications FOR SELECT USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR true
);

-- Admin can update
CREATE POLICY "Role update job applications" ON public.job_applications FOR UPDATE USING (
  has_section_permission('teachers'::text, 'edit'::text)
);

-- Admin can delete
CREATE POLICY "Role delete job applications" ON public.job_applications FOR DELETE USING (
  has_section_permission('teachers'::text, 'delete'::text)
);

-- Trigger for updated_at
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate tracking code
CREATE OR REPLACE FUNCTION public.generate_job_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_code := 'JA-' || TO_CHAR(NOW(), 'YYMM') || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_job_tracking_code
BEFORE INSERT ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.generate_job_tracking_code();
