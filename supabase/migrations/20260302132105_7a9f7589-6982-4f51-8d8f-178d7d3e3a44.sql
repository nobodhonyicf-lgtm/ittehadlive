ALTER TABLE public.teacher_applications
ADD COLUMN IF NOT EXISTS nid_image_url text,
ADD COLUMN IF NOT EXISTS verification_video_url text,
ADD COLUMN IF NOT EXISTS user_id uuid;