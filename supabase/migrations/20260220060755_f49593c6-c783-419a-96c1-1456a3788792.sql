-- Add subcategory and reference columns to islamic_contents for topic-based filtering and hadith references
ALTER TABLE public.islamic_contents 
ADD COLUMN IF NOT EXISTS subcategory text,
ADD COLUMN IF NOT EXISTS transliteration text,
ADD COLUMN IF NOT EXISTS meaning text,
ADD COLUMN IF NOT EXISTS reference text,
ADD COLUMN IF NOT EXISTS question text;

-- Add index for faster category + subcategory queries
CREATE INDEX IF NOT EXISTS idx_islamic_contents_category_sub ON public.islamic_contents(category, subcategory);