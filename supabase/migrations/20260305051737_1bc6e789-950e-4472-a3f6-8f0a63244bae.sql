
-- Add missing columns to branches table (merging institutions functionality)
ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS departments text,
  ADD COLUMN IF NOT EXISTS classes text,
  ADD COLUMN IF NOT EXISTS registration_cert_url text,
  ADD COLUMN IF NOT EXISTS approval_letter_url text,
  ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS admin_note text,
  ADD COLUMN IF NOT EXISTS pending_changes jsonb;

-- RLS: Branch owners can update their own branch (limited fields)
CREATE POLICY "Branch owner can update own branch"
ON public.branches
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS: Branch owners can read their own branch
CREATE POLICY "Branch owner can read own branch"
ON public.branches
FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Authenticated users can register (insert) a branch with pending status
CREATE POLICY "Authenticated users can register branch"
ON public.branches
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id AND status = 'pending');
