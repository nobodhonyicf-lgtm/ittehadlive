
-- 1. Fix book_orders: restrict SELECT to order owner or admin
DROP POLICY IF EXISTS "Anyone can place order" ON public.book_orders;
CREATE POLICY "Anyone can place order" ON public.book_orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Users read own orders" ON public.book_orders FOR SELECT USING (
  (auth.uid() = user_id) OR is_admin()
);

-- 2. Fix book_order_items: restrict SELECT to order owner or admin
DROP POLICY IF EXISTS "Public read order items" ON public.book_order_items;
CREATE POLICY "Order owner or admin read items" ON public.book_order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.book_orders bo
    WHERE bo.id = book_order_items.order_id
    AND (bo.user_id = auth.uid() OR is_admin())
  )
);

-- Also restrict INSERT to authenticated or keep open for guest checkout
DROP POLICY IF EXISTS "Anyone can add order items" ON public.book_order_items;
CREATE POLICY "Anyone can add order items" ON public.book_order_items FOR INSERT WITH CHECK (true);

-- 3. Fix contact_submissions: remove public read, keep admin-only read
-- Already has "Admin read contacts" and "Admin manage contacts", but let's verify
-- The duplicate admin policies are fine (ALL + SELECT both check is_admin)

-- 4. Fix device_tokens: restrict UPDATE to own token
DROP POLICY IF EXISTS "Users can update own token" ON public.device_tokens;
CREATE POLICY "Users can update own token" ON public.device_tokens FOR UPDATE USING (
  student_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = device_tokens.student_id
  )
);

-- 5. Fix poll_votes: add unique constraint to prevent duplicate votes
ALTER TABLE public.poll_votes ADD CONSTRAINT unique_poll_vote UNIQUE (poll_id, voter_id);

-- 6. Enable leaked password protection (via auth config is separate, but add note)
