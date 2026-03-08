
DROP POLICY IF EXISTS "Anyone can delete push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can insert push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can read push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Anyone can update push subscriptions" ON public.push_subscriptions;

CREATE POLICY "push_sub_select" ON public.push_subscriptions FOR SELECT USING (true);
CREATE POLICY "push_sub_insert" ON public.push_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "push_sub_update" ON public.push_subscriptions FOR UPDATE USING (true);
CREATE POLICY "push_sub_delete" ON public.push_subscriptions FOR DELETE USING (true);
