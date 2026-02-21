-- Drop existing category check constraint and add masala
ALTER TABLE public.islamic_contents DROP CONSTRAINT IF EXISTS islamic_contents_category_check;
ALTER TABLE public.islamic_contents ADD CONSTRAINT islamic_contents_category_check CHECK (category IN ('quran', 'hadith', 'dua', 'iftar', 'masala'));