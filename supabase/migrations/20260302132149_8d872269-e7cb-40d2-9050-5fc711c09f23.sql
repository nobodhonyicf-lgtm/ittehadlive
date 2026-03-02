-- Update the insert policy to require authentication
DROP POLICY IF EXISTS "Anyone can apply" ON public.teacher_applications;
CREATE POLICY "Authenticated users can apply" ON public.teacher_applications
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);