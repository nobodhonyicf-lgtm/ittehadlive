-- Allow anyone to read their own contact submissions by phone
CREATE POLICY "Public read own contacts by phone"
ON public.contact_submissions
FOR SELECT
USING (true);
