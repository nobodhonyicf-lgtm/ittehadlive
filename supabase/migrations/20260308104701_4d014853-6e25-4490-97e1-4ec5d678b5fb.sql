
-- Drop all existing RESTRICTIVE policies on push_subscriptions
DROP POLICY IF EXISTS "Admin read push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can subscribe to push" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can update push subscription" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone read own subscription" ON public.push_subscriptions;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Anyone can read push subscriptions" ON public.push_subscriptions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert push subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update push subscriptions" ON public.push_subscriptions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete push subscriptions" ON public.push_subscriptions FOR DELETE USING (true);
