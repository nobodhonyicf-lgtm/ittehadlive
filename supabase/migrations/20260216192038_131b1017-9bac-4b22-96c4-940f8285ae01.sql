
-- Fix: Allow admins to insert notifications (the current policy uses is_admin() which is correct,
-- but there might be a mismatch. Let's drop and recreate the INSERT policy properly)
DROP POLICY IF EXISTS "Role edit notifications" ON public.notifications;

CREATE POLICY "Role edit notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (is_admin());
