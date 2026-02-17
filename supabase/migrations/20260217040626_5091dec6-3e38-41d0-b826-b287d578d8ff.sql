
-- Add reply columns to contact_submissions
ALTER TABLE public.contact_submissions
ADD COLUMN admin_reply text,
ADD COLUMN replied_at timestamp with time zone;
