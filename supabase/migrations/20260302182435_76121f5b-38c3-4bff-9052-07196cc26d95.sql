
CREATE OR REPLACE FUNCTION public.get_quiz_leaderboard()
RETURNS TABLE(user_id uuid, full_name text, avatar_url text, total_score bigint, levels_completed bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    qup.user_id,
    COALESCE(p.full_name, 'অজ্ঞাত') as full_name,
    p.avatar_url,
    COALESCE(SUM(qup.best_score), 0) as total_score,
    COUNT(CASE WHEN qup.is_completed THEN 1 END) as levels_completed
  FROM public.quiz_user_progress qup
  LEFT JOIN public.profiles p ON p.user_id = qup.user_id
  GROUP BY qup.user_id, p.full_name, p.avatar_url
  ORDER BY total_score DESC
  LIMIT 50
$$;
