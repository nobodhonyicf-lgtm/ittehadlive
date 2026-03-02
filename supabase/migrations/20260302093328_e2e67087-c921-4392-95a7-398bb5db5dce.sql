
-- Teacher Reviews table
CREATE TABLE public.teacher_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  institution_name TEXT,
  rating INTEGER NOT NULL,
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_reviews ENABLE ROW LEVEL SECURITY;

-- Public can read approved reviews
CREATE POLICY "Public read approved teacher reviews"
  ON public.teacher_reviews FOR SELECT
  USING (is_approved = true);

-- Admin can read all reviews
CREATE POLICY "Admin read all teacher reviews"
  ON public.teacher_reviews FOR SELECT
  USING (has_section_permission('teachers', 'view'));

-- Anyone can submit a review
CREATE POLICY "Anyone can submit teacher review"
  ON public.teacher_reviews FOR INSERT
  WITH CHECK (true);

-- Admin can update reviews
CREATE POLICY "Admin update teacher reviews"
  ON public.teacher_reviews FOR UPDATE
  USING (has_section_permission('teachers', 'edit'));

-- Admin can delete reviews
CREATE POLICY "Admin delete teacher reviews"
  ON public.teacher_reviews FOR DELETE
  USING (has_section_permission('teachers', 'delete'));
