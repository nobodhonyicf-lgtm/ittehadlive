
-- Quiz categories (Bengali, English)
CREATE TABLE public.quiz_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text DEFAULT '#10B981',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active quiz categories"
ON public.quiz_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin manage quiz categories"
ON public.quiz_categories FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Quiz levels within each category
CREATE TABLE public.quiz_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.quiz_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order integer DEFAULT 0,
  required_score integer DEFAULT 0,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active quiz levels"
ON public.quiz_levels FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin manage quiz levels"
ON public.quiz_levels FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Quiz questions
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES public.quiz_levels(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'mcq',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer integer NOT NULL DEFAULT 0,
  explanation text,
  points integer DEFAULT 10,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read active quiz questions"
ON public.quiz_questions FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admin manage quiz questions"
ON public.quiz_questions FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- User progress tracking
CREATE TABLE public.quiz_user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES public.quiz_levels(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  best_score integer DEFAULT 0,
  attempts integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, level_id)
);

ALTER TABLE public.quiz_user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own quiz progress"
ON public.quiz_user_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own quiz progress"
ON public.quiz_user_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own quiz progress"
ON public.quiz_user_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin read all quiz progress"
ON public.quiz_user_progress FOR SELECT
TO authenticated
USING (is_admin());
