
-- Add new columns to branches table
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS head_photo_url text;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS total_teachers integer DEFAULT 0;
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS total_students integer DEFAULT 0;

-- Drop and recreate get_branches_public with new columns
DROP FUNCTION IF EXISTS public.get_branches_public();

CREATE FUNCTION public.get_branches_public()
 RETURNS TABLE(id uuid, name text, code text, address text, image_url text, sort_order integer, is_active boolean, created_at timestamp with time zone, head_name text, head_photo_url text, phone text, email text, website text, total_teachers integer, total_students integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, name, code, address, image_url, sort_order, is_active, created_at, head_name, head_photo_url, phone, email, website, total_teachers, total_students
  FROM public.branches
  WHERE is_active = true;
$function$;

-- Create committee_members table
CREATE TABLE public.committee_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  title text NOT NULL,
  institution text,
  photo_url text,
  page_slug text NOT NULL DEFAULT 'committee',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read committee members" ON public.committee_members FOR SELECT USING (true);
CREATE POLICY "Admin manage committee members" ON public.committee_members FOR ALL USING (is_admin());
