
DROP FUNCTION IF EXISTS public.get_branches_public();

CREATE FUNCTION public.get_branches_public()
 RETURNS TABLE(id uuid, name text, code text, address text, image_url text, sort_order integer, is_active boolean, created_at timestamp with time zone, head_name text, head_photo_url text, phone text, email text, website text, total_teachers integer, total_students integer, description text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, name, code, address, image_url, sort_order, is_active, created_at, head_name, head_photo_url, phone, email, website, total_teachers, total_students, description
  FROM public.branches
  WHERE is_active = true;
$function$;
