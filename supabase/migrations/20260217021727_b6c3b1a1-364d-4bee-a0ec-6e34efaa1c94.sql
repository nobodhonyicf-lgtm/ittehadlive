
-- Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Role edit notifications" ON public.notifications;
DROP POLICY IF EXISTS "Role update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Role delete notifications" ON public.notifications;
DROP POLICY IF EXISTS "Public read notifications" ON public.notifications;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admin insert notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin update notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (is_admin());

CREATE POLICY "Admin delete notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (is_admin());

CREATE POLICY "Public read sent notifications" ON public.notifications
  FOR SELECT
  USING (is_sent = true);

CREATE POLICY "Admin read all notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (is_admin());
