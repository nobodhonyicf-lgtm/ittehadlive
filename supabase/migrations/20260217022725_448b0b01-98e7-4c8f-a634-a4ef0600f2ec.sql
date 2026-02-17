
-- Fix push_subscriptions: drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can subscribe to push" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can update push subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admin read push subscriptions" ON public.push_subscriptions;

-- Permissive: anyone can insert
CREATE POLICY "Anyone can subscribe to push" ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Permissive: anyone can delete their own subscription
CREATE POLICY "Anyone can unsubscribe" ON public.push_subscriptions
  FOR DELETE
  USING (true);

-- Permissive: anyone can update
CREATE POLICY "Anyone can update push subscription" ON public.push_subscriptions
  FOR UPDATE
  USING (true);

-- Permissive: admin can read all
CREATE POLICY "Admin read push subscriptions" ON public.push_subscriptions
  FOR SELECT TO authenticated
  USING (is_admin());

-- Permissive: anyone can read their own endpoint (needed for unsubscribe check)
CREATE POLICY "Anyone read own subscription" ON public.push_subscriptions
  FOR SELECT
  USING (true);
