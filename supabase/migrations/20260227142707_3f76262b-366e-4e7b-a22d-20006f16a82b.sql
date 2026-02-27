
-- Add description column to branches table
ALTER TABLE public.branches ADD COLUMN IF NOT EXISTS description text;

-- Add branch_id to notices table for branch-specific notices
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE;
