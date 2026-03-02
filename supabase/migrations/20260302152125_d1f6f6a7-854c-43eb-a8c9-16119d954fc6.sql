ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS exam_result text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS grade_obtained text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS previous_institution text DEFAULT NULL;