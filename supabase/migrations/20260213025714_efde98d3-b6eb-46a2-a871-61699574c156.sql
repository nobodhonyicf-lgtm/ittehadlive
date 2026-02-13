
-- Polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, voter_id)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: everyone can read active polls
CREATE POLICY "Anyone can view active polls" ON public.polls FOR SELECT USING (is_active = true);
-- Admin can manage polls
CREATE POLICY "Admins can manage polls" ON public.polls FOR ALL USING (public.is_admin());

-- Poll votes: anyone can vote (insert)
CREATE POLICY "Anyone can vote" ON public.poll_votes FOR INSERT WITH CHECK (true);
-- Anyone can read votes (for results)
CREATE POLICY "Anyone can view votes" ON public.poll_votes FOR SELECT USING (true);
